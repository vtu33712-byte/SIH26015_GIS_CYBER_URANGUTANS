import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close
export const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => <DialogPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-[80] bg-slate-950/65 backdrop-blur-sm', className)} {...props} />)
DialogOverlay.displayName = 'DialogOverlay'
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({ className, children, ...props }, ref) => <DialogPortal><DialogOverlay/><DialogPrimitive.Content ref={ref} className={cn('fixed left-1/2 top-1/2 z-[81] grid max-h-[90dvh] w-[min(94vw,42rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/90 p-6 text-slate-100 shadow-2xl backdrop-blur-2xl focus:outline-none', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Close dialog"><X size={18}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPortal>)
DialogContent.displayName = 'DialogContent'
export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn('text-xl font-semibold tracking-tight text-white', className)} {...props}/>)
DialogTitle.displayName = 'DialogTitle'
export const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn('text-sm leading-6 text-slate-300', className)} {...props}/>)
DialogDescription.displayName = 'DialogDescription'
