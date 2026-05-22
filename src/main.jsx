import React from "react"
import ReactDOM from "react-dom/client"
import { Toaster } from "react-hot-toast"

import App from "./App"
import "./index.css"

import { StockProvider } from "./context/StockContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StockProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: "#18181f",
            color: "#f4f4f5",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#18181f" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#18181f" },
          },
        }}
      />
    </StockProvider>
  </React.StrictMode>
)
