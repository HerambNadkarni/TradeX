import { useRef, useEffect } from "react"

export default function OtpInput({ value, onChange, length = 6, disabled = false }) {
  const inputsRef = useRef([])

  const digits = value.padEnd(length, " ").split("").slice(0, length)

  useEffect(() => {
    if (value.length === 0) inputsRef.current[0]?.focus()
  }, [])

  function updateDigit(index, char) {
    const clean = char.replace(/\D/g, "")
    const arr = digits.map((d) => (d === " " ? "" : d))
    if (clean.length > 1) {
      const pasted = clean.slice(0, length).split("")
      const next = [...arr]
      pasted.forEach((c, i) => {
        if (index + i < length) next[index + i] = c
      })
      onChange(next.join("").slice(0, length))
      const focusIdx = Math.min(index + pasted.length, length - 1)
      inputsRef.current[focusIdx]?.focus()
      return
    }
    arr[index] = clean
    onChange(arr.join("").replace(/\s/g, "").slice(0, length))
    if (clean && index < length - 1) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus()
    if (e.key === "ArrowRight" && index < length - 1) inputsRef.current[index + 1]?.focus()
  }

  return (
    <div className="otp-input-group" role="group" aria-label="One-time password">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          disabled={disabled}
          value={digit.trim()}
          onChange={(e) => updateDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="otp-digit"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  )
}
