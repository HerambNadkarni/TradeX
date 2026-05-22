import { useStocks } from "../context/StockContext"
import { STARTING_CASH, TRADING_FEE_RATE } from "../game/constants"
import { formatCurrency } from "../utils/format"

export default function TutorialModal() {
  const { gameState, dismissTutorial, resetGame } = useStocks()

  if (gameState.tutorialSeen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl">
        <h2 className="text-2xl font-extrabold text-gradient mb-2">Welcome to TradeX</h2>
        <p className="text-zinc-400 text-sm mb-6">
          A virtual trading game. Grow your net worth, level up, and complete daily missions.
        </p>

        <ul className="space-y-3 text-sm text-zinc-300 mb-8">
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">$</span>
            <span>You start with {formatCurrency(STARTING_CASH)} in paper money.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">%</span>
            <span>Each trade has a {(TRADING_FEE_RATE * 100).toFixed(1)}% fee — plan your entries and exits.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">↑</span>
            <span>
              <strong className="text-zinc-100">Net worth</strong> = cash + portfolio value. That is your score.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">★</span>
            <span>Earn XP from trades, profitable sells, achievements, and daily missions.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold">◎</span>
            <span>Climb ranks from Intern to Wall Street Legend as your net worth grows.</span>
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={dismissTutorial} className="flex-1 btn-primary py-3 rounded-xl text-sm">
            Start trading
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all progress and start fresh?")) resetGame()
            }}
            className="flex-1 btn-secondary py-3 rounded-xl text-sm text-zinc-400"
          >
            Reset game
          </button>
        </div>
      </div>
    </div>
  )
}
