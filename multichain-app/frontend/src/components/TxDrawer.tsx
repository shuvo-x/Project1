export type DrawerTx = {
  hash: string
  from: string
  to: string
  timeStampMs?: number
  isError?: boolean
}

function txUrl(hash: string) {
  return `https://sepolia.etherscan.io/tx/${hash}`
}

function shortAddr(a?: string) {
  if (!a) return ''
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export default function TxDrawer({
  open,
  tx,
  onClose,
}: {
  open: boolean
  tx: DrawerTx | null
  onClose: () => void
}) {
  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-white/10 bg-[#070914]/90 backdrop-blur-xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.75)]" />
            <div className="text-lg font-extrabold">Sepolia Transaction</div>
          </div>

          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>

        {!tx ? (
          <div className="p-5 text-white/70">No transaction selected.</div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="rounded-2xl glass p-4">
              <div className="text-xs text-white/55">Hash</div>
              <div className="mt-2 font-mono text-sm text-white/90 break-all">{tx.hash}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={txUrl(tx.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary px-4"
                >
                  View on Etherscan
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl glass p-4">
                <div className="text-xs text-white/55">From</div>
                <div className="mt-2 font-mono text-sm text-white/90">{shortAddr(tx.from)}</div>
              </div>

              <div className="rounded-2xl glass p-4">
                <div className="text-xs text-white/55">To</div>
                <div className="mt-2 font-mono text-sm text-white/90">{shortAddr(tx.to)}</div>
              </div>

              {typeof tx.timeStampMs === 'number' ? (
                <div className="rounded-2xl glass p-4">
                  <div className="text-xs text-white/55">Time</div>
                  <div className="mt-2 text-sm text-white/90">
                    {new Date(tx.timeStampMs).toLocaleString()}
                  </div>
                </div>
              ) : null}

              {typeof tx.isError === 'boolean' ? (
                <div className="rounded-2xl glass p-4">
                  <div className="text-xs text-white/55">Status</div>
                  <div className={`mt-2 text-sm font-semibold ${tx.isError ? 'text-red-200' : 'text-emerald-200'}`}>
                    {tx.isError ? 'Failed' : 'Success'}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  )
}