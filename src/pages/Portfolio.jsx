import { useStocks } from "../context/StockContext"
import PageHeader from "../components/ui/PageHeader"
import StatCard from "../components/ui/StatCard"
import EmptyState from "../components/ui/EmptyState"
import { IconBriefcase } from "../components/ui/Icons"
import { formatCurrency, formatPercent } from "../utils/format"

function Portfolio() {
  const {
    portfolio,
    stocks,
    sellStock,
    netWorth,
    portfolioValue,
    unrealizedPL,
    costBasis,
    balance,
  } = useStocks()

  const totalStocksOwned = portfolio.reduce((t, item) => t + item.qty, 0)

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Positions, average cost, and unrealized gains"
        badge={
          <>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Net worth</p>
            <p className="font-mono text-2xl font-bold text-sky-400 mt-1">
              {formatCurrency(netWorth)}
            </p>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Holdings value" value={formatCurrency(portfolioValue)} accent="green" />
        <StatCard label="Cost basis" value={formatCurrency(costBasis)} accent="amber" />
        <StatCard
          label="Unrealized P/L"
          value={formatCurrency(unrealizedPL)}
          accent={unrealizedPL >= 0 ? "green" : "red"}
        />
        <StatCard label="Cash" value={formatCurrency(balance)} accent="cyan" />
      </div>

      {portfolio.length === 0 ? (
        <EmptyState
          icon={IconBriefcase}
          title="No open positions"
          description="Buy shares from the trading floor to build your portfolio and climb the ranks."
          actionLabel="Go to trading floor"
          actionTo="/"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">
            {totalStocksOwned} shares across {portfolio.length} symbol
            {portfolio.length !== 1 ? "s" : ""}
          </p>
          {portfolio.map((item) => {
            const currentPrice = stocks.find((s) => s.symbol === item.symbol)?.price || 0
            const totalValue = currentPrice * item.qty
            const profitLoss = (currentPrice - item.avgCost) * item.qty
            const percentage = ((currentPrice - item.avgCost) / item.avgCost) * 100
            const isUp = percentage >= 0

            return (
              <article key={item.symbol} className="glass-card glass-card-hover p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h2 className="font-mono text-2xl font-bold text-zinc-100">{item.symbol}</h2>
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono ${
                          isUp
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {formatPercent(percentage)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Shares</p>
                        <p className="font-mono font-semibold mt-1">{item.qty}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Avg cost</p>
                        <p className="font-mono font-semibold mt-1">{formatCurrency(item.avgCost)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Last</p>
                        <p className="font-mono font-semibold mt-1 text-sky-400">
                          {formatCurrency(currentPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-6 lg:gap-8 border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-5 lg:pt-0 lg:pl-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Market value</p>
                      <p className="font-mono text-xl font-bold text-emerald-400 mt-1">
                        {formatCurrency(totalValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Unrealized</p>
                      <p
                        className={`font-mono text-xl font-bold mt-1 ${
                          profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(profitLoss)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => sellStock(item.symbol)}
                      className="btn-danger px-5 py-2.5 rounded-xl text-sm"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Portfolio
