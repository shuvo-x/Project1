import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { z } from 'zod'
import { createPublicClient, formatEther, http, isAddress } from 'viem'
import { sepolia } from 'viem/chains'

const PORT = Number(process.env.PORT || 4000)
const SEPOLIA_RPC = process.env.SEPOLIA_RPC
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

if (!SEPOLIA_RPC) throw new Error('Missing SEPOLIA_RPC in .env')
if (!ETHERSCAN_API_KEY) throw new Error('Missing ETHERSCAN_API_KEY in .env')

const client = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC),
})

const QuerySchema = z.object({ address: z.string().min(1) })

type TxItem = {
  hash: string
  from: string
  to: string
  valueWei: string
  timeStampMs: number
  isError?: boolean
}

function isNoTxFoundPayload(j: any) {
  const msg = String(j?.message || '').toLowerCase()
  const res = String(j?.result || '').toLowerCase()
  return msg.includes('no transactions') || res.includes('no transactions')
}

async function fetchSepoliaTxs(address: string, limit: number): Promise<TxItem[]> {
  const url =
    `https://api.etherscan.io/v2/api?chainid=11155111&module=account&action=txlist` +
    `&address=${address}&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_API_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`)

  const j: any = await res.json()

  // ✅ IMPORTANT: "No transactions found" কে error ধরবো না
  if (j?.status === '0') {
    if (isNoTxFoundPayload(j)) return []
    throw new Error(`Etherscan error: ${String(j?.message)} | ${String(j?.result || '')}`)
  }

  const list = Array.isArray(j?.result) ? j.result : []
  return list.map((tx: any) => ({
    hash: String(tx.hash),
    from: String(tx.from),
    to: String(tx.to),
    valueWei: String(tx.value),
    timeStampMs: Number(tx.timeStamp) * 1000,
    isError: tx.isError === '1',
  }))
}

async function start() {
  const app = Fastify({ logger: true })
  await app.register(cors, { origin: true })
  await app.register(rateLimit, { max: 60, timeWindow: '1 minute' })

  app.get('/health', async () => ({ ok: true }))

  // ✅ Sepolia Balance
  app.get('/api/balance', async (req, reply) => {
    const parsed = QuerySchema.safeParse(req.query)
    if (!parsed.success) return reply.status(400).send({ error: 'address required' })

    const { address } = parsed.data
    if (!isAddress(address)) return reply.status(400).send({ error: 'Invalid address' })

    try {
      const bal = await client.getBalance({ address })
      return {
        address,
        chain: 'sepolia',
        chainId: 11155111,
        symbol: 'ETH',
        formatted: Number(formatEther(bal)).toFixed(6),
        updatedAt: new Date().toISOString(),
      }
    } catch (e: any) {
      return reply.status(500).send({ error: e?.message || 'Failed to fetch balance' })
    }
  })

  // ✅ Sepolia Latest TX (Etherscan V2)
  app.get('/api/txs/latest', async (req, reply) => {
    const parsed = z
      .object({ address: z.string().min(1), limit: z.string().optional() })
      .safeParse(req.query)

    if (!parsed.success) return reply.status(400).send({ error: 'address required' })

    const { address, limit } = parsed.data
    if (!isAddress(address)) return reply.status(400).send({ error: 'Invalid address' })

    const n = Math.max(5, Math.min(20, Number(limit || 10)))

    try {
      const latest = await fetchSepoliaTxs(address, n)
      return {
        address,
        chain: 'sepolia',
        chainId: 11155111,
        latest, // ✅ tx না থাকলে latest হবে []
        updatedAt: new Date().toISOString(),
      }
    } catch (e: any) {
      return reply.status(500).send({ error: e?.message || 'Failed to fetch txs' })
    }
  })

  await app.listen({ port: PORT, host: '0.0.0.0' })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})