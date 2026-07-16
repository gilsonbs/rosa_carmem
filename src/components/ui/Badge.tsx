import type { HTMLAttributes, ReactNode } from 'react'

export type Tone = 'rosa' | 'dourado' | 'neutral' | 'success' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  children: ReactNode
}

const toneClasses: Record<Tone, string> = {
  rosa: 'bg-blush text-rosa',
  dourado: 'bg-dourado/20 text-dourado',
  neutral: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
}

export function Badge({ tone = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-subtitle font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
