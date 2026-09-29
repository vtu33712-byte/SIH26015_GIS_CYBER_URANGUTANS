export type GovernmentRole = 'administrator' | 'district_officer' | 'field_officer'
export type UserRole = 'public' | 'government'
export type Priority = 'high' | 'medium' | 'low'
export type AssetCondition = 'good' | 'moderate' | 'poor' | 'damaged' | 'critical'

export interface User { id: string; name: string; role: UserRole; governmentRole?: GovernmentRole }
export interface Watershed { id: string; name: string; district: string; areaHectares: number; assetCount: number; imageCount: number; indicator: number; status: 'healthy' | 'moderate' | 'attention'; center: [number, number] }
export interface Asset { id: string; type: string; village: string; watershedId: string; condition: AssetCondition; waterStatus: 'good' | 'moderate' | 'poor'; risk: Priority; lastInspection: string; center: [number, number] }
export interface GeoCodedImage { id: string; watershedId: string; assetId: string; village: string; capturedAt: string; coordinates: [number, number]; waterStatus: string; condition: AssetCondition; publicApproved: boolean }
export interface FieldObservation { id: string; assetId: string; watershedId: string; capturedAt: string; water: string; condition: AssetCondition; vegetation: string; erosion: boolean; status: 'pending_verification' | 'verified' | 'submitted' | 'needs_follow_up' }
export interface Inspection { id: string; assetId: string; watershedId: string; officer: string; lastInspection: string; condition: AssetCondition; priority: Priority; status: string }
export interface Alert { id: string; level: 'critical' | 'high' | 'medium' | 'information'; assetId: string; watershedId: string; message: string; observationDate: string; evidenceCount: number; reviewed: boolean }
export interface Village { id: string; name: string; watershedId: string; assetCount: number; agriculturalArea: number; center: [number, number] }
export interface WaterBody { id: string; villageId: string; waterStatus: 'good' | 'moderate' | 'poor'; trend: string; observedAt: string; center: [number, number] }
export interface SpatialInsight { id: string; label: string; count: number; priority: Priority; description: string }
export interface PriorityZone { id: string; assetId: string; watershedId: string; priority: Priority; reasons: string[]; recommendedAction: string }
export interface Report { id: string; title: string; audience: UserRole; description: string; generatedAt?: string }

export type Coordinates = [latitude: number, longitude: number]
export type WaterStatus = 'good' | 'moderate' | 'poor'
export type AlertSeverity = Alert['level']

export interface TrendPoint { date: string; month: string; waterAvailability: number; vegetation: number; fieldObservations: number }
export interface Watershed { village?: string; lastUpdated?: string; waterAvailability?: number; vegetation?: number; trend?: TrendPoint[] }
export interface Asset { name?: string; district?: string; latestImageId?: string; observationCount?: number; developmentStatus?: string; publicSummary?: string; internalRecommendation?: string }
export interface GeoCodedImage { observation?: string; capturedBy?: string; source?: 'demo' | 'local-upload' }
export interface FieldObservation { officer?: string; coordinates?: Coordinates; imageId?: string; note?: string }
export interface Inspection { scheduledDate?: string; completedDate?: string; summary?: string }
export interface Alert { title?: string; location?: string; date?: string; evidenceIds?: string[]; recommendation?: string }
export interface Village { population?: number; householdCount?: number; waterAccess?: 'good' | 'moderate' | 'needs_attention' }
export interface WaterBody { name?: string; type?: 'lake' | 'pond' | 'reservoir' | 'tank'; waterLevel?: number; status?: WaterStatus }
export interface SpatialInsight { date?: string; location?: string; coordinates?: Coordinates; magnitude?: number; watershedId?: string }
export interface PriorityZone { lastChanged?: string }
export interface Report { updatedAt?: string; containsAI?: boolean }
export interface ToastMessage { id: string; title: string; detail?: string; tone: 'success' | 'warning' | 'info' | 'restricted' }
