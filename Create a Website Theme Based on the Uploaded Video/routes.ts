export const appRoutes = {
  overview: '/', gis: '/gis', geoImages: '/geo-images', watersheds: '/watersheds', assets: '/watershed-assets',
  insights: '/development-insights', developmentIndicator: '/development-indicator', inspections: '/inspections', observation: '/field-observation', beforeAfter: '/before-after',
  priority: '/priority-intervention', alerts: '/alerts', reports: '/reports', governmentReports: '/government-reports',
} as const
export type AppView = 'overview' | 'gis' | 'evidence' | 'insights' | 'indicator' | 'reports' | 'operations' | 'watersheds' | 'assets' | 'inspections' | 'observation' | 'before-after' | 'priority' | 'alerts'
export const viewPaths: Record<AppView, string> = { overview: appRoutes.overview, gis: appRoutes.gis, evidence: appRoutes.geoImages, insights: appRoutes.insights, indicator: appRoutes.developmentIndicator, reports: appRoutes.reports, operations: appRoutes.inspections, watersheds: appRoutes.watersheds, assets: appRoutes.assets, inspections: appRoutes.inspections, observation: appRoutes.observation, 'before-after': appRoutes.beforeAfter, priority: appRoutes.priority, alerts: appRoutes.alerts }
const pathViews: Record<string, AppView> = { [appRoutes.overview]: 'overview', [appRoutes.gis]: 'gis', [appRoutes.geoImages]: 'evidence', [appRoutes.insights]: 'insights', [appRoutes.developmentIndicator]: 'indicator', [appRoutes.reports]: 'reports', [appRoutes.governmentReports]: 'reports', [appRoutes.inspections]: 'operations', [appRoutes.observation]: 'observation', [appRoutes.beforeAfter]: 'before-after', [appRoutes.priority]: 'priority', [appRoutes.alerts]: 'alerts', [appRoutes.watersheds]: 'watersheds', [appRoutes.assets]: 'assets' }
export const viewFromPath = (path: string): AppView => pathViews[path] || 'overview'
export const restrictedRoutes = [appRoutes.inspections, appRoutes.observation, appRoutes.beforeAfter, appRoutes.insights, appRoutes.priority, appRoutes.alerts, appRoutes.governmentReports] as const
export const fieldOfficerRestrictedRoutes = [appRoutes.insights, appRoutes.reports, appRoutes.governmentReports, appRoutes.priority] as const
