
import { supabase } from "../supabase"
import emailjs from "@emailjs/browser"

const PENDING_EMAIL_KEY =
  "tradex_pending_email"

const PENDING_SIGNUP_KEY =
  "tradex_pending_signup"

const OTP_PASSED_KEY =
  "tradex_otp_passed"

export function isEmailVerified(
  user
) {
  if (!user) return false

  if (
    user.email_confirmed_at ??
    user.confirmed_at
  ) {
    return true
  }

  return (
    sessionStorage.getItem(
      OTP_PASSED_KEY
    ) === user.id
  )
}

export function markOtpPassed(
  userId
) {
  sessionStorage.setItem(
    OTP_PASSED_KEY,
    userId
  )
}

export function clearOtpPassed() {
  sessionStorage.removeItem(
    OTP_PASSED_KEY
  )
}

export function savePendingSignup({
  email,
  fullName,
  password,
}) {
  sessionStorage.setItem(
    PENDING_EMAIL_KEY,
    email
  )

  sessionStorage.setItem(
    PENDING_SIGNUP_KEY,

    JSON.stringify({
      email,
      fullName,
      password,
      createdAt: Date.now(),
    })
  )
}

export function getPendingSignup() {
  try {
    const raw =
      sessionStorage.getItem(
        PENDING_SIGNUP_KEY
      )

    return raw
      ? JSON.parse(raw)
      : null
  } catch {
    return null
  }
}

export function getPendingEmail() {
  return (
    sessionStorage.getItem(
      PENDING_EMAIL_KEY
    ) || ""
  )
}

export function clearPendingSignup() {
  sessionStorage.removeItem(
    PENDING_EMAIL_KEY
  )

  sessionStorage.removeItem(
    PENDING_SIGNUP_KEY
  )
}

export function clearAllAuthFlags() {
  clearPendingSignup()
  clearOtpPassed()
}

async function forceNoSession() {
  clearOtpPassed()

  await supabase.auth.signOut()
}

/* SEND OTP */

async function sendTradeXEmailOtp(
  email,
  fullName
) {
  try {
    const otp = String(
      Math.floor(
        100000 +
          Math.random() * 900000
      )
    )

    sessionStorage.setItem(
      "EMAILJS_OTP",
      otp
    )

    sessionStorage.setItem(
      "EMAILJS_EMAIL",
      email
    )

    const result =
      await emailjs.send(
        "service_2suouqy",
        "template_yuqavlr",
        {
          email: email,
          otp: otp,
          time: "15 minutes",
          name:
            fullName || "Trader",
        },
        "4msTPAIvQfnQs6n_y"
      )

    console.log(
      "[OTP] ✅ EmailJS sent",
      result
    )

    return {
      ok: true,
    }
  } catch (err) {
    console.error(
      "[OTP] ❌ EmailJS failed",
      err
    )

    return {
      ok: false,
      error:
        err?.text ||
        "Failed to send email",
    }
  }
}

export async function sendSignupOtp(
  email,
  {
    fullName = "",
  } = {}
) {
  console.log(
    "[OTP] Sending OTP:",
    email
  )

  const result =
    await sendTradeXEmailOtp(
      email,
      fullName
    )

  if (result.ok) {
    console.log(
      "[OTP] ✅ Email sent"
    )

    return {
      ok: true,
      via: "emailjs",
    }
  }

  return {
    ok: false,
    error:
      result.error ||
      "Failed to send OTP",
  }
}

/* REGISTER */

export async function registerAndSendOtp({
  email,
  password,
  fullName,
}) {
  const trimmedEmail =
    email.trim().toLowerCase()

  await forceNoSession()

  savePendingSignup({
    email: trimmedEmail,
    fullName,
    password,
  })

  const result =
    await sendSignupOtp(
      trimmedEmail,
      {
        fullName,
      }
    )

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
    }
  }

  return {
    ok: true,
    email: trimmedEmail,
    via: result.via,
  }
}

/* VERIFY OTP */

export async function verifySignupOtp(
  email,
  token
) {
  const trimmedEmail =
    email.trim().toLowerCase()

  const code = token
    .replace(/\D/g, "")
    .slice(0, 6)

  const pending =
    getPendingSignup()

  if (code.length !== 6) {
    return {
      ok: false,
      error:
        "Enter full 6-digit code",
    }
  }

  const savedOtp =
    sessionStorage.getItem(
      "EMAILJS_OTP"
    )

  const savedEmail =
    sessionStorage.getItem(
      "EMAILJS_EMAIL"
    )

  if (
    !savedOtp ||
    !savedEmail
  ) {
    return {
      ok: false,
      error:
        "No OTP found. Request again.",
    }
  }

  if (
    savedEmail !== trimmedEmail
  ) {
    return {
      ok: false,
      error:
        "Email mismatch.",
    }
  }

  if (savedOtp !== code) {
    return {
      ok: false,
      error:
        "Invalid OTP code",
    }
  }

  console.log(
    "[OTP] ✅ OTP verified"
  )

  /* CREATE USER */

  const {
    data: signupData,
    error: signupError,
  } = await supabase.auth.signUp({
    email: trimmedEmail,

    password:
      pending?.password ||
      "password123",

    options: {
      data: {
        full_name:
          pending?.fullName || "",
      },
    },
  })

  if (signupError) {
    return {
      ok: false,
      error:
        signupError.message,
    }
  }

  /* LOGIN USER */

  const {
    data: loginData,
    error: loginError,
  } =
    await supabase.auth.signInWithPassword(
      {
        email: trimmedEmail,

        password:
          pending?.password ||
          "password123",
      }
    )

  if (loginError) {
    return {
      ok: false,
      error:
        loginError.message,
    }
  }

  sessionStorage.removeItem(
    "EMAILJS_OTP"
  )

  sessionStorage.removeItem(
    "EMAILJS_EMAIL"
  )

  clearPendingSignup()

  if (
    loginData?.user?.id
  ) {
    markOtpPassed(
      loginData.user.id
    )
  }

  console.log(
    "[OTP] ✅ Login success"
  )

  /* REDIRECT */

  window.location.href =
    "/dashboard"

  return {
    ok: true,
    session:
      loginData.session,
  }
}

/* RESEND OTP */

export async function resendSignupOtp(
  email
) {
  const trimmedEmail =
    email.trim().toLowerCase()

  const pending =
    getPendingSignup()

  return sendSignupOtp(
    trimmedEmail,
    {
      fullName:
        pending?.fullName || "",
    }
  )
}

