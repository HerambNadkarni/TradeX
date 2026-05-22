import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { formatCurrency } from "../utils/format"

function StockChart({ stocks }) {
  const data = stocks.map((stock) => ({
    name: stock.symbol,
    price: stock.price,
    change: stock.change,
  }))

  const positiveStocks = stocks.filter((s) => s.change >= 0).length
  const negativeStocks = stocks.filter((s) => s.change < 0).length

  function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const item = payload[0].payload
    const up = item.change >= 0

    return (
      <div className="glass-card px-4 py-3 rounded-xl shadow-xl">
        <p className="font-mono font-bold text-sm text-zinc-100">{item.name}</p>
        <p className={`font-mono text-lg font-semibold mt-1 ${up ? "text-emerald-400" : "text-red-400"}`}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    )
  }

  return (
    <section className="glass-card p-6 sm:p-8 mb-8 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Market overview</h2>
          <p className="text-sm text-zinc-500 mt-1">Price snapshot across your tracked symbols</p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Gainers</p>
            <p className="font-mono text-xl font-bold text-emerald-400">{positiveStocks}</p>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Losers</p>
            <p className="font-mono text-xl font-bold text-red-400">{negativeStocks}</p>
          </div>
        </div>
      </div>

      <div className="relative h-[220px] sm:h-[320px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Add stocks to see the chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#71717a", fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11, fontFamily: "JetBrains Mono" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
                width={56}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(16,185,129,0.3)" }} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#34d399", stroke: "#0c0c12", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default StockChart
