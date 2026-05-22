import { formatCurrency, formatPercent } from "../utils/format"
import { IconTrendUp, IconTrendDown } from "./ui/Icons"

function StockCard({ stock, holding, onBuy, onWatchlist, inWatchlist }) {
  const isPositive = stock.change >= 0

  return (
    <div className="glass-card glass-card-hover relative overflow-hidden p-5 sm:p-6 h-full flex flex-col">
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 ${
          isPositive ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="font-mono text-xl sm:text-2xl font-bold text-zinc-100 truncate">
            {stock.symbol}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-xs font-semibold ${
              isPositive
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {isPositive ? (
              <IconTrendUp className="w-3.5 h-3.5" />
            ) : (
              <IconTrendDown className="w-3.5 h-3.5" />
            )}
            {formatPercent(stock.change)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="live-dot" />
          <span className="text-[10px] font-semibold text-emerald-400/80 uppercase">Live</span>
        </div>
      </div>

      <div className="flex-1 mb-5">
        <p className="text-xs text-zinc-500 mb-1">Last price</p>
        <p className="font-mono text-2xl sm:text-3xl font-bold text-zinc-50">
          {formatCurrency(stock.price)}
        </p>
        {holding && (
          <p className="text-xs text-zinc-500 mt-2">
            You own <span className="text-zinc-300 font-mono font-semibold">{holding.qty}</span>
            {" · "}avg {formatCurrency(holding.avgCost)}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/[0.06]">
        {onWatchlist && (
          <button
            type="button"
            onClick={() => onWatchlist(stock)}
            disabled={inWatchlist}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              inWatchlist
                ? "bg-amber-500/10 text-amber-400/60 cursor-default"
                : "btn-secondary"
            }`}
          >
            {inWatchlist ? "Watching" : "Watchlist"}
          </button>
        )}
        <button
          type="button"
          onClick={() => onBuy(stock)}
          className="flex-1 btn-primary py-2.5 rounded-xl text-xs sm:text-sm"
        >
          Trade
        </button>
      </div>
    </div>
  )
}

export default StockCard
