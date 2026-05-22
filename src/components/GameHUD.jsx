import { Link } from "react-router-dom"
import { useStocks } from "../context/StockContext"
import { formatCurrency } from "../utils/format"

export default function GameHUD({ compact = false }) {
  const { levelInfo, rank, netWorth, gameState } = useStocks()

  if (compact) {
    return (
      <Link
        to="/missions"
        className="hidden md:flex items-center gap-3 glass-card px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-colors"
      >
        <span className="text-lg">{rank.icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Lv {levelInfo.level}</p>
          <p className="text-xs font-bold text-zinc-200 truncate">{rank.title}</p>
        </div>
        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${levelInfo.progress * 100}%` }}
          />
        </div>
      </Link>
    )
  }

  return (
    <div className="glass-card p-5 mb-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-2xl">
            {rank.icon}
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Player rank</p>
            <p className="text-lg font-bold text-zinc-100">{rank.title}</p>
            <p className="text-sm text-zinc-500">
              Level {levelInfo.level} · {gameState.xp.toLocaleString()} XP
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Next level</span>
            <span>{Math.round(levelInfo.progress * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Net worth</p>
          <p className="font-mono text-xl font-bold text-emerald-400">{formatCurrency(netWorth)}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Peak {formatCurrency(gameState.peakNetWorth)}
          </p>
        </div>
      </div>
    </div>
  )
}
