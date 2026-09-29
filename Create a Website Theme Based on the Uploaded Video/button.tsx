import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

export const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-cyan-300 text-slate-950 shadow-sm hover:bg-cyan-200',
      secondary: 'border border-white/15 bg-white/10 text-slate-100 hover:bg-white/15',
      outline: 'border border-cyan-200/35 bg-transparent text-cyan-100 hover:bg-cyan-300/10',
      ghost: 'text-slate-200 hover:bg-white/10 hover:text-white',
      destructive: 'bg-rose-500/15 text-rose-100 hover:bg-rose-500/25',
    },
    size: { default: 'min-h-11 px-4 py-2.5', sm: 'min-h-10 px-3 text-xs', lg: 'min-h-12 px-5 text-base', icon: 'h-11 w-11 p-0' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Component = asChild ? Slot : 'button'
  return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})
Button.displayName = 'Button'
