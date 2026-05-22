import { useState } from "react"
import toast from "react-hot-toast"
import { supabase } from "../../supabase"
import { validateLogin } from "../../utils/authValidation"
import { isEmailVerified, savePendingSignup, markOtpPassed } from "../../lib/auth"
import { IconEye, IconEyeOff } from "../ui/Icons"

export default function LoginForm({ onSignup, onForgot, onVerifyEmail }) {
  const [email, setEmail] = useState(() => localStorage.getItem("tradex_remember_email") || "")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(!!localStorage.getItem("tradex_remember_email"))
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validateLogin({ email, password })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      setLoading(true)
      const trimmedEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (error) {
        const msg = error.message.toLowerCase()
        if (msg.includes("email not confirmed") || msg.includes("not verified")) {
          toast.error("Verify your email first — enter the code we sent you.")
          savePendingSignup({ email: trimmedEmail, fullName: "" })
          onVerifyEmail?.(trimmedEmail)
          return
        }
        toast.error(error.message)
        return
      }

      if (data.user && !isEmailVerified(data.user)) {
        await supabase.auth.signOut()
        toast.error("Please verify your email with the 6-digit code first.")
        savePendingSignup({ email: trimmedEmail, fullName: "" })
        onVerifyEmail?.(trimmedEmail)
        return
      }

      if (data.user) markOtpPassed(data.user.id)

      if (remember) {
        localStorage.setItem("tradex_remember_email", trimmedEmail)
      } else {
        localStorage.removeItem("tradex_remember_email")
      }

      toast.success("Welcome back!")
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="auth-field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: undefined }))
          }}
          className={`input-field ${errors.email ? "input-field-error" : ""}`}
        />
        {errors.email && <p className="auth-field-error">{errors.email}</p>}
      </div>

      <div className="auth-field">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="login-password">Password</label>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            className={`input-field pr-12 ${errors.password ? "input-field-error" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="auth-field-error">{errors.password}</p>}
      </div>

      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Remember my email</span>
      </label>

      <button type="submit" disabled={loading} className="btn-primary auth-submit">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="auth-btn-spinner" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="auth-switch">
        New to TradeX?{" "}
        <button type="button" onClick={onSignup} className="auth-switch-link">
          Create an account
        </button>
      </p>
    </form>
  )
}
