import { useEffect, useState } from "react"
import { formatCurrency } from "../utils/format"
import { TRADING_FEE_RATE } from "../game/constants"
import { calcTradingFee } from "../game/engine"
import { IconX } from "./ui/Icons"

export default function TradeModal({ open, mode, stock, maxQty, balance, onClose, onConfirm }) {
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (open) setQty(1)
  }, [open, stock?.symbol, mode])

  if (!open || !stock) return null

  const price = stock.price
  const gross = price * qty
  const fee = calcTradingFee(gross)
  const isBuy = mode === "buy"
  const totalCost = gross + fee
  const proceeds = gross - fee
  const canAfford = isBuy ? balance >= totalCost : true
  const max = isBuy
    ? Math.min(maxQty, Math.floor(balance / (price * (1 + TRADING_FEE_RATE))))
    : maxQty

  function handleConfirm() {
    if (qty < 1 || qty > max) return
    onConfirm(qty)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trade-modal-title"
    >
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="trade-modal-title" className="text-lg font-bold text-zinc-100">
              {isBuy ? "Buy" : "Sell"} {stock.symbol}
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5 font-mono">{formatCurrency(price)} / share</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400"
            aria-label="Close"
          >
            <IconX />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="trade-qty" className="text-sm font-medium text-zinc-400">
              Quantity
            </label>
            <button
              type="button"
              onClick={() => setQty(Math.max(1, max))}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Max ({max})
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-11 h-11 rounded-xl btn-secondary text-lg font-bold"
            >
              −
            </button>
            <input
              id="trade-qty"
              type="number"
              min={1}
              max={max}
              value={qty}
              onChange={(e) => setQty(Math.min(max, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="input-field text-center font-mono text-xl flex-1"
            />
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(max, q + 1))}
              className="w-11 h-11 rounded-xl btn-secondary text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span className="font-mono text-zinc-200">{formatCurrency(gross)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Trading fee ({(TRADING_FEE_RATE * 100).toFixed(1)}%)</span>
            <span className="font-mono text-zinc-200">{formatCurrency(fee)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-white/[0.06]">
            <span className="text-zinc-300">{isBuy ? "Total cost" : "You receive"}</span>
            <span className={`font-mono ${isBuy ? "text-red-400" : "text-emerald-400"}`}>
              {formatCurrency(isBuy ? totalCost : proceeds)}
            </span>
          </div>
          {isBuy && (
            <p className="text-xs text-zinc-500 pt-1">
              Buying power: {formatCurrency(balance)}
            </p>
          )}
        </div>

        {!canAfford && (
          <p className="text-red-400 text-sm mb-4">Insufficient buying power for this order.</p>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3 rounded-xl text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canAfford || max < 1}
            className={`flex-1 py-3 rounded-xl text-sm font-bold ${
              isBuy ? "btn-primary" : "btn-danger"
            } disabled:opacity-50`}
          >
            Confirm {isBuy ? "buy" : "sell"}
          </button>
        </div>
      </div>
    </div>
  )
}
