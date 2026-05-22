import { useState } from "react"
import toast from "react-hot-toast"
import { registerAndSendOtp } from "../../lib/auth"
import { validateSignup, getPasswordStrength } from "../../utils/authValidation"
import { IconEye, IconEyeOff } from "../ui/Icons"

export default function SignupForm({ onLogin, onOtpRequired }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const strength = getPasswordStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = validateSignup({ email, password, confirmPassword, fullName })
    if (!agreed) nextErrors.agreed = "You must accept the terms to continue"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      setLoading(true)
      const result = await registerAndSendOtp({
        email,
        password,
        fullName: fullName.trim(),
      })

      if (!result.ok) {
        if (result.partial && result.email) {
          toast.error(result.error)
          onOtpRequired(result.email)
          return
        }
        toast.error(result.error)
        return
      }

      if (result.via === "tradex") {
        toast.success("TradeX email sent — check your inbox for the 6-digit code")
      } else {
        toast.success("Verification code sent — check your email", { duration: 5000 })
      }
      onOtpRequired(result.email)
    } catch {
      toast.error("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="auth-field">
        <label htmlFor="signup-name">Full name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Alex Morgan"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            setErrors((prev) => ({ ...prev, fullName: undefined }))
          }}
          className={`input-field ${errors.fullName ? "input-field-error" : ""}`}
        />
        {errors.fullName && <p className="auth-field-error">{errors.fullName}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="signup-email">Email address</label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-password">Password</label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 6 characters"
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
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength.score ? strength.color : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-zinc-500">
              Strength: <span className="text-zinc-400">{strength.label}</span>
            </p>
          </div>
        )}
        {errors.password && <p className="auth-field-error">{errors.password}</p>}
      </div>

      <div className="auth-field">
        <label htmlFor="signup-confirm">Confirm password</label>
        <input
          id="signup-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
          }}
          className={`input-field ${errors.confirmPassword ? "input-field-error" : ""}`}
        />
        {errors.confirmPassword && (
          <p className="auth-field-error">{errors.confirmPassword}</p>
        )}
      </div>

      <label className={`auth-checkbox ${errors.agreed ? "auth-checkbox-error" : ""}`}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          I agree to paper-trade with virtual funds only — no real money is used on TradeX.
        </span>
      </label>
      {errors.agreed && <p className="auth-field-error -mt-2">{errors.agreed}</p>}

      <div className="auth-info-box">
        <p className="text-xs text-zinc-400 leading-relaxed">
          We&apos;ll email you from <strong className="text-zinc-300">TradeX</strong> with a{" "}
          <strong className="text-zinc-300">6-digit code</strong> (not a signup link). Enter it on the next screen to play.
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary auth-submit">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="auth-btn-spinner" />
            Sending code…
          </span>
        ) : (
          "Sign up & send verification code"
        )}
      </button>

      <p className="auth-switch">
        Already verified?{" "}
        <button type="button" onClick={onLogin} className="auth-switch-link">
          Sign in
        </button>
      </p>
    </form>
  )
}
