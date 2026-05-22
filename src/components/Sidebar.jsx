import { Link, useLocation } from "react-router-dom"
import {
  IconChart,
  IconBriefcase,
  IconReceipt,
  IconStar,
  IconLogo,
  IconWallet,
  IconTrophy,
} from "./ui/Icons"
import { useStocks } from "../context/StockContext"
import { formatCurrency } from "../utils/format"

const links = [
  { name: "Trade", path: "/", Icon: IconChart },
  { name: "Portfolio", path: "/portfolio", Icon: IconBriefcase },
  { name: "Missions", path: "/missions", Icon: IconTrophy },
  { name: "History", path: "/transactions", Icon: IconReceipt },
  { name: "Watchlist", path: "/watchlist", Icon: IconStar },
]

function Sidebar() {
  const location = useLocation()
  const { netWorth, rank, levelInfo } = useStocks()

  return (
    <>
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen border-r border-white/[0.06] bg-[#0c0c12]/60 backdrop-blur-xl p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <IconLogo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-extrabold text-gradient leading-tight">TradeX</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Paper Trading</p>
          </div>
        </div>

        <div className="glass-card flex items-center gap-3 px-4 py-3 mb-8 rounded-xl">
          <span className="live-dot" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Market status</p>
            <p className="text-sm font-semibold text-emerald-400">Live simulation</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map(({ name, path, Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-emerald-400" : ""}`} />
                {name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto glass-card p-5 rounded-xl border-emerald-500/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{rank.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-200 truncate">{rank.title}</p>
              <p className="text-[10px] text-zinc-500">Level {levelInfo.level}</p>
            </div>
          </div>
          <p className="font-mono text-sm font-bold text-emerald-400">{formatCurrency(netWorth)}</p>
          <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
            <IconWallet className="w-3 h-3" /> Paper trading · no real money
          </p>
        </div>
      </aside>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0c0c12]/95 backdrop-blur-xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {links.map(({ name, path, Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors ${
                  active ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Sidebar
