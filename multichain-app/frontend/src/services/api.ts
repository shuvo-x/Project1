export type BalanceResponse = {
  address: string
  chain: 'sepolia'
  chainId: 11155111
  symbol: 'ETH'
  formatted: string
  updatedAt: string
}

export type LatestTx = {
  hash: string
  from: string
  to: string
  valueWei: string
  timeStampMs: number
  isError?: boolean
}

export type LatestTxsResponse = {
  address: string
  chain: 'sepolia'
  chainId: 11155111
  latest: LatestTx[]
  updatedAt: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

async function handleJson(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Backend error (${res.status}): ${text || 'Request failed'}`)
  }
  return res.json()
}

export async function fetchBalance(address: string): Promise<BalanceResponse> {
  const res = await fetch(`${BACKEND_URL}/api/balance?address=${address}`)
  return handleJson(res)
}

export async function fetchLatestTxs(address: string, limit = 10): Promise<LatestTxsResponse> {
  const res = await fetch(`${BACKEND_URL}/api/txs/latest?address=${address}&limit=${limit}`)
  return handleJson(res)
}