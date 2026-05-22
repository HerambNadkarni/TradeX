export function storageKey(userId, key) {
  return `${key}-${userId}`
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadUserData(userId) {
  if (!userId) {
    console.warn("[PERSISTENCE] loadUserData called with no userId")
    return null
  }
  console.log("[PERSISTENCE] Loading data for user", userId.substring(0, 8))
  const loaded = {
    symbols: loadJSON(storageKey(userId, "symbols"), null),
    balance: loadJSON(storageKey(userId, "balance"), null),
    portfolio: loadJSON(storageKey(userId, "portfolio"), null),
    transactions: loadJSON(storageKey(userId, "transactions"), null),
    watchlist: loadJSON(storageKey(userId, "watchlist"), null),
    game: loadJSON(storageKey(userId, "game"), null),
    priceHistory: loadJSON(storageKey(userId, "priceHistory"), {}),
  }
  console.log("[PERSISTENCE] Loaded portfolio:", loaded.portfolio, "balance:", loaded.balance)
  return loaded
}

export function saveUserData(userId, data) {
  if (!userId) {
    console.warn("[PERSISTENCE] saveUserData called with no userId")
    return
  }
  console.log("[PERSISTENCE] Saving data for user", userId.substring(0, 8), data)
  if (data.symbols != null) saveJSON(storageKey(userId, "symbols"), data.symbols)
  if (data.balance != null) saveJSON(storageKey(userId, "balance"), data.balance)
  if (data.portfolio != null) {
    console.log("[PERSISTENCE] Saving portfolio:", data.portfolio)
    saveJSON(storageKey(userId, "portfolio"), data.portfolio)
  }
  if (data.transactions != null) saveJSON(storageKey(userId, "transactions"), data.transactions)
  if (data.watchlist != null) saveJSON(storageKey(userId, "watchlist"), data.watchlist)
  if (data.game != null) saveJSON(storageKey(userId, "game"), data.game)
  if (data.priceHistory != null) saveJSON(storageKey(userId, "priceHistory"), data.priceHistory)
}
