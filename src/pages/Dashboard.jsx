import toast from "react-hot-toast"
import StockCard from "../components/StockCard"
import StockChart from "../components/StockChart"
import GameHUD from "../components/GameHUD"
import PageHeader from "../components/ui/PageHeader"
import StatCard from "../components/ui/StatCard"
import { IconSearch, IconPlus, IconX } from "../components/ui/Icons"
import { useStocks } from "../context/StockContext"
import { formatCurrency } from "../utils/format"

function Dashboard() {
  const {
    watchlist,
    setWatchlist,
    stocks,
    balance,
    portfolio,
    netWorth,
    unrealizedPL,
    search,
    setSearch,
    addStock,
    removeStock,
    buyStock,
    suggestions,
    loading,
    user,
    marketOpen,
    persist,
  } = useStocks()

  const totalStocksOwned = portfolio.reduce((t, item) => t + item.qty, 0)

  function addToWatchlist(stock) {
    if (watchlist.includes(stock.symbol)) return
    const updated = [...watchlist, stock.symbol]
    setWatchlist(updated)
    if (user?.id) persist({ watchlist: updated })
    toast.success(`${stock.symbol} added to watchlist`)
  }

  return (
    <div>
      <PageHeader
        title="Trading floor"
        subtitle={
          marketOpen
            ? "US market hours — prices refresh every minute"
            : "After hours — prices refresh every 3 minutes"
        }
        badge={
          <>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Buying power</p>
            <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(balance)}
            </p>
          </>
        }
      />

      <GameHUD />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Net worth" value={formatCurrency(netWorth)} accent="green" />
        <StatCard
          label="Unrealized P/L"
          value={formatCurrency(unrealizedPL)}
          accent={unrealizedPL >= 0 ? "green" : "red"}
        />
        <StatCard label="Cash" value={formatCurrency(balance)} accent="cyan" />
        <StatCard label="Shares held" value={totalStocksOwned} accent="blue" />
      </div>

      <StockChart stocks={stocks} />

      <div className="mb-8">
        <label htmlFor="stock-search" className="sr-only">
          Search stocks
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
            <input
              id="stock-search"
              type="text"
              placeholder="Search AAPL, TSLA, RELIANCE…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <button
            type="button"
            onClick={addStock}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm shrink-0"
          >
            <IconPlus className="w-4 h-4" />
            Add symbol
          </button>
        </div>

        {suggestions.length > 0 && (
          <ul className="mt-3 glass-card rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/[0.06]">
            {suggestions.map((item) => (
              <li key={item.symbol}>
                <button
                  type="button"
                  onClick={() => setSearch(item.symbol)}
                  className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="font-mono font-semibold text-sm text-zinc-100">{item.symbol}</span>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.description}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && stocks.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="loader-ring" />
          <p className="text-sm text-zinc-500">Fetching live market data…</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="relative group">
            <button
              type="button"
              onClick={() => removeStock(stock.symbol)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-200 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${stock.symbol}`}
            >
              <IconX />
            </button>

            <StockCard
              stock={stock}
              holding={portfolio.find((p) => p.symbol === stock.symbol)}
              onBuy={buyStock}
              onWatchlist={addToWatchlist}
              inWatchlist={watchlist.includes(stock.symbol)}
            />
          </div>
        ))}
      </div>

      {!loading && stocks.length === 0 && (
        <p className="text-center text-zinc-500 text-sm py-12">
          Search and add symbols above to start your trading career.
        </p>
      )}
    </div>
  )
}

export default Dashboard
