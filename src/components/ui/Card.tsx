import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-blush/60 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
