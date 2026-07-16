import type { ChangeEvent } from 'react'
import { maskPhone } from '@/utils/mask'
import type { CustomerFormData } from '@/hooks/useCheckout'

interface CustomerFormProps {
  value: CustomerFormData
  onChange: (patch: Partial<CustomerFormData>) => void
}

const inputClasses =
  'w-full rounded-lg border border-blush/60 px-3.5 py-2.5 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa'
const labelClasses = 'block font-subtitle text-sm text-texto/80 mb-1.5'

export function CustomerForm({ value, onChange }: CustomerFormProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue } = e.target
    onChange({ [name]: name === 'phone' ? maskPhone(fieldValue) : fieldValue })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={labelClasses} htmlFor="name">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Seu nome completo"
          value={value.name}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={value.email}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="phone">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={value.phone}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>
    </div>
  )
}
