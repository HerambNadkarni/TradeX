export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" }
  if (score <= 3) return { score: 2, label: "Fair", color: "bg-amber-500" }
  if (score <= 4) return { score: 3, label: "Good", color: "bg-emerald-500" }
  return { score: 4, label: "Strong", color: "bg-emerald-400" }
}

export function validateSignup({ email, password, confirmPassword, fullName }) {
  const errors = {}
  if (!fullName?.trim()) errors.fullName = "Enter your name"
  if (!email?.trim()) errors.email = "Email is required"
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address"
  if (!password) errors.password = "Password is required"
  else if (password.length < 6) errors.password = "At least 6 characters"
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match"
  return errors
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email?.trim()) errors.email = "Email is required"
  else if (!isValidEmail(email)) errors.email = "Enter a valid email"
  if (!password) errors.password = "Password is required"
  return errors
}
