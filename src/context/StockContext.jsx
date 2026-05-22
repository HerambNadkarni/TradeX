import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import axios from "axios"
import toast from "react-hot-toast"

import { supabase } from "../supabase"
import { stockList } from "../data/stocks"
import {
  STARTING_CASH,
  DEFAULT_SYMBOLS,
  DEFAULT_GAME_STATE,
  REFRESH_MS_MARKET_OPEN,
  REFRESH_MS_MARKET_CLOSED,
  ACHIEVEMENTS,
} from "../game/constants"
import {
  migratePortfolio,
  calcNetWorth,
  calcPortfolioValue,
  calcCostBasis,
  calcUnrealizedPL,
  getLevel,
  getRank,
  executeBuy,
  executeSell,
  buildTransaction,
  checkAchievements,
  updateDailyProgress,
  evaluateDailyChallenges,
  calcXpGain,
  ensureDailyState,
  mergeGameState,
  appendPriceHistory,
  seedPrice,
  isMarketOpen,
  todayKey,
} from "../game/engine"
import { loadUserData, saveUserData } from "../game/persistence"

const StockContext = createContext()

export function StockProvider({ children }) {
  const [suggestions, setSuggestions] = useState([])
  const [stocks, setStocks] = useState([])
  const [balance, setBalance] = useState(STARTING_CASH)
  const [portfolio, setPortfolio] = useState([])
  const [transactions, setTransactions] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [search, setSearch] = useState("")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS)
  const [gameState, setGameState] = useState(DEFAULT_GAME_STATE)
  const [priceHistory, setPriceHistory] = useState({})
  const [dataReady, setDataReady] = useState(false)

  const [tradeModal, setTradeModal] = useState({
    open: false,
    mode: "buy",
    stock: null,
  })

  const stocksRef = useRef(stocks)
  stocksRef.current = stocks
  const priceHistoryRef = useRef(priceHistory)
  priceHistoryRef.current = priceHistory

  const marketOpen = isMarketOpen()

  const persist = useCallback(
    (patch) => {
      if (!user?.id) return
      saveUserData(user.id, patch)
    },
    [user]
  )

  const applyGameRewards = useCallback((prevGame, events, ctx) => {
    let next = { ...prevGame }
    let xpGain = calcXpGain(events)

    const ach = checkAchievements(next, ctx)
    next.unlockedAchievements = ach.unlockedAchievements
    for (const a of ach.newlyUnlocked) {
      xpGain += a.xp
      toast.success(`Achievement: ${a.title} (+${a.xp} XP)`, { duration: 4000 })
    }

    if (ctx.netWorth > next.peakNetWorth) {
      next.peakNetWorth = ctx.netWorth
      if (ctx.netWorth > ctx.prevPeak) {
        xpGain += calcXpGain(["new_high"])
        toast.success("New net worth high!", { icon: "📈" })
      }
    }

    const dailyEval = evaluateDailyChallenges(next, ctx.netWorth)
    next.daily = dailyEval.daily
    for (const ch of dailyEval.newlyCompleted) {
      xpGain += ch.xp
      toast.success(`Daily complete: ${ch.title} (+${ch.xp} XP)`, { duration: 4000 })
    }

    next.xp += xpGain
    return next
  }, [])

  // Search debounce
  useEffect(() => {
    async function searchStocks() {
      if (search.length < 2) {
        setSuggestions([])
        return
      }
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/search?q=${search}&token=${import.meta.env.VITE_FINNHUB_API_KEY}`
        )
        setSuggestions(response.data.result?.slice(0, 10) ?? [])
      } catch {
        setSuggestions([])
      }
    }
    const timer = setTimeout(searchStocks, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Auth user - listen to auth state changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        // Reset data on logout
        setBalance(STARTING_CASH)
        setPortfolio([])
        setTransactions([])
        setWatchlist([])
        setGameState(DEFAULT_GAME_STATE)
        setDataReady(false)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  // Load saved data
  useEffect(() => {
    if (!user?.id) return

    try {
      const saved = loadUserData(user.id)
      
      if (saved) {
        if (saved.symbols) setSymbols(saved.symbols)
        if (saved.balance != null) setBalance(saved.balance)
        
        const loadedPortfolio = Array.isArray(saved.portfolio) ? saved.portfolio : []
        if (loadedPortfolio.length > 0) {
          setPortfolio(migratePortfolio(loadedPortfolio))
        }
        
        if (saved.transactions && Array.isArray(saved.transactions)) setTransactions(saved.transactions)
        if (saved.watchlist && Array.isArray(saved.watchlist)) setWatchlist(saved.watchlist)
        if (saved.priceHistory && typeof saved.priceHistory === 'object') setPriceHistory(saved.priceHistory)
        
        const merged = mergeGameState(saved.game)
        const port = Array.isArray(saved.portfolio) ? migratePortfolio(saved.portfolio) : []
        const bal = saved.balance ?? STARTING_CASH
        const nw = calcNetWorth(bal, port, [])
        setGameState(ensureDailyState(merged, port, nw))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
    
    setDataReady(true)
  }, [user?.id])

  // Persist watchlist
  useEffect(() => {
    if (!user?.id || !dataReady) return
    persist({ watchlist })
  }, [watchlist, user, dataReady, persist])

  // Persist portfolio & balance whenever they change
  useEffect(() => {
    if (!user?.id || !dataReady) return
    persist({ portfolio, balance, transactions })
  }, [portfolio, balance, transactions, user, dataReady, persist])

  // Fetch quotes
  useEffect(() => {
    if (!symbols.length) return

    async function fetchStocks() {
      setLoading(true)
      const priceCache = {}

      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const response = await axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${import.meta.env.VITE_FINNHUB_API_KEY}`
            )
            if (response.data?.c && response.data.c !== 0) {
              return {
                symbol,
                price: response.data.c,
                change: response.data.dp || 0,
                previousClose: response.data.pc,
              }
            }
          } catch {
            /* fallback below */
          }
          const hist = priceHistoryRef.current[symbol]
          const cached =
            stocksRef.current.find((s) => s.symbol === symbol)?.price ??
            hist?.[hist.length - 1]
          const stable = cached ?? seedPrice(symbol)
          return {
            symbol,
            price: stable,
            change: Number((Math.random() * 4 - 2).toFixed(2)),
            simulated: true,
          }
        })
      )

      setStocks(results)
      setPriceHistory((prev) => {
        let next = prev
        for (const s of results) {
          next = appendPriceHistory(next, s.symbol, s.price)
          priceCache[s.symbol] = next[s.symbol]
        }
        if (user?.id) persist({ priceHistory: next })
        return next
      })
      setLoading(false)
    }

    fetchStocks()
    const ms = marketOpen ? REFRESH_MS_MARKET_OPEN : REFRESH_MS_MARKET_CLOSED
    const interval = setInterval(fetchStocks, ms)
    return () => clearInterval(interval)
  }, [symbols, marketOpen])

  const netWorth = useMemo(
    () => calcNetWorth(balance, portfolio, stocks),
    [balance, portfolio, stocks]
  )

  const portfolioValue = useMemo(
    () => calcPortfolioValue(portfolio, stocks),
    [portfolio, stocks]
  )

  const unrealizedPL = useMemo(
    () => calcUnrealizedPL(portfolio, stocks),
    [portfolio, stocks]
  )

  const levelInfo = useMemo(() => getLevel(gameState.xp), [gameState.xp])
  const rank = useMemo(() => getRank(netWorth), [netWorth])

  const achievements = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => ({
        ...a,
        unlocked: gameState.unlockedAchievements.includes(a.id),
      })),
    [gameState.unlockedAchievements]
  )

  const dailyChallenges = useMemo(() => {
    const daily = gameState.daily
    return (daily.challenges ?? []).map((ch) => {
      let current = 0
      switch (ch.track) {
        case "tradesToday":
          current = daily.tradesToday
          break
        case "newBuysToday":
          current = daily.newBuysToday
          break
        case "profitableSellsToday":
          current = daily.profitableSellsToday
          break
        case "netWorthGainToday":
          current = Math.max(0, netWorth - daily.morningNetWorth)
          break
        default:
          break
      }
      return {
        ...ch,
        current,
        done: daily.completed.includes(ch.id),
        progress: Math.min(1, current / ch.target),
      }
    })
  }, [gameState.daily, netWorth])

  function saveAll(state) {
    persist({
      balance: state.balance,
      portfolio: state.portfolio,
      transactions: state.transactions,
      game: state.game,
      symbols: state.symbols,
    })
  }

  function openTrade(stock, mode = "buy") {
    setTradeModal({ open: true, mode, stock })
  }

  function closeTrade() {
    setTradeModal({ open: false, mode: "buy", stock: null })
  }

  function confirmTrade(qty) {
    const { stock, mode } = tradeModal
    if (!stock) return
    if (mode === "buy") buyStock(stock, qty)
    else sellStock(stock.symbol, qty)
    closeTrade()
  }

  function buyStock(stock, qty = 1) {
    const result = executeBuy({ balance, portfolio }, stock, qty)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    const hadPosition = portfolio.some((p) => p.symbol === stock.symbol)
    const isNewToday =
      !hadPosition && !gameState.daily.symbolsAtDayStart.includes(stock.symbol)

    const tx = buildTransaction("BUY", stock, qty, {
      fee: result.fee,
      total: result.total,
    })

    const updatedTransactions = [tx, ...transactions]
    const prevPeak = gameState.peakNetWorth

    let nextGame = {
      ...gameState,
      totalTrades: gameState.totalTrades + 1,
    }
    nextGame.daily = updateDailyProgress(nextGame.daily, { type: "trade" })
    if (isNewToday) {
      nextGame.daily = updateDailyProgress(nextGame.daily, { type: "buy_new" })
    }

    const newPortfolio = result.portfolio
    const newBalance = result.balance
    const nw = calcNetWorth(newBalance, newPortfolio, stocks)

    nextGame = applyGameRewards(nextGame, ["trade"], {
      totalTrades: nextGame.totalTrades,
      profitableSells: transactions.filter((t) => t.realizedPL > 0).length,
      uniqueHoldings: newPortfolio.length,
      netWorth: nw,
      prevPeak,
      watchlistCount: watchlist.length,
      bestSellProfit: Math.max(
        0,
        ...transactions.map((t) => t.realizedPL ?? 0)
      ),
    })

    setBalance(newBalance)
    setPortfolio(newPortfolio)
    setTransactions(updatedTransactions)
    setGameState(nextGame)
    saveAll({
      balance: newBalance,
      portfolio: newPortfolio,
      transactions: updatedTransactions,
      game: nextGame,
      symbols,
    })

    toast.success(`Bought ${qty} ${stock.symbol} · Fee ${result.fee.toFixed(2)}`)
  }

  function sellStock(symbol, qty = 1) {
    const stock = stocks.find((s) => s.symbol === symbol)
    if (!stock) {
      toast.error("Price unavailable")
      return
    }

    const result = executeSell({ balance, portfolio }, stock, qty)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    const tx = buildTransaction("SELL", stock, qty, {
      fee: result.fee,
      total: result.proceeds,
      realizedPL: result.realizedPL,
    })

    const updatedTransactions = [tx, ...transactions]
    const prevPeak = gameState.peakNetWorth
    const profitable = result.realizedPL > 0

    let nextGame = {
      ...gameState,
      totalTrades: gameState.totalTrades + 1,
      totalRealizedPL: gameState.totalRealizedPL + result.realizedPL,
    }
    nextGame.daily = updateDailyProgress(nextGame.daily, { type: "trade" })
    if (profitable) {
      nextGame.daily = updateDailyProgress(nextGame.daily, { type: "profit_sell" })
    }

    const newPortfolio = result.portfolio
    const newBalance = result.balance
    const nw = calcNetWorth(newBalance, newPortfolio, stocks)

    const xpEvents = ["trade"]
    if (profitable) xpEvents.push("profit_sell")

    nextGame = applyGameRewards(nextGame, xpEvents, {
      totalTrades: nextGame.totalTrades,
      profitableSells:
        transactions.filter((t) => (t.realizedPL ?? 0) > 0).length +
        (profitable ? 1 : 0),
      uniqueHoldings: newPortfolio.length,
      netWorth: nw,
      prevPeak,
      watchlistCount: watchlist.length,
      bestSellProfit: Math.max(
        result.realizedPL,
        ...transactions.map((t) => t.realizedPL ?? 0)
      ),
    })

    setBalance(newBalance)
    setPortfolio(newPortfolio)
    setTransactions(updatedTransactions)
    setGameState(nextGame)
    saveAll({
      balance: newBalance,
      portfolio: newPortfolio,
      transactions: updatedTransactions,
      game: nextGame,
      symbols,
    })

    const plLabel =
      result.realizedPL >= 0
        ? `+$${result.realizedPL.toFixed(2)}`
        : `-$${Math.abs(result.realizedPL).toFixed(2)}`
    toast.success(`Sold ${qty} ${symbol} · P/L ${plLabel}`)
  }

  function requestBuy(stock) {
    openTrade(stock, "buy")
  }

  function requestSell(symbol) {
    const stock = stocks.find((s) => s.symbol === symbol)
    if (stock) openTrade(stock, "sell")
  }

  function removeStock(symbol) {
    const holding = portfolio.find((p) => p.symbol === symbol)
    if (holding) {
      toast.error("Sell your position before removing this symbol")
      return
    }

    const updatedSymbols = symbols.filter((s) => s !== symbol)
    setSymbols(updatedSymbols)
    setStocks((prev) => prev.filter((s) => s.symbol !== symbol))
    persist({ symbols: updatedSymbols })
    toast.success(`${symbol} removed from dashboard`)
  }

  async function addStock() {
    const formatted = search.toUpperCase().trim()
    if (!formatted) return

    const stockExists = stockList.find((stock) => {
      const sym = stock.symbol.toUpperCase()
      const name = stock.name.toUpperCase()
      return sym === formatted || name === formatted
    })

    if (!stockExists) {
      toast.error("Stock not available in our list")
      return
    }

    if (symbols.some((s) => s.toUpperCase() === stockExists.symbol.toUpperCase())) {
      toast.error("Stock already on your dashboard")
      return
    }

    const updatedSymbols = [...symbols, stockExists.symbol]
    setSymbols(updatedSymbols)
    persist({ symbols: updatedSymbols })
    setSearch("")
    toast.success(`${stockExists.symbol} added to dashboard`)
  }

  function dismissTutorial() {
    const next = { ...gameState, tutorialSeen: true }
    setGameState(next)
    persist({ game: next })
  }

  function resetGame() {
    const fresh = { ...DEFAULT_GAME_STATE, tutorialSeen: true, daily: ensureDailyState(DEFAULT_GAME_STATE, [], STARTING_CASH).daily }
    setBalance(STARTING_CASH)
    setPortfolio([])
    setTransactions([])
    setWatchlist([])
    setSymbols(DEFAULT_SYMBOLS)
    setGameState(fresh)
    setPriceHistory({})
    if (user?.id) {
      saveUserData(user.id, {
        balance: STARTING_CASH,
        portfolio: [],
        transactions: [],
        watchlist: [],
        symbols: DEFAULT_SYMBOLS,
        game: fresh,
        priceHistory: {},
      })
    }
    toast.success("Game reset — good luck!")
  }

  const tradeMaxQty = useMemo(() => {
    if (!tradeModal.stock) return 1
    if (tradeModal.mode === "buy") return 9999
    const h = portfolio.find((p) => p.symbol === tradeModal.stock.symbol)
    return h?.qty ?? 0
  }, [tradeModal, portfolio])

  return (
    <StockContext.Provider
      value={{
        stocks,
        balance,
        portfolio,
        transactions,
        watchlist,
        setWatchlist,
        search,
        setSearch,
        addStock,
        buyStock: requestBuy,
        sellStock: requestSell,
        removeStock,
        portfolioValue,
        netWorth,
        unrealizedPL,
        costBasis: calcCostBasis(portfolio),
        loading,
        suggestions,
        user,
        gameState,
        levelInfo,
        rank,
        achievements,
        dailyChallenges,
        marketOpen,
        priceHistory,
        openTrade,
        tradeModal,
        closeTrade,
        confirmTrade,
        tradeMaxQty,
        dismissTutorial,
        resetGame,
        persist,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStocks() {
  return useContext(StockContext)
}
