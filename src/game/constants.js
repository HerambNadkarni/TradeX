export const STARTING_CASH = 100_000
export const TRADING_FEE_RATE = 0.001
export const MAX_POSITION_QTY = 9999
export const PRICE_HISTORY_LENGTH = 24
export const REFRESH_MS_MARKET_OPEN = 60_000
export const REFRESH_MS_MARKET_CLOSED = 180_000

export const XP = {
  TRADE: 20,
  PROFITABLE_SELL: 40,
  CHALLENGE: 100,
  ACHIEVEMENT: 75,
  NEW_HIGH_NET_WORTH: 30,
}

export const LEVEL_THRESHOLDS = [
  0, 200, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 26000, 33000, 41000, 50000,
]

export const RANKS = [
  { minNetWorth: 0, title: "Intern", icon: "🌱" },
  { minNetWorth: 105_000, title: "Retail Trader", icon: "📊" },
  { minNetWorth: 120_000, title: "Day Trader", icon: "⚡" },
  { minNetWorth: 150_000, title: "Portfolio Manager", icon: "💼" },
  { minNetWorth: 200_000, title: "Hedge Fund Analyst", icon: "🏦" },
  { minNetWorth: 300_000, title: "Market Wizard", icon: "🧙" },
  { minNetWorth: 500_000, title: "Wall Street Legend", icon: "👑" },
]

export const ACHIEVEMENTS = [
  { id: "first_trade", title: "First fill", desc: "Execute your first trade", xp: 50 },
  { id: "five_trades", title: "Getting started", desc: "Complete 5 trades", xp: 75 },
  { id: "twenty_trades", title: "Market regular", desc: "Complete 20 trades", xp: 150 },
  { id: "first_profit", title: "In the green", desc: "Close a profitable sell", xp: 100 },
  { id: "diversified", title: "Diversified", desc: "Hold 5 different symbols", xp: 125 },
  { id: "net_120k", title: "Six figures+", desc: "Reach $120,000 net worth", xp: 200 },
  { id: "net_200k", title: "Double up", desc: "Reach $200,000 net worth", xp: 300 },
  { id: "big_win", title: "Home run", desc: "Realize $2,000+ on a single sell", xp: 250 },
  { id: "watchlist_5", title: "Researcher", desc: "Track 5 stocks on watchlist", xp: 80 },
]

export const DAILY_CHALLENGES = [
  { id: "trades_2", title: "Warm up", desc: "Make 2 trades today", target: 2, track: "tradesToday", xp: XP.CHALLENGE },
  { id: "trades_5", title: "Active session", desc: "Make 5 trades today", target: 5, track: "tradesToday", xp: 150 },
  { id: "buy_new", title: "New position", desc: "Buy a symbol you didn't own at day start", target: 1, track: "newBuysToday", xp: XP.CHALLENGE },
  { id: "profit_sell", title: "Take profit", desc: "Complete a profitable sell", target: 1, track: "profitableSellsToday", xp: 120 },
  { id: "net_gain", title: "Growing account", desc: "End day up $1,000 vs morning net worth", target: 1000, track: "netWorthGainToday", xp: 180 },
]

export const DEFAULT_SYMBOLS = ["AAPL", "TSLA", "MSFT", "GOOGL", "NVDA"]

export const DEFAULT_GAME_STATE = {
  xp: 0,
  totalTrades: 0,
  unlockedAchievements: [],
  daily: {
    date: "",
    challenges: [],
    progress: {},
    completed: [],
    morningNetWorth: STARTING_CASH,
    tradesToday: 0,
    newBuysToday: 0,
    profitableSellsToday: 0,
    symbolsAtDayStart: [],
  },
  peakNetWorth: STARTING_CASH,
  totalRealizedPL: 0,
  tutorialSeen: false,
  dayStartPortfolio: [],
}
