import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      toast.error('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fundo px-6">
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-2xl text-rosa text-center mb-6">Rosa Carmen</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-blush/60 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-blush/60 px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
