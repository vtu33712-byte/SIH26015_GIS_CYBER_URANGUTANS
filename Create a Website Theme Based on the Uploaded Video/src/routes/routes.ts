export const appRoutes = {
  overview: '/', gis: '/gis', geoImages: '/geo-images', watersheds: '/watersheds', assets: '/watershed-assets',
  insights: '/development-insights', inspections: '/inspections', observation: '/field-observation', beforeAfter: '/before-after',
  priority: '/priority-intervention', alerts: '/alerts', reports: '/reports', governmentReports: '/government-reports',
} as const
export const restrictedRoutes = [appRoutes.inspections, appRoutes.observation, appRoutes.beforeAfter, appRoutes.priority, appRoutes.alerts, appRoutes.governmentReports] as const
