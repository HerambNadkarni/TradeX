import { useState, useEffect, useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { verifySignupOtp, resendSignupOtp } from "../../lib/auth"
import OtpInput from "./OtpInput"

const RESEND_COOLDOWN = 60

export default function VerifyOtpForm({ email, onBack = null }) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const verifyingRef = useRef(false)
  const lastAttemptRef = useRef("")

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, mid, domain) => {
        return `${a}${"*".repeat(Math.min(mid.length, 6))}${domain}`
      })
    : ""

  const verify = useCallback(async () => {
    if (!email) {
      toast.error("Missing email. Go back and sign up again.")
      return
    }
    if (otp.length !== 6) {
      toast.error("Enter the full 6-digit code")
      return
    }
    if (verifyingRef.current) return
    if (lastAttemptRef.current === otp) return

    try {
      verifyingRef.current = true
      lastAttemptRef.current = otp
      setLoading(true)

      const result = await verifySignupOtp(email, otp)

      if (!result.ok) {
        lastAttemptRef.current = ""
        toast.error(result.error)
        return
      }

      toast.success("Verified! Loading your trading account…")
    } catch {
      toast.error("Verification failed. Try again.")
    } finally {
      setLoading(false)
      verifyingRef.current = false
    }
  }, [email, otp])

  useEffect(() => {
    if (otp.length === 6 && !loading && email && !verifyingRef.current) {
      const t = setTimeout(() => verify(), 300)
      return () => clearTimeout(t)
    }
  }, [otp, email, loading, verify])

  async function resendCode() {
    if (cooldown > 0 || !email) return

    try {
      setResendLoading(true)
      const result = await resendSignupOtp(email)

      if (!result.ok) {
        toast.error(result.error || "Could not resend code")
        return
      }

      toast.success("New code sent — check your inbox")
      setCooldown(RESEND_COOLDOWN)
      setOtp("")
    } catch {
      toast.error("Could not resend code")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-otp-icon" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-400">
          <path d="M4 4h16v16H4V4Z" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m4 7 8 6 8-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-center text-sm text-zinc-300 font-medium mb-2">
        Almost there — verify your email
      </p>
      <p className="text-center text-sm text-zinc-500 mb-2">
        Enter the <strong className="text-zinc-300">6-digit code</strong> from your TradeX email (not the link).
      </p>
      <p className="text-center text-xs text-zinc-600 mb-6">
        Sent to <span className="text-zinc-400 font-medium">{maskedEmail}</span>
        {" · "}Subject: &quot;Your TradeX verification code&quot;
      </p>

      <OtpInput value={otp} onChange={setOtp} disabled={loading} />

      <button
        type="button"
        onClick={verify}
        disabled={loading || otp.length !== 6}
        className="btn-primary auth-submit mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="auth-btn-spinner" />
            Verifying…
          </span>
        ) : (
          "Verify & start playing"
        )}
      </button>

      <div className="auth-otp-actions">
        <button
          type="button"
          onClick={resendCode}
          disabled={cooldown > 0 || resendLoading}
          className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 disabled:text-zinc-600 disabled:cursor-not-allowed"
        >
          {resendLoading
            ? "Sending…"
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </button>
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Use a different email
          </button>
        )}
      </div>
    </div>
  )
}
