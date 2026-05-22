import { IconLogo } from "../ui/Icons"
import { STARTING_CASH } from "../../game/constants"
import { formatCurrency } from "../../utils/format"

const highlights = [
  { title: "Live market data", desc: "Real quotes on 100+ symbols" },
  { title: "Paper trading", desc: `${formatCurrency(STARTING_CASH)} virtual cash` },
  { title: "Level up", desc: "XP, ranks, daily missions" },
  { title: "Zero risk", desc: "Practice without real money" },
]

export default function AuthLayout({ children, title, subtitle, view }) {
  return (
    <div className="auth-page min-h-screen app-shell">
      <div className="auth-split">
        <aside className="auth-hero hidden lg:flex">
          <div className="auth-hero-inner">
            <div className="flex items-center gap-3 mb-12">
              <IconLogo className="w-11 h-11" />
              <div>
                <p className="text-xl font-extrabold text-gradient">TradeX</p>
                <p className="text-xs text-zinc-500">Virtual trading game</p>
              </div>
            </div>

            <h2 className="auth-hero-title">
              {view === "signup" || view === "verify-otp"
                ? "Start your trading career"
                : "Welcome back, trader"}
            </h2>
            <p className="auth-hero-desc">
              {view === "signup" || view === "verify-otp"
                ? "Create an account, verify your email, and compete to grow your net worth from Intern to Wall Street Legend."
                : "Sign in to continue your portfolio, missions, and live market simulation."}
            </p>

            <ul className="auth-feature-list">
              {highlights.map((item) => (
                <li key={item.title} className="auth-feature-item">
                  <span className="auth-feature-dot" />
                  <div>
                    <p className="font-semibold text-zinc-200 text-sm">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="auth-hero-stats">
              <div>
                <p className="auth-stat-value">$100K</p>
                <p className="auth-stat-label">Starting balance</p>
              </div>
              <div>
                <p className="auth-stat-value">0.1%</p>
                <p className="auth-stat-label">Trading fee</p>
              </div>
              <div>
                <p className="auth-stat-value">24/7</p>
                <p className="auth-stat-label">Practice mode</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="auth-form-panel">
          <div className="auth-form-panel-inner">
            <div className="lg:hidden text-center mb-8">
              <IconLogo className="w-14 h-14 mx-auto mb-4" />
              <h1 className="text-2xl font-extrabold text-gradient">TradeX</h1>
            </div>

            {(title || subtitle) && (
              <header className="auth-form-header">
                {title && <h1 className="auth-form-title">{title}</h1>}
                {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
              </header>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
