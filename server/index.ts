import 'dotenv/config'
import express from 'express'
import { corsMiddleware } from './middleware/cors'
import { checkoutRouter } from './routes/checkout'
import { webhookRouter } from './routes/webhook'

const app = express()
const port = Number(process.env.SERVER_PORT) || 3001

app.use(corsMiddleware)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/checkout', checkoutRouter)
app.use('/api/webhook', webhookRouter)

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
})
