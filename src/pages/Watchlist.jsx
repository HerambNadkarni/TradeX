import toast from "react-hot-toast"
import { useStocks } from "../context/StockContext"
import PageHeader from "../components/ui/PageHeader"
import StatCard from "../components/ui/StatCard"
import EmptyState from "../components/ui/EmptyState"
import { IconStar, IconTrendUp, IconTrendDown } from "../components/ui/Icons"
import { formatCurrency, formatPercent } from "../utils/format"

function Watchlist() {
  const { watchlist, setWatchlist, stocks, user, persist } = useStocks()

  const watchlistStocks = stocks.filter((stock) => watchlist.includes(stock.symbol))
  const positiveStocks = watchlistStocks.filter((s) => s.change >= 0).length
  const negativeStocks = watchlistStocks.filter((s) => s.change < 0).length

  function removeFromWatchlist(symbol) {
    const updated = watchlist.filter((item) => item !== symbol)
    setWatchlist(updated)

    if (user?.id) persist({ watchlist: updated })

    toast.success(`${symbol} removed from watchlist`)
  }

  return (
    <div>
      <PageHeader
        title="Watchlist"
        subtitle="Symbols you're tracking — prices update with the market"
        badge={
          <>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Saved</p>
            <p className="font-mono text-2xl font-bold text-amber-400 mt-1">{watchlist.length}</p>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="On watchlist" value={watchlistStocks.length} accent="amber" />
        <StatCard label="Gainers" value={positiveStocks} accent="green" />
        <StatCard label="Losers" value={negativeStocks} accent="red" />
      </div>

      {watchlistStocks.length === 0 ? (
        <EmptyState
          icon={IconStar}
          title="Watchlist is empty"
          description="Add stocks from the dashboard using the “Add to watchlist” button on any card."
          actionLabel="Browse stocks"
          actionTo="/"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {watchlistStocks.map((stock) => {
            const isUp = stock.change >= 0
            return (
              <article
                key={stock.symbol}
                className="glass-card glass-card-hover relative overflow-hidden p-5 sm:p-6"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 ${
                    isUp ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-mono text-xl font-bold">{stock.symbol}</h2>
                      <IconStar className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    </div>
                    <p
                      className={`font-mono text-sm font-semibold mt-2 flex items-center gap-1 ${
                        isUp ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isUp ? (
                        <IconTrendUp className="w-4 h-4" />
                      ) : (
                        <IconTrendDown className="w-4 h-4" />
                      )}
                      {formatPercent(stock.change)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromWatchlist(stock.symbol)}
                    className="text-xs font-semibold text-red-400/90 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <p className="text-xs text-zinc-500 mb-1">Last price</p>
                <p className="font-mono text-2xl font-bold text-zinc-50">
                  {formatCurrency(stock.price)}
                </p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                  <span className="live-dot" />
                  <span className="text-xs text-zinc-500">Live quote</span>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Watchlist
