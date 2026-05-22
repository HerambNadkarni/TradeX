import { useState } from "react"
import toast from "react-hot-toast"
import { supabase } from "../../supabase"
import { isValidEmail } from "../../utils/authValidation"
import OtpInput from "./OtpInput"

export default function ForgotPasswordForm({ onLogin }) {
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendResetOtp(e) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })

      if (error) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false },
        })
        if (otpError) {
          toast.error(error.message)
          return
        }
      }

      toast.success("Check your email for a reset code or link")
      setStep("otp")
    } catch {
      toast.error("Could not send reset email")
    } finally {
      setLoading(false)
    }
  }

  async function resetWithOtp(e) {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "recovery",
      })

      if (verifyError) {
        toast.error(verifyError.message)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        toast.error(updateError.message)
        return
      }

      toast.success("Password updated! You can sign in now.")
      onLogin()
    } catch {
      toast.error("Reset failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={resetWithOtp} className="auth-form">
        <p className="text-sm text-zinc-400 text-center mb-6">
          Enter the code from your email and choose a new password.
        </p>

        <OtpInput value={otp} onChange={setOtp} disabled={loading} />

        <div className="auth-field mt-6">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary auth-submit">
          {loading ? "Updating…" : "Reset password"}
        </button>

        <button type="button" onClick={onLogin} className="auth-switch-link block mx-auto mt-4 text-sm">
          Back to sign in
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={sendResetOtp} className="auth-form">
      <p className="text-sm text-zinc-400 mb-6">
        Enter your account email. We&apos;ll send a recovery code or link to reset your password.
      </p>

      <div className="auth-field">
        <label htmlFor="forgot-email">Email address</label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary auth-submit">
        {loading ? "Sending…" : "Send reset code"}
      </button>

      <p className="auth-switch">
        <button type="button" onClick={onLogin} className="auth-switch-link">
          ← Back to sign in
        </button>
      </p>
    </form>
  )
}
