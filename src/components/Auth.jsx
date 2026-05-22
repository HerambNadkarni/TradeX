import { useState, useEffect } from "react"
import AuthLayout from "./auth/AuthLayout"
import LoginForm from "./auth/LoginForm"
import SignupForm from "./auth/SignupForm"
import VerifyOtpForm from "./auth/VerifyOtpForm"
import ForgotPasswordForm from "./auth/ForgotPasswordForm"
import { getPendingEmail, clearPendingSignup } from "../lib/auth"

function Auth({ forceVerify = false, forcedEmail = "" }) {
  const [view, setView] = useState(forceVerify ? "verify-otp" : "login")
  const [pendingEmail, setPendingEmail] = useState(forcedEmail)

  useEffect(() => {
    const stored = getPendingEmail()
    if (stored && !forceVerify) {
      setPendingEmail(stored)
      setView("verify-otp")
    }
  }, [forceVerify])

  useEffect(() => {
    if (forceVerify && forcedEmail) {
      setPendingEmail(forcedEmail)
      setView("verify-otp")
    }
  }, [forceVerify, forcedEmail])

  const headers = {
    login: {
      title: "Sign in",
      subtitle: "Enter your credentials to access your portfolio and missions.",
    },
    signup: {
      title: "Create account",
      subtitle: "Join TradeX — verify your email before you can trade.",
    },
    "verify-otp": {
      title: "Verify your email",
      subtitle: "Required: enter the code from your inbox to unlock the game.",
    },
    forgot: {
      title: "Reset password",
      subtitle: "Recover access to your trading account.",
    },
  }

  const { title, subtitle } = headers[view] ?? headers.login
  const showTabs = (view === "login" || view === "signup") && !forceVerify

  function goToOtp(email) {
    setPendingEmail(email)
    setView("verify-otp")
  }

  function goBackFromOtp() {
    clearPendingSignup()
    setPendingEmail("")
    setView("signup")
  }

  return (
    <AuthLayout title={title} subtitle={subtitle} view={view}>
      {showTabs && (
        <div className="auth-tabs mb-5">
          <button
            type="button"
            onClick={() => setView("login")}
            className={`auth-tab ${view === "login" ? "auth-tab-active" : ""}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setView("signup")}
            className={`auth-tab ${view === "signup" ? "auth-tab-active" : ""}`}
          >
            Sign up
          </button>
        </div>
      )}

      <div className="auth-card glass-card">
        {view === "login" && !forceVerify && (
          <LoginForm
            onSignup={() => setView("signup")}
            onForgot={() => setView("forgot")}
            onVerifyEmail={goToOtp}
          />
        )}

        {view === "signup" && !forceVerify && (
          <SignupForm onLogin={() => setView("login")} onOtpRequired={goToOtp} />
        )}

        {view === "verify-otp" && (
          <VerifyOtpForm
            email={pendingEmail}
            onBack={forceVerify ? null : goBackFromOtp}
          />
        )}

        {view === "forgot" && !forceVerify && (
          <ForgotPasswordForm onLogin={() => setView("login")} />
        )}
      </div>
    </AuthLayout>
  )
}

export default Auth
