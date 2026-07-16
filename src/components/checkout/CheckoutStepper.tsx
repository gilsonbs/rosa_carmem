interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { number: 1, label: 'Seus dados' },
  { number: 2, label: 'Entrega' },
  { number: 3, label: 'Pagamento' },
] as const

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-start justify-center mb-10">
      {steps.map((s, index) => (
        <div key={s.number} className="flex items-start">
          <div className="flex flex-col items-center gap-1.5 w-20">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-subtitle font-semibold text-sm transition-colors ${
                s.number <= currentStep
                  ? 'bg-rosa text-white'
                  : 'bg-white border border-blush text-texto/40'
              }`}
            >
              {s.number}
            </div>
            <span
              className={`text-xs font-subtitle text-center ${
                s.number <= currentStep ? 'text-rosa' : 'text-texto/40'
              }`}
            >
              {s.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 md:w-16 mt-4 ${
                s.number < currentStep ? 'bg-rosa' : 'bg-blush/60'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
