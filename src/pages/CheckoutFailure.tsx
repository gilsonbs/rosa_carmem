import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CheckoutFailure() {
  return (
    <div className="min-h-screen bg-fundo">
      <div className="max-w-lg mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
        <XCircle className="text-red-500" size={64} strokeWidth={1.5} />
        <h1 className="font-title text-4xl text-texto">Pagamento não aprovado</h1>
        <p className="text-texto/70 font-body">
          Não foi possível concluir o pagamento. Tente novamente ou escolha outra forma de pagamento.
        </p>
        <Link to="/">
          <Button className="mt-4">Voltar para a loja</Button>
        </Link>
      </div>
    </div>
  )
}
