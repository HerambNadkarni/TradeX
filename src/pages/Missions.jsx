import { useStocks } from "../context/StockContext"
import PageHeader from "../components/ui/PageHeader"
import GameHUD from "../components/GameHUD"
import { formatCurrency } from "../utils/format"
import { STARTING_CASH } from "../game/constants"

function Missions() {
  const {
    achievements,
    dailyChallenges,
    gameState,
    netWorth,
    rank,
    levelInfo,
    resetGame,
    marketOpen,
  } = useStocks()

  const returnPct = ((netWorth - STARTING_CASH) / STARTING_CASH) * 100

  return (
    <div>
      <PageHeader
        title="Missions & Progress"
        subtitle="Level up, complete daily challenges, and unlock achievements"
        badge={
          <>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Return</p>
            <p
              className={`font-mono text-2xl font-bold mt-1 ${
                returnPct >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {returnPct >= 0 ? "+" : ""}
              {returnPct.toFixed(1)}%
            </p>
          </>
        }
      />

      <GameHUD />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-zinc-100 mb-1">Career stats</h2>
          <p className="text-xs text-zinc-500 mb-5">Your lifetime performance</p>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-zinc-500 text-xs">Total trades</dt>
              <dd className="font-mono font-bold text-lg mt-1">{gameState.totalTrades}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Realized P/L</dt>
              <dd
                className={`font-mono font-bold text-lg mt-1 ${
                  gameState.totalRealizedPL >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatCurrency(gameState.totalRealizedPL)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Peak net worth</dt>
              <dd className="font-mono font-bold text-lg mt-1 text-amber-400">
                {formatCurrency(gameState.peakNetWorth)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Market</dt>
              <dd className="font-semibold text-lg mt-1 flex items-center gap-2">
                <span className={marketOpen ? "live-dot" : "w-2 h-2 rounded-full bg-zinc-500"} />
                {marketOpen ? "Open (US)" : "After hours"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-zinc-100 mb-1">Current rank</h2>
          <p className="text-xs text-zinc-500 mb-5">Based on net worth</p>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{rank.icon}</span>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{rank.title}</p>
              <p className="text-sm text-zinc-500 mt-1">
                Level {levelInfo.level} · {gameState.xp.toLocaleString()} XP total
              </p>
              <p className="text-xs text-emerald-400/80 mt-2 font-mono">
                Net worth {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-zinc-100 mb-4">Daily challenges</h2>
        <p className="text-xs text-zinc-500 mb-4">Resets at midnight · Complete for bonus XP</p>
        <div className="grid gap-3">
          {dailyChallenges.map((ch) => (
            <div
              key={ch.id}
              className={`glass-card p-5 rounded-xl ${
                ch.done ? "border-emerald-500/30 bg-emerald-500/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-zinc-100">{ch.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{ch.desc}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${
                    ch.done
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {ch.done ? "Done" : `+${ch.xp} XP`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${ch.progress * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                {Math.min(ch.current, ch.target)} / {ch.target}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-zinc-100 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`glass-card p-4 rounded-xl ${
                a.unlocked ? "border-amber-500/20" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-zinc-100">{a.title}</p>
                <span className="text-lg">{a.unlocked ? "✓" : "🔒"}</span>
              </div>
              <p className="text-xs text-zinc-500">{a.desc}</p>
              <p className="text-[10px] text-amber-400/80 mt-2 font-semibold">+{a.xp} XP</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 pt-8 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all progress, portfolio, and stats?")) resetGame()
          }}
          className="btn-secondary px-5 py-2.5 rounded-xl text-sm text-zinc-400"
        >
          Reset entire game
        </button>
      </div>
    </div>
  )
}

export default Missions
