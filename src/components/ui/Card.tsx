import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm',
      hover && 'transition-shadow hover:shadow-md',
      className
    )}>
      {children}
    </div>
  )
}
