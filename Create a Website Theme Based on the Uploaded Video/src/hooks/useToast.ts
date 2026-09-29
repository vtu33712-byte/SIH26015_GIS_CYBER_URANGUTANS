import { useCallback, useState } from 'react'
export function useToast() { const [message, setMessage] = useState<string | null>(null); const showToast = useCallback((next: string) => { setMessage(next); window.setTimeout(() => setMessage(null), 2600) }, []); return { message, showToast, dismissToast: () => setMessage(null) } }
