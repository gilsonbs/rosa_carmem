import cors from 'cors'

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'

export const corsMiddleware = cors({
  origin: frontendUrl,
  methods: ['GET', 'POST'],
})
