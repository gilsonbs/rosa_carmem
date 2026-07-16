import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CheckoutPending() {
  return (
    <div className="min-h-screen bg-fundo">
      <div className="max-w-lg mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
        <Clock className="text-dourado" size={64} strokeWidth={1.5} />
        <h1 className="font-title text-4xl text-texto">Pagamento em análise</h1>
        <p className="text-texto/70 font-body">
          Você receberá um e-mail em breve assim que o pagamento for confirmado.
        </p>
        <Link to="/">
          <Button className="mt-4">Voltar para a loja</Button>
        </Link>
      </div>
    </div>
  )
}
