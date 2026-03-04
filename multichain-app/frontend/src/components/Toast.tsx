export default function Toast({
  open,
  message,
  variant,
  onClose,
}: {
  open: boolean
  message: string
  variant: 'success' | 'error'
  onClose: () => void
}) {
  if (!open) return null

  const styles =
    variant === 'success'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-100'
      : 'border-red-500/25 bg-red-500/10 text-red-100'

  return (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2">
      <div className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${styles}`}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}