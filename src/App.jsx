import 
{ useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Footer from "./components/layout/Footer"
import Dashboard from "./pages/Dashboard"
import Portfolio from "./pages/Portfolio"
import Transactions from "./pages/Transactions"
import Watchlist from "./pages/Watchlist"
import Missions from "./pages/Missions"

import Sidebar from "./components/Sidebar"
import Navbar from "./components/Navbar"
import Auth from "./components/Auth"
import LoadingScreen from "./components/ui/LoadingScreen"
import TradeModal from "./components/TradeModal"
import TutorialModal from "./components/TutorialModal"

import { supabase } from "./supabase"
import { useStocks } from "./context/StockContext"
import { isEmailVerified, getPendingEmail } from "./lib/auth"

function AppRoutes() {
  const { tradeModal, closeTrade, confirmTrade, tradeMaxQty, balance } = useStocks()

  return (
    <>
      <TutorialModal />
      <TradeModal
        open={tradeModal.open}
        mode={tradeModal.mode}
        stock={tradeModal.stock}
        maxQty={tradeMaxQty}
        balance={balance}
        onClose={closeTrade}
        onConfirm={confirmTrade}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/missions" element={<Missions />} />
      </Routes>
    </>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingEmail, setPendingEmail] = useState(() => getPendingEmail())

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setPendingEmail(getPendingEmail())
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setPendingEmail(getPendingEmail())
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session?.user && !isEmailVerified(session.user)) {
      supabase.auth.signOut()
    }
  }, [session])

  if (loading) {
    return <LoadingScreen />
  }

  const verified = session?.user && isEmailVerified(session.user)

  if (verified) {
    return (
      <BrowserRouter>
        <div className="min-h-screen app-shell app-grid-bg text-zinc-100 md:flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar />
            <main className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 max-w-[1600px] min-h-screen">
  <div className="flex-1">
    <AppRoutes />
  </div>

  <Footer />
</main>
            
          </div>
        </div>
      </BrowserRouter>
    )
  }

  if (pendingEmail) {
    return <Auth forceVerify forcedEmail={pendingEmail} />
  }

  return <Auth />
  
}

export default App
