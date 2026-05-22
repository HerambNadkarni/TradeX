import { supabase } from "../supabase"
import { IconLogOut, IconLogo } from "./ui/Icons"
import GameHUD from "./GameHUD"
import { useStocks } from "../context/StockContext"

function Navbar() {
  const { marketOpen } = useStocks()

  async function logout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0c0c12]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 md:px-8 lg:px-10 h-16">
        <div className="flex items-center gap-3 lg:hidden">
          <IconLogo className="w-9 h-9" />
          <div>
            <h1 className="text-lg font-bold text-gradient leading-none">TradeX</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">Virtual Trading</p>
          </div>
        </div>

        <div className="hidden lg:block flex-1" />

        <div className="flex items-center gap-3 ml-auto">
          <GameHUD compact />
          <div className="hidden sm:flex items-center gap-2.5 glass-card px-4 py-2 rounded-xl">
            <span className={marketOpen ? "live-dot" : "w-2 h-2 rounded-full bg-zinc-500"} aria-hidden />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 leading-none">Market</p>
              <p className={`text-xs font-semibold mt-0.5 ${marketOpen ? "text-emerald-400" : "text-zinc-400"}`}>
                {marketOpen ? "Open" : "Closed"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            aria-label="Log out"
          >
            <IconLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
