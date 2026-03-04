export default function BalanceCard({
  title,
  value,
  sub,
  accent = 'emerald',
}: {
  title: string
  value: string
  sub?: string
  accent?: 'emerald' | 'sky' | 'indigo'
}) {
  const ring =
    accent === 'emerald'
      ? 'from-emerald-400/25'
      : accent === 'sky'
      ? 'from-sky-400/25'
      : 'from-indigo-400/25'

  return (
    <div className="relative overflow-hidden rounded-2xl glass p-5">
      {/* glow */}
      <div className={`pointer-events-none absolute -top-24 -right-24 h-52 w-52 rounded-full bg-gradient-to-br ${ring} to-transparent blur-2xl`} />
      <div className="relative">
        <div className="text-sm text-white/60">{title}</div>
        <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
        {sub ? <div className="mt-2 text-xs text-white/45">{sub}</div> : null}
      </div>
    </div>
  )
}