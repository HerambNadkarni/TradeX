import {
  STARTING_CASH,
  TRADING_FEE_RATE,
  LEVEL_THRESHOLDS,
  RANKS,
  ACHIEVEMENTS,
  DAILY_CHALLENGES,
  XP,
  DEFAULT_GAME_STATE,
} from "./constants"

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function isMarketOpen() {
  const et = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  )
  const day = et.getDay()
  if (day === 0 || day === 6) return false
  const mins = et.getHours() * 60 + et.getMinutes()
  return mins >= 570 && mins < 960
}

export function seedPrice(symbol) {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash * 31 + symbol.charCodeAt(i)) % 100000
  }
  return Math.round((50 + (hash % 950)) * 100) / 100
}

export function calcTradingFee(amount) {
  return Math.round(amount * TRADING_FEE_RATE * 100) / 100
}

export function migratePortfolio(portfolio) {
  if (!Array.isArray(portfolio)) return []
  return portfolio.map((item) => ({
    symbol: item.symbol,
    qty: item.qty,
    avgCost: item.avgCost ?? item.price ?? 0,
  }))
}

export function getHolding(portfolio, symbol) {
  return portfolio.find((p) => p.symbol === symbol)
}

export function calcPortfolioValue(portfolio, stocks) {
  return portfolio.reduce((total, item) => {
    const price = stocks.find((s) => s.symbol === item.symbol)?.price ?? 0
    return total + price * item.qty
  }, 0)
}

export function calcCostBasis(portfolio) {
  return portfolio.reduce((t, item) => t + item.avgCost * item.qty, 0)
}

export function calcNetWorth(balance, portfolio, stocks) {
  return balance + calcPortfolioValue(portfolio, stocks)
}

export function calcUnrealizedPL(portfolio, stocks) {
  const value = calcPortfolioValue(portfolio, stocks)
  const cost = calcCostBasis(portfolio)
  return value - cost
}

export function getLevel(xp) {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const progress =
    nextThreshold === currentThreshold
      ? 1
      : (xp - currentThreshold) / (nextThreshold - currentThreshold)
  return { level, xp, currentThreshold, nextThreshold, progress: Math.min(1, Math.max(0, progress)) }
}

export function getRank(netWorth) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (netWorth >= r.minNetWorth) rank = r
  }
  return rank
}

export function pickDailyChallenges(dateStr) {
  const dayIndex = dateStr.split("-").reduce((a, b) => a + Number(b), 0)
  const picked = []
  for (let i = 0; i < 3; i++) {
    picked.push(DAILY_CHALLENGES[(dayIndex + i * 2) % DAILY_CHALLENGES.length])
  }
  return picked
}

export function initDailyState(portfolio, netWorth, dateStr = todayKey()) {
  return {
    date: dateStr,
    challenges: pickDailyChallenges(dateStr),
    progress: {},
    completed: [],
    morningNetWorth: netWorth,
    tradesToday: 0,
    newBuysToday: 0,
    profitableSellsToday: 0,
    symbolsAtDayStart: portfolio.map((p) => p.symbol),
  }
}

export function ensureDailyState(gameState, portfolio, netWorth) {
  const today = todayKey()
  if (gameState.daily?.date === today) return gameState
  return {
    ...gameState,
    daily: initDailyState(portfolio, netWorth, today),
  }
}

export function mergeGameState(saved) {
  return {
    ...DEFAULT_GAME_STATE,
    ...saved,
    daily: { ...DEFAULT_GAME_STATE.daily, ...saved?.daily },
    unlockedAchievements: saved?.unlockedAchievements ?? [],
  }
}

function applyBuyToPortfolio(portfolio, symbol, qty, price) {
  const existing = getHolding(portfolio, symbol)
  if (existing) {
    const totalQty = existing.qty + qty
    const avgCost =
      (existing.avgCost * existing.qty + price * qty) / totalQty
    return portfolio.map((p) =>
      p.symbol === symbol ? { ...p, qty: totalQty, avgCost } : p
    )
  }
  return [...portfolio, { symbol, qty, avgCost: price }]
}

function applySellToPortfolio(portfolio, symbol, qty) {
  const existing = getHolding(portfolio, symbol)
  if (!existing || existing.qty < qty) return null
  if (existing.qty === qty) {
    return portfolio.filter((p) => p.symbol !== symbol)
  }
  return portfolio.map((p) =>
    p.symbol === symbol ? { ...p, qty: p.qty - qty } : p
  )
}

export function executeBuy({ balance, portfolio }, stock, qty) {
  const price = stock.price
  const gross = price * qty
  const fee = calcTradingFee(gross)
  const total = gross + fee
  if (qty < 1 || !Number.isInteger(qty)) return { ok: false, error: "Invalid quantity" }
  if (balance < total) return { ok: false, error: "Insufficient buying power" }
  const updatedPortfolio = applyBuyToPortfolio(portfolio, stock.symbol, qty, price)
  return {
    ok: true,
    balance: Math.round((balance - total) * 100) / 100,
    portfolio: updatedPortfolio,
    fee,
    gross,
    total,
  }
}

export function executeSell({ balance, portfolio }, stock, qty) {
  const holding = getHolding(portfolio, stock.symbol)
  if (!holding) return { ok: false, error: "You don't own this stock" }
  if (qty < 1 || qty > holding.qty) return { ok: false, error: "Invalid quantity" }
  const price = stock.price
  const gross = price * qty
  const fee = calcTradingFee(gross)
  const proceeds = gross - fee
  const costBasis = holding.avgCost * qty
  const realizedPL = Math.round((proceeds - costBasis) * 100) / 100
  const updatedPortfolio = applySellToPortfolio(portfolio, stock.symbol, qty)
  if (!updatedPortfolio) return { ok: false, error: "Sell failed" }
  return {
    ok: true,
    balance: Math.round((balance + proceeds) * 100) / 100,
    portfolio: updatedPortfolio,
    fee,
    gross,
    proceeds,
    realizedPL,
    costBasis,
  }
}

export function buildTransaction(type, stock, qty, extras = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    symbol: stock.symbol,
    qty,
    price: stock.price,
    fee: extras.fee ?? 0,
    total: extras.total ?? stock.price * qty,
    realizedPL: extras.realizedPL ?? null,
    time: new Date().toLocaleString(),
    timestamp: Date.now(),
  }
}

export function checkAchievements(gameState, ctx) {
  const unlocked = new Set(gameState.unlockedAchievements)
  const newlyUnlocked = []

  const tryUnlock = (id) => {
    if (!unlocked.has(id)) {
      unlocked.add(id)
      newlyUnlocked.push(ACHIEVEMENTS.find((a) => a.id === id))
    }
  }

  if (ctx.totalTrades >= 1) tryUnlock("first_trade")
  if (ctx.totalTrades >= 5) tryUnlock("five_trades")
  if (ctx.totalTrades >= 20) tryUnlock("twenty_trades")
  if (ctx.profitableSells >= 1) tryUnlock("first_profit")
  if (ctx.uniqueHoldings >= 5) tryUnlock("diversified")
  if (ctx.netWorth >= 120_000) tryUnlock("net_120k")
  if (ctx.netWorth >= 200_000) tryUnlock("net_200k")
  if (ctx.bestSellProfit >= 2000) tryUnlock("big_win")
  if (ctx.watchlistCount >= 5) tryUnlock("watchlist_5")

  return {
    unlockedAchievements: [...unlocked],
    newlyUnlocked: newlyUnlocked.filter(Boolean),
  }
}

export function updateDailyProgress(daily, event) {
  const next = { ...daily }
  if (event.type === "trade") next.tradesToday += 1
  if (event.type === "buy_new") next.newBuysToday += 1
  if (event.type === "profit_sell") next.profitableSellsToday += 1
  return next
}

export function evaluateDailyChallenges(gameState, netWorth) {
  const { daily } = gameState
  const completed = new Set(daily.completed)
  const newlyCompleted = []

  for (const ch of daily.challenges) {
    if (completed.has(ch.id)) continue
    let value = 0
    switch (ch.track) {
      case "tradesToday":
        value = daily.tradesToday
        break
      case "newBuysToday":
        value = daily.newBuysToday
        break
      case "profitableSellsToday":
        value = daily.profitableSellsToday
        break
      case "netWorthGainToday":
        value = Math.max(0, netWorth - daily.morningNetWorth)
        break
      default:
        break
    }
    if (value >= ch.target) {
      completed.add(ch.id)
      newlyCompleted.push(ch)
    }
  }

  return {
    daily: { ...daily, completed: [...completed] },
    newlyCompleted,
  }
}

export function calcXpGain(events) {
  let xp = 0
  for (const e of events) {
    if (e === "trade") xp += XP.TRADE
    if (e === "profit_sell") xp += XP.PROFITABLE_SELL
    if (e === "new_high") xp += XP.NEW_HIGH_NET_WORTH
    if (e === "achievement") xp += XP.ACHIEVEMENT
    if (e === "challenge") xp += XP.CHALLENGE
  }
  return xp
}

export function appendPriceHistory(history, symbol, price) {
  const prev = history[symbol] ?? []
  const last = prev[prev.length - 1]
  if (last === price) return history
  const next = [...prev, price].slice(-24)
  return { ...history, [symbol]: next }
}
