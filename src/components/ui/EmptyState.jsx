import { Link } from "react-router-dom"

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo = "/" }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center px-8 py-16 sm:py-20">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h2 className="text-xl font-bold text-zinc-100 mb-2">{title}</h2>
      <p className="text-zinc-400 text-sm max-w-md mb-8">{description}</p>
      {actionLabel && (
        <Link to={actionTo} className="btn-primary px-6 py-3 rounded-xl text-sm inline-block">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
