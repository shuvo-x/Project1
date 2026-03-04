import { useMemo, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useQuery } from '@tanstack/react-query'
import BalanceCard from './components/BalanceCard'
import Toast from './components/Toast'
import TxDrawer, { type DrawerTx } from './components/TxDrawer'
import { fetchBalance, fetchLatestTxs, type LatestTx } from './services/api'

function shortHash(h: string) {
  return `${h.slice(0, 10)}…${h.slice(-6)}`
}
function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export default function App() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const shortWallet = useMemo(() => (address ? shortAddr(address) : ''), [address])

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<DrawerTx | null>(null)

  const balanceQuery = useQuery({
    queryKey: ['sepolia-balance', address],
    queryFn: () => fetchBalance(address!),
    enabled: !!address,
    staleTime: 60_000,
  })

  const txQuery = useQuery({
    queryKey: ['sepolia-txs', address],
    queryFn: () => fetchLatestTxs(address!, 5),
    enabled: !!address,
    staleTime: 30_000,
  })

  async function copyAddress() {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setToastVariant('success')
      setToastMsg('Address copied!')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 2000)
    } catch {
      setToastVariant('error')
      setToastMsg('Copy failed.')
      setToastOpen(true)
      setTimeout(() => setToastOpen(false), 2000)
    }
  }

  function openTx(tx: LatestTx) {
    setSelectedTx({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      timeStampMs: tx.timeStampMs,
      isError: tx.isError,
    })
    setDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#050612] text-white">
      {/* Premium background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="absolute top-36 -left-40 h-[520px] w-[520px] rounded-full bg-sky-600/15 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[540px] w-[540px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="chip">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.75)]" />
              Sepolia • RPC balance + Etherscan V2 tx
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Sepolia Wallet Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-white/60">
              Clean, fast, and premium UI to showcase your Web3 API + React state skills.
            </p>
          </div>

          {/* Wallet box */}
          <div className="soft-card p-4 md:min-w-[340px]">
            {!isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                disabled={isPending}
                className="btn btn-primary w-full px-4 py-3"
              >
                {isPending ? 'Connecting…' : 'Connect MetaMask'}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-white/70">Connected</div>
                  <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 font-mono text-sm text-white/90">
                    {shortWallet}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyAddress} className="btn">
                    Copy
                  </button>
                  <button onClick={() => disconnect()} className="btn border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/15">
                    Disconnect
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => balanceQuery.refetch()}
                    disabled={balanceQuery.isFetching}
                    className="btn"
                  >
                    {balanceQuery.isFetching ? 'Refreshing…' : 'Refresh Balance'}
                  </button>

                  <button
                    onClick={() => txQuery.refetch()}
                    disabled={txQuery.isFetching}
                    className="btn"
                  >
                    {txQuery.isFetching ? 'Refreshing…' : 'Refresh Activity'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-6 space-y-3">
          {!address ? (
            <div className="soft-card p-4 text-white/70">
              Wallet connect করলে এখানে Sepolia balance + latest transactions দেখাবে।
            </div>
          ) : null}

          {balanceQuery.isError ? (
            <div className="soft-card border border-red-500/25 bg-red-500/10 p-4 text-red-100">
              <div className="font-semibold">Balance error</div>
              <div className="mt-1 text-sm opacity-90">{(balanceQuery.error as Error).message}</div>
            </div>
          ) : null}

          {txQuery.isError ? (
            <div className="soft-card border border-red-500/25 bg-red-500/10 p-4 text-red-100">
              <div className="font-semibold">Activity error</div>
              <div className="mt-1 text-sm opacity-90">{(txQuery.error as Error).message}</div>
            </div>
          ) : null}
        </div>

        {/* Main */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Left: Balance + meta */}
          <div className="lg:col-span-2 space-y-6">
            <div className="soft-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Balance</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Native ETH on Sepolia (Chain ID 11155111)
                  </p>
                </div>
                {balanceQuery.data ? (
                  <div className="text-xs text-white/50">
                    Updated: {new Date(balanceQuery.data.updatedAt).toLocaleString()}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {balanceQuery.isLoading ? (
                  <>
                    <div className="h-[112px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
                    <div className="h-[112px] rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
                  </>
                ) : null}

                {balanceQuery.data ? (
                  <BalanceCard
                    title="Sepolia"
                    value={`${balanceQuery.data.formatted} ${balanceQuery.data.symbol}`}
                    sub="Testnet funds • Use faucet if needed"
                    accent="emerald"
                  />
                ) : null}

                <div className="rounded-2xl glass p-5">
                  <div className="text-sm text-white/60">What this proves</div>
                  <ul className="mt-3 space-y-2 text-sm text-white/70">
                    <li>• Wallet connect (wagmi)</li>
                    <li>• Backend RPC calls (viem)</li>
                    <li>• Etherscan V2 integration</li>
                    <li>• React Query cache + refresh</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips card */}
            <div className="soft-card p-5">
              <h3 className="text-base font-bold">Pro tips</h3>
              <div className="mt-2 text-sm text-white/65">
               "Every error is a window into the inner workings of Web3. Embrace them, learn from them, and you'll level up faster than you think."
              </div>
            </div>
          </div>

          {/* Right: Activity */}
          <div className="soft-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Latest Activity</h2>
                <p className="mt-1 text-sm text-white/60">Last 5 transactions (Sepolia)</p>
              </div>
              {txQuery.data ? (
                <div className="text-xs text-white/50">
                  Updated: {new Date(txQuery.data.updatedAt).toLocaleString()}
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {txQuery.isLoading ? (
                <>
                  <div className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                  <div className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                  <div className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
                </>
              ) : null}

              {/* Empty state */}
              {txQuery.data && txQuery.data.latest.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white/80">No transactions yet</div>
                  <div className="mt-1 text-sm text-white/60">
                    
                  </div>
                </div>
              ) : null}

              {/* List */}
              {txQuery.data?.latest?.length
                ? txQuery.data.latest.map((tx: LatestTx) => (
                    <button
                      key={tx.hash}
                      onClick={() => openTx(tx)}
                      className="group w-full text-left rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                          Sepolia
                        </span>
                        <span className="font-mono text-xs text-white/70 group-hover:text-white/85">
                          {shortHash(tx.hash)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/60">
                        <span>
                          to: {tx.to.slice(0, 10)}…{tx.to.slice(-6)}
                        </span>
                        <span>{new Date(tx.timeStampMs).toLocaleString()}</span>
                      </div>

                      {tx.isError ? (
                        <div className="mt-2 text-xs font-semibold text-red-200">Failed</div>
                      ) : (
                        <div className="mt-2 text-xs font-semibold text-emerald-200">Success</div>
                      )}
                    </button>
                  ))
                : null}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-white/40">
          React 19 • Tailwind • wagmi/viem • Fastify • Sepolia
        </div>
      </div>

      <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
      <TxDrawer open={drawerOpen} tx={selectedTx} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}