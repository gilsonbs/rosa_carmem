import { useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { maskCep, onlyDigits } from '@/utils/mask'
import { getTodayIso } from '@/utils/format'
import { DELIVERY_TIME_OPTIONS } from '@/hooks/useCheckout'
import type { AddressFormData, DeliveryFormData } from '@/hooks/useCheckout'

interface ViaCepResponse {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

interface DeliveryAddressFormProps {
  address: AddressFormData
  onAddressChange: (patch: Partial<AddressFormData>) => void
  delivery: DeliveryFormData
  onDeliveryChange: (patch: Partial<DeliveryFormData>) => void
}

const inputClasses =
  'w-full rounded-lg border border-blush/60 px-3.5 py-2.5 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa'
const labelClasses = 'block font-subtitle text-sm text-texto/80 mb-1.5'

const todayIso = getTodayIso()

export function DeliveryAddressForm({
  address,
  onAddressChange,
  delivery,
  onDeliveryChange,
}: DeliveryAddressFormProps) {
  const [lookingUpCep, setLookingUpCep] = useState(false)

  function handleAddressChange(e: ChangeEvent<HTMLInputElement>) {
    onAddressChange({ [e.target.name]: e.target.value })
  }

  function handleCepChange(e: ChangeEvent<HTMLInputElement>) {
    onAddressChange({ zip_code: maskCep(e.target.value) })
  }

  async function handleCepBlur() {
    const digits = onlyDigits(address.zip_code)
    if (digits.length !== 8) return

    setLookingUpCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = (await response.json()) as ViaCepResponse

      if (!response.ok || data.erro) {
        toast.error('CEP não encontrado')
        return
      }

      onAddressChange({
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      })
    } catch {
      toast.error('Não foi possível buscar o endereço pelo CEP')
    } finally {
      setLookingUpCep(false)
    }
  }

  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    onDeliveryChange({ date: e.target.value })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={labelClasses} htmlFor="zip_code">
          CEP {lookingUpCep && <span className="text-texto/40 font-normal">(buscando...)</span>}
        </label>
        <input
          id="zip_code"
          name="zip_code"
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={address.zip_code}
          onChange={handleCepChange}
          onBlur={handleCepBlur}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelClasses} htmlFor="street">
            Rua
          </label>
          <input
            id="street"
            name="street"
            type="text"
            placeholder="Rua"
            value={address.street}
            onChange={handleAddressChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses} htmlFor="number">
            Número
          </label>
          <input
            id="number"
            name="number"
            type="text"
            placeholder="Nº"
            value={address.number}
            onChange={handleAddressChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="complement">
          Complemento (opcional)
        </label>
        <input
          id="complement"
          name="complement"
          type="text"
          placeholder="Apto, bloco, referência..."
          value={address.complement}
          onChange={handleAddressChange}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className={labelClasses} htmlFor="neighborhood">
            Bairro
          </label>
          <input
            id="neighborhood"
            name="neighborhood"
            type="text"
            placeholder="Bairro"
            value={address.neighborhood}
            onChange={handleAddressChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses} htmlFor="state">
            Estado
          </label>
          <input
            id="state"
            name="state"
            type="text"
            placeholder="UF"
            maxLength={2}
            value={address.state}
            onChange={handleAddressChange}
            className={`${inputClasses} uppercase`}
          />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="city">
          Cidade
        </label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="Cidade"
          value={address.city}
          onChange={handleAddressChange}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blush/40">
        <div className="col-span-2 md:col-span-1">
          <label className={labelClasses} htmlFor="delivery_date">
            Data de entrega
          </label>
          <input
            id="delivery_date"
            name="delivery_date"
            type="date"
            min={todayIso}
            value={delivery.date}
            onChange={handleDateChange}
            className={inputClasses}
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className={labelClasses} htmlFor="delivery_time">
            Horário de entrega
          </label>
          <select
            id="delivery_time"
            name="delivery_time"
            value={delivery.time}
            onChange={(e) => onDeliveryChange({ time: e.target.value })}
            className={inputClasses}
          >
            <option value="" disabled>
              Selecione
            </option>
            {DELIVERY_TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
