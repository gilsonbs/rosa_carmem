import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckout } from '@/hooks/useCheckout'
import { useCart } from '@/hooks/useCart'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'
import { CustomerForm } from '@/components/checkout/CustomerForm'
import { DeliveryAddressForm } from '@/components/checkout/DeliveryAddressForm'
import { ReviewStep } from '@/components/checkout/ReviewStep'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { PaymentBrick } from '@/components/checkout/PaymentBrick'
import { Button } from '@/components/ui/Button'

export function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice } = useCart()

  useEffect(() => {
    if (items.length === 0) {
      navigate('/', { replace: true })
    }
  }, [items.length, navigate])

  const checkout = useCheckout(items)

  if (items.length === 0) {
    return null
  }

  if (checkout.orderId) {
    return (
      <div className="min-h-screen bg-fundo px-6 py-12">
        <div className="max-w-[600px] mx-auto">
          <h1 className="font-title text-3xl text-texto text-center mb-2">Pagamento</h1>
          <p className="text-center text-texto/60 font-body mb-8">
            Escolha a forma de pagamento e finalize seu pedido.
          </p>
          <div className="bg-white/60 rounded-2xl p-6 md:p-8">
            <PaymentBrick
              orderId={checkout.orderId}
              amount={totalPrice}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fundo px-6 py-12">
      <div className="max-w-[600px] mx-auto">
        <h1 className="font-title text-3xl text-texto text-center mb-2">Finalizar compra</h1>
        <p className="text-center text-texto/60 font-body mb-8">
          Presenteie com carinho, entregamos com cuidado.
        </p>

        <CheckoutStepper currentStep={checkout.step} />

        {checkout.step !== 3 && (
          <div className="mb-6 sticky top-4 z-10">
            <OrderSummary items={items} totalPrice={totalPrice} />
          </div>
        )}

        <div className="bg-white/60 rounded-2xl p-6 md:p-8">
          {checkout.step === 1 && (
            <>
              <CustomerForm value={checkout.customer} onChange={checkout.updateCustomer} />
              <Button onClick={checkout.nextStep} size="lg" className="w-full mt-8">
                Continuar
              </Button>
            </>
          )}

          {checkout.step === 2 && (
            <>
              <DeliveryAddressForm
                address={checkout.address}
                onAddressChange={checkout.updateAddress}
                delivery={checkout.delivery}
                onDeliveryChange={checkout.updateDelivery}
              />
              <div className="flex flex-col gap-3 mt-8">
                <Button onClick={checkout.nextStep} size="lg" className="w-full">
                  Continuar
                </Button>
                <button
                  type="button"
                  onClick={checkout.prevStep}
                  className="text-sm text-texto/50 hover:text-texto/80 transition-colors text-center"
                >
                  Voltar
                </button>
              </div>
            </>
          )}

          {checkout.step === 3 && (
            <ReviewStep
              items={items}
              totalPrice={totalPrice}
              customer={checkout.customer}
              address={checkout.address}
              delivery={checkout.delivery}
              submitting={checkout.submitting}
              onSubmit={checkout.submitCheckout}
              onBack={checkout.prevStep}
            />
          )}
        </div>
      </div>
    </div>
  )
}
