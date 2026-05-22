export default function PageHeader({ title, subtitle, badge }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient">
          {title}
        </h1>
        {subtitle && (
          <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {badge && (
        <div className="glass-card px-5 py-4 shrink-0">
          {badge}
        </div>
      )}
    </div>
  )
}
