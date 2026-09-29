import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetTitle = DialogPrimitive.Title
export const SheetDescription = DialogPrimitive.Description
export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'right' | 'bottom' }>(({ side = 'right', className, children, ...props }, ref) => <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-slate-950/55 backdrop-blur-sm"/><DialogPrimitive.Content ref={ref} data-side={side} className={cn('fixed z-[71] border border-white/15 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-2xl focus:outline-none', side === 'right' ? 'inset-y-0 right-0 h-full w-[min(32rem,94vw)] overflow-y-auto rounded-l-3xl p-6' : 'inset-x-0 bottom-0 max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[88dvh] md:w-[min(42rem,92vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:p-7', className)} {...props}>{side === 'bottom' && <span aria-hidden="true" className="mx-auto mb-4 block h-1.5 w-12 rounded-full bg-white/25 md:hidden"/>}{children}<DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300" aria-label="Close panel"><X size={18}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>)
SheetContent.displayName = 'SheetContent'
