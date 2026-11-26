import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import { maskCep, onlyDigits } from '@/utils/mask'
import { getTodayIso } from '@/utils/format'
import { formatCurrency } from '@/utils/format'
import { DELIVERY_TIME_OPTIONS, PERSONAL_MESSAGE_MAX } from '@/hooks/useCheckout'
import type { AddressFormData, DeliveryFormData } from '@/hooks/useCheckout'
import { groupZonesByMunicipality } from '@/hooks/useDeliveryZones'
import { matchDeliveryZones } from '@/utils/deliveryZones'
import type { DeliveryZone } from '@/types'

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
  zones: DeliveryZone[]
  zonesLoading?: boolean
  /** Pedido manual no admin permite pedido sem zona (ex.: retirada). */
  zoneRequired?: boolean
}

const inputClasses =
  'w-full rounded-lg border border-blush/60 px-3.5 py-2.5 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa'
const labelClasses = 'block font-subtitle text-sm text-texto/80 mb-1.5'

const DELIVERY_CUTOFF_HOUR = 18 // entregas até 18h
const ADVANCE_HOURS = 3        // mínimo de antecedência

/** Data mínima e horários disponíveis considerando a regra de 3h + corte às 18h. */
function getDeliveryConstraints() {
  const now = new Date()
  const todayIso = getTodayIso()

  // Horário mais cedo que consegue entregar hoje
  const earliest = new Date(now.getTime() + ADVANCE_HOURS * 60 * 60 * 1000)
  const earliestH = earliest.getHours()
  const earliestM = earliest.getMinutes()

  // Se o horário mais cedo já passa das 18h, só pode amanhã
  const sameDayPossible =
    earliestH < DELIVERY_CUTOFF_HOUR ||
    (earliestH === DELIVERY_CUTOFF_HOUR && earliestM === 0)

  let minDate = todayIso
  if (!sameDayPossible) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    minDate = tomorrow.toISOString().split('T')[0]
  }

  return { todayIso, minDate, earliestH, earliestM, sameDayPossible }
}

function getAvailableTimeOptions(selectedDate: string): string[] {
  const { todayIso, earliestH, earliestM } = getDeliveryConstraints()
  if (selectedDate !== todayIso) return DELIVERY_TIME_OPTIONS
  return DELIVERY_TIME_OPTIONS.filter((t) => {
    const [h, m] = t.split(':').map(Number)
    return h > earliestH || (h === earliestH && m >= earliestM)
  })
}

export function DeliveryAddressForm({
  address,
  onAddressChange,
  delivery,
  onDeliveryChange,
  zones,
  zonesLoading,
  zoneRequired = true,
}: DeliveryAddressFormProps) {
  const selectedZone = zones.find((z) => z.id === delivery.zone_id) ?? null
  const messageLength = delivery.personal_message.length

  // Zonas válidas para a cidade/bairro do endereço (preenchidos pelo ViaCEP).
  const match = useMemo(
    () => matchDeliveryZones(zones, address.city, address.neighborhood),
    [zones, address.city, address.neighborhood],
  )
  const outOfArea = match.status === 'out_of_area' && zoneRequired
  // No pedido manual do admin, endereço fora da área ainda pode escolher qualquer zona.
  const selectableZones = match.status === 'out_of_area' && !zoneRequired ? zones : match.zones
  const selectableKey = selectableZones.map((z) => z.id).join(',')

  // Ao mudar o endereço: seleciona a zona automaticamente quando dá, e limpa
  // a escolha anterior se ela não vale mais para o novo endereço. Só roda
  // quando o endereço muda — o cliente continua livre para trocar a zona.
  useEffect(() => {
    if (zonesLoading) return
    if (match.autoZoneId) {
      if (delivery.zone_id !== match.autoZoneId) onDeliveryChange({ zone_id: match.autoZoneId })
      return
    }
    if (delivery.zone_id && !selectableZones.some((z) => z.id === delivery.zone_id)) {
      onDeliveryChange({ zone_id: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectableKey, match.autoZoneId, zonesLoading])
  const [lookingUpCep, setLookingUpCep] = useState(false)
  const { minDate, sameDayPossible } = getDeliveryConstraints()
  const availableTimes = getAvailableTimeOptions(delivery.date)

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

      <div>
        <label className={labelClasses} htmlFor="delivery_zone">
          📍 Zona de entrega
          {!zoneRequired && <span className="text-texto/40 font-normal"> (opcional)</span>}
        </label>
        <select
          id="delivery_zone"
          name="delivery_zone"
          required={zoneRequired}
          value={delivery.zone_id}
          onChange={(e) => onDeliveryChange({ zone_id: e.target.value })}
          disabled={zonesLoading || outOfArea}
          className={`${inputClasses} disabled:bg-gray-50 disabled:text-texto/40`}
        >
          <option value="" disabled={zoneRequired}>
            {zonesLoading ? 'Carregando zonas...' : zoneRequired ? 'Selecione sua região' : 'Sem taxa de entrega'}
          </option>
          {groupZonesByMunicipality(selectableZones).map(([municipality, list]) => (
            <optgroup key={municipality} label={municipality}>
              {list.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zone_name} ({formatCurrency(zone.fee)})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {outOfArea && (
          <p className="mt-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600 font-body">
            Não entregamos nesse endereço ({address.city}). Atendemos{' '}
            {[...new Set(zones.map((z) => z.municipality))].join(', ')}.
          </p>
        )}
        {match.status === 'no_address' && !zonesLoading && zones.length > 0 && (
          <p className="text-[11px] text-texto/50 mt-1">
            Preencha o CEP para mostrarmos as zonas do seu endereço.
          </p>
        )}
        {selectedZone && (
          <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-blush/50 text-rosa font-subtitle text-xs font-medium">
            Taxa de entrega: {formatCurrency(selectedZone.fee)}
          </span>
        )}
        {!zonesLoading && zones.length === 0 && (
          <p className="text-[11px] text-red-500 mt-1">
            Nenhuma zona de entrega disponível no momento. Fale conosco.
          </p>
        )}
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

      <div>
        <label className={labelClasses} htmlFor="personal_message">
          💌 Mensagem para o cartão <span className="text-texto/40 font-normal">(opcional)</span>
        </label>
        <textarea
          id="personal_message"
          name="personal_message"
          rows={4}
          maxLength={PERSONAL_MESSAGE_MAX}
          placeholder="Escreva uma mensagem especial para acompanhar o presente..."
          value={delivery.personal_message}
          onChange={(e) =>
            onDeliveryChange({ personal_message: e.target.value.slice(0, PERSONAL_MESSAGE_MAX) })
          }
          className="w-full resize-none rounded-lg border border-blush/60 bg-white px-3.5 py-2.5 font-body text-sm italic text-texto placeholder:not-italic placeholder:text-texto/35 focus:outline-none focus:ring-1 focus:ring-rosa focus:border-rosa transition-colors"
        />
        <p
          className={`text-right text-[11px] mt-1 font-body ${
            messageLength >= PERSONAL_MESSAGE_MAX ? 'text-rosa font-semibold' : 'text-texto/40'
          }`}
        >
          {messageLength}/{PERSONAL_MESSAGE_MAX}
        </p>
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
            min={minDate}
            value={delivery.date}
            onChange={(e) => {
              onDeliveryChange({ date: e.target.value, time: '' })
            }}
            className={inputClasses}
          />
          {!sameDayPossible && (
            <p className="text-[11px] text-texto/50 mt-1">
              Pedidos após as 15h são entregues no próximo dia útil.
            </p>
          )}
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
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {delivery.date === getDeliveryConstraints().todayIso && availableTimes.length === 0 && (
            <p className="text-[11px] text-red-500 mt-1">
              Nenhum horário disponível para hoje. Selecione outro dia.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
