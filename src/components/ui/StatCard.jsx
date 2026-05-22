export default function StatCard({ label, value, trend, accent = "default" }) {
  const accents = {
    default: "text-zinc-100",
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-sky-400",
    amber: "text-amber-400",
    cyan: "text-cyan-400",
    purple: "text-violet-400",
  }

  return (
    <div className="glass-card glass-card-hover p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
        {label}
      </p>
      <p className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${accents[accent] || accents.default}`}>
        {value}
      </p>
      {trend !== undefined && (
        <p className={`text-sm font-semibold mt-2 ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(2)}%
        </p>
      )}
    </div>
  )
}
