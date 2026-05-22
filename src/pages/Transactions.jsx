import { useStocks } from "../context/StockContext"
import PageHeader from "../components/ui/PageHeader"
import StatCard from "../components/ui/StatCard"
import EmptyState from "../components/ui/EmptyState"
import { IconReceipt } from "../components/ui/Icons"
import { formatCurrency } from "../utils/format"

function Transactions() {
  const { transactions, gameState } = useStocks()

  const buyTrades = transactions.filter((t) => t.type === "BUY").length
  const sellTrades = transactions.filter((t) => t.type === "SELL").length
  const totalVolume = transactions.reduce((t, item) => t + (item.total ?? item.price * (item.qty || 1)), 0)
  const totalFees = transactions.reduce((t, item) => t + (item.fee ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Trade history"
        subtitle="Every fill, fee, and realized profit or loss"
        badge={
          <>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total trades</p>
            <p className="font-mono text-2xl font-bold text-violet-400 mt-1">{transactions.length}</p>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Buy orders" value={buyTrades} accent="green" />
        <StatCard label="Sell orders" value={sellTrades} accent="red" />
        <StatCard label="Volume" value={formatCurrency(totalVolume)} accent="purple" />
        <StatCard
          label="Realized P/L"
          value={formatCurrency(gameState.totalRealizedPL)}
          accent={gameState.totalRealizedPL >= 0 ? "green" : "red"}
        />
      </div>

      {totalFees > 0 && (
        <p className="text-xs text-zinc-500 mb-6">
          Total fees paid: {formatCurrency(totalFees)}
        </p>
      )}

      {transactions.length === 0 ? (
        <EmptyState
          icon={IconReceipt}
          title="No trades yet"
          description="Execute buys and sells from the trading floor or your portfolio."
          actionLabel="Start trading"
          actionTo="/"
        />
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => {
            const isBuy = tx.type === "BUY"
            const qty = tx.qty ?? 1
            return (
              <li key={tx.id ?? `${tx.symbol}-${tx.time}`} className="glass-card glass-card-hover p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono text-sm font-bold ${
                        isBuy
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {isBuy ? "B" : "S"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold uppercase ${
                            isBuy ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className="font-mono text-sm text-zinc-100">{tx.symbol}</span>
                        <span className="text-xs text-zinc-500">×{qty}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{tx.time}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 sm:gap-8 text-sm sm:ml-auto">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Fill price</p>
                      <p className="font-mono font-semibold mt-1">{formatCurrency(tx.price)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total</p>
                      <p className="font-mono font-semibold mt-1">
                        {formatCurrency(tx.total ?? tx.price * qty)}
                      </p>
                    </div>
                    {tx.fee != null && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Fee</p>
                        <p className="font-mono font-semibold mt-1 text-zinc-400">
                          {formatCurrency(tx.fee)}
                        </p>
                      </div>
                    )}
                    {!isBuy && tx.realizedPL != null && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Realized P/L</p>
                        <p
                          className={`font-mono font-semibold mt-1 ${
                            tx.realizedPL >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(tx.realizedPL)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Transactions
