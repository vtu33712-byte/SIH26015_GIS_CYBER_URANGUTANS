import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fieldObservations as seedObservations } from '../data/mockData'
import type { FieldObservation, ToastMessage } from '../types/domain'

type WorkflowValue = {
  selectedWatershedId: string | null
  selectedAssetId: string | null
  selectedImageId: string | null
  selectedAlertId: string | null
  reviewedAlertIds: string[]
  observations: FieldObservation[]
  toast: ToastMessage | null
  selectWatershed: (id: string | null) => void
  selectAsset: (id: string | null) => void
  selectImage: (id: string | null) => void
  selectAlert: (id: string | null) => void
  markAlertReviewed: (id: string) => void
  addObservation: (item: FieldObservation) => void
  showToast: (title: string, detail?: string, tone?: ToastMessage['tone']) => void
  dismissToast: () => void
}
const WorkflowContext = createContext<WorkflowValue | null>(null)
const reviewedKey = 'jal-impact-reviewed-alerts'
function readReviewed(): string[] {
  try { const value = JSON.parse(localStorage.getItem(reviewedKey) || '[]'); return Array.isArray(value) && value.every(id => typeof id === 'string') ? value : [] } catch { return [] }
}
export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [selectedWatershedId, selectWatershed] = useState<string | null>(null)
  const [selectedAssetId, selectAsset] = useState<string | null>(null)
  const [selectedImageId, selectImage] = useState<string | null>(null)
  const [selectedAlertId, selectAlert] = useState<string | null>(null)
  const [reviewedAlertIds, setReviewedAlertIds] = useState<string[]>(readReviewed)
  const [observations, setObservations] = useState<FieldObservation[]>(seedObservations)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  useEffect(() => { localStorage.setItem(reviewedKey, JSON.stringify(reviewedAlertIds)) }, [reviewedAlertIds])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3600); return () => window.clearTimeout(timer) }, [toast])
  const showToast = useCallback((title: string, detail?: string, tone: ToastMessage['tone'] = 'success') => setToast({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, detail, tone }), [])
  const markAlertReviewed = useCallback((id: string) => { setReviewedAlertIds(current => current.includes(id) ? current : [...current, id]); showToast('Alert marked as reviewed', `${id} · review state saved in this prototype.`) }, [showToast])
  const addObservation = useCallback((item: FieldObservation) => { setObservations(current => [item, ...current]); showToast('Observation submitted successfully.', `${item.id} · GPS point saved in this browser session.`) }, [showToast])
  const value = useMemo(() => ({ selectedWatershedId, selectedAssetId, selectedImageId, selectedAlertId, reviewedAlertIds, observations, toast, selectWatershed, selectAsset, selectImage, selectAlert, markAlertReviewed, addObservation, showToast, dismissToast: () => setToast(null) }), [selectedWatershedId, selectedAssetId, selectedImageId, selectedAlertId, reviewedAlertIds, observations, toast, markAlertReviewed, addObservation, showToast])
  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}
export function useWorkflow() { const value = useContext(WorkflowContext); if (!value) throw new Error('useWorkflow must be used within WorkflowProvider'); return value }
