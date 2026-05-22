import { IconLogo } from "./Icons"

export default function LoadingScreen({ message = "Loading your portfolio…" }) {
  return (
    <div className="min-h-screen app-shell app-grid-bg flex flex-col items-center justify-center gap-6 px-6">
      <IconLogo className="w-14 h-14" />
      <div className="loader-ring" aria-hidden />
      <p className="text-zinc-400 text-sm font-medium">{message}</p>
    </div>
  )
}
