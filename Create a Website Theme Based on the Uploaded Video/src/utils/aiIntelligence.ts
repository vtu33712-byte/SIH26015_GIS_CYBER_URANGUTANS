// Jal-Impact AI — Universal Geospatial Knowledge & Reasoning Assistant
// Powered by OpenAI (GPT-4o-mini) + Grounded Geospatial Knowledge Engine

import {
  watersheds,
  assets,
  geoImages,
  fieldObservations,
  inspections,
  alerts,
  villages,
  waterBodies,
  spatialInsights,
  priorityZones,
  governmentReports,
  publicReports
} from '../data/mockData'

const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY || ""

export type AIAnalysisSummary = {
  healthIndex: number
  avgVegGain: number
  waterExpansionKm2: number
  activeStructures: number
  criticalAnomalies: number
  topPriorityZone: string
  totalImages: number
  totalInspections: number
}

export type AIAnomaly = {
  id: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  location: string
  recommendation: string
  actionView?: string
}

export type AIForecast = {
  year: number
  vegCoveragePct: number
  waterAreaKm2: number
  rechargeCapacityML: number
}

export type AIMessage = {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  sources?: string[]
  action?: {
    type: string
    target: string
    route?: string
    label?: string
  }
  quickActions?: { label: string; action: () => void }[]
  dataCard?: {
    title: string
    stats: { label: string; value: string; tone?: string }[]
    notes?: string
  }
}


export function getProjectAISummary(): AIAnalysisSummary {
  const avgHealth = Math.round(watersheds.reduce((a, b) => a + b.indicator, 0) / watersheds.length)
  return {
    healthIndex: avgHealth || 82,
    avgVegGain: 11.4,
    waterExpansionKm2: 4.8,
    activeStructures: assets.length,
    criticalAnomalies: alerts.filter(a => a.level === 'critical' || a.level === 'high').length,
    topPriorityZone: 'WHS-021 · Kovilur (Drainage Corridor)',
    totalImages: geoImages.length,
    totalInspections: inspections.length
  }
}

export function getDetectedAnomalies(): AIAnomaly[] {
  return [
    {
      id: 'ANOM-01',
      severity: 'CRITICAL',
      title: 'Post-Monsoon Water Retention Deficit',
      location: 'WHS-021 · Kovilur (12.9970, 79.9850)',
      description: 'Post-monsoon surface retention dropped 14% below baseline. Recent geotagged field photos show heavy silt buildup near the check dam spillway.',
      recommendation: 'Schedule pre-monsoon mechanical desilting and spillway structural reinforcement.',
      actionView: 'gis'
    },
    {
      id: 'ANOM-02',
      severity: 'HIGH',
      title: 'Runoff Erosion & Soil Exposure Pattern',
      location: 'WS-003 · Kundrathur (12.9450, 79.9940)',
      description: 'Multispectral NDVI analysis indicates bare soil vulnerability index above 36% along un-bunded agricultural slopes.',
      recommendation: 'Construct 450m of staggered contour trenches and indigenous afforestation belts.',
      actionView: 'insights'
    },
    {
      id: 'ANOM-03',
      severity: 'MEDIUM',
      title: 'Overdue Field Evidence Verification',
      location: 'WHS-042 · Farm Pond Catchment',
      description: 'Last verified field photograph is older than 45 days. Rapid satellite change detected in downstream water perimeter.',
      recommendation: 'Deploy field officer for mobile geotagged photo capture and condition scoring.',
      actionView: 'evidence'
    }
  ]
}

export function getPredictiveForecast(): AIForecast[] {
  return [
    { year: 2024, vegCoveragePct: 54, waterAreaKm2: 2.8, rechargeCapacityML: 120 },
    { year: 2025, vegCoveragePct: 62, waterAreaKm2: 3.4, rechargeCapacityML: 155 },
    { year: 2026, vegCoveragePct: 71, waterAreaKm2: 4.1, rechargeCapacityML: 190 },
    { year: 2027, vegCoveragePct: 78, waterAreaKm2: 4.7, rechargeCapacityML: 230 },
    { year: 2028, vegCoveragePct: 84, waterAreaKm2: 5.3, rechargeCapacityML: 275 }
  ]
}

function getStoredUploads(): any[] {
  try {
    const raw = localStorage.getItem('jal-impact-uploaded-images')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Universal NLP Search & Grounded Decision Support Processor
 * Evaluates queries against the entire website ontology.
 */
export function processAIQuery(rawQuery: string, navigate?: (view: any) => void): AIMessage {
  const q = rawQuery.toLowerCase().trim()
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const id = `msg-${Date.now()}`
  const userUploads = getStoredUploads()

  // -------------------------------------------------------------
  // 1. SPECIFIC ASSET / STRUCTURE LOOKUP (e.g. WHS-021, Check Dam, Farm Pond)
  // -------------------------------------------------------------
  const assetMatch = assets.find(a => q.includes(a.id.toLowerCase()))
  if (assetMatch) {
    const linkedWs = watersheds.find(w => w.id === assetMatch.watershedId)
    const linkedImg = geoImages.find(g => g.assetId === assetMatch.id)
    const linkedAlert = alerts.find(al => al.assetId === assetMatch.id)

    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `🔍 **Asset Dossier: ${assetMatch.id} (${assetMatch.type})**
Located in **${assetMatch.village}**, **${linkedWs ? linkedWs.name : 'WS-001'}**.
• **Condition:** ${assetMatch.condition.toUpperCase()} ${assetMatch.condition === 'damaged' ? '🔴' : assetMatch.condition === 'moderate' ? '🟡' : '🟢'}
• **Water Status:** ${assetMatch.waterStatus.toUpperCase()}
• **Risk Classification:** ${assetMatch.risk.toUpperCase()} Priority
• **GPS Coordinates:** ${assetMatch.center[0].toFixed(6)}°N, ${assetMatch.center[1].toFixed(6)}°E
• **Last Inspected:** ${assetMatch.lastInspection}
${linkedAlert ? `\n⚠️ **Active Alert:** ${linkedAlert.message} (${linkedAlert.level.toUpperCase()} severity)` : ''}`,
      dataCard: {
        title: `${assetMatch.id} Structural Status`,
        stats: [
          { label: 'Type', value: assetMatch.type },
          { label: 'Condition', value: assetMatch.condition, tone: assetMatch.condition === 'damaged' ? 'red-text' : 'amber-text' },
          { label: 'Risk', value: assetMatch.risk, tone: assetMatch.risk === 'high' ? 'red-text' : 'green-text' }
        ],
        notes: linkedImg ? `Linked Evidence: ${linkedImg.id} captured on ${linkedImg.capturedAt}` : 'No recent photo attached.'
      },
      quickActions: [
        { label: '🗺️ Locate on GIS Map', action: () => navigate?.('gis') },
        { label: '📸 View Evidence Photos', action: () => navigate?.('evidence') },
        { label: '📋 Start Inspection', action: () => navigate?.('operations') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 2. SPECIFIC WATERSHED LOOKUP (e.g. WS-001, Kovilur, Madurantakam, Kancheepuram, Salem)
  // -------------------------------------------------------------
  const wsMatch = watersheds.find(w => 
    q.includes(w.id.toLowerCase()) || 
    q.includes(w.name.toLowerCase().replace(' watershed', '')) ||
    q.includes(w.district.toLowerCase())
  )
  if (wsMatch) {
    const wsAssets = assets.filter(a => a.watershedId === wsMatch.id)
    const wsDamaged = wsAssets.filter(a => a.condition === 'damaged').length
    const wsImages = geoImages.filter(g => g.watershedId === wsMatch.id)

    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `🌊 **Watershed Overview: ${wsMatch.name} (${wsMatch.id})**
Located in **${wsMatch.district} District**.
• **Geospatial Health Score:** **${wsMatch.indicator} / 100** (${wsMatch.status.toUpperCase()})
• **Total Catchment Area:** **${wsMatch.areaHectares} Hectares**
• **Monitored Structures:** **${wsMatch.assetCount} Assets** (${wsAssets.length} mapped in command grid)
• **Field Evidence Photos:** **${wsMatch.imageCount} Geotagged Records** (${wsImages.length} live cards)
• **Damaged Structures:** **${wsDamaged} requiring repair**`,
      dataCard: {
        title: `${wsMatch.name} Diagnostics`,
        stats: [
          { label: 'Health Score', value: `${wsMatch.indicator}/100`, tone: wsMatch.indicator >= 75 ? 'green-text' : 'amber-text' },
          { label: 'Area', value: `${wsMatch.areaHectares} ha` },
          { label: 'Status', value: wsMatch.status, tone: wsMatch.status === 'healthy' ? 'green-text' : 'red-text' }
        ],
        notes: `Center coordinates: ${wsMatch.center[0].toFixed(4)}, ${wsMatch.center[1].toFixed(4)}`
      },
      quickActions: [
        { label: '🗺️ Open Watershed on GIS', action: () => navigate?.('gis') },
        { label: '📊 View Spatial Insights', action: () => navigate?.('insights') },
        { label: '📄 Download Watershed CSV', action: () => navigate?.('reports') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 3. SPECIFIC IMAGE / FIELD PHOTO LOOKUP (e.g. IMG-1024, IMG-1025)
  // -------------------------------------------------------------
  const imgMatch = geoImages.find(img => q.includes(img.id.toLowerCase()))
  if (imgMatch) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `📸 **Geotagged Photo File: ${imgMatch.id}**
• **Location:** ${imgMatch.village} (${imgMatch.coordinates[0].toFixed(6)}, ${imgMatch.coordinates[1].toFixed(6)})
• **Linked Asset:** **${imgMatch.assetId}** in watershed **${imgMatch.watershedId}**
• **Capture Timestamp:** ${imgMatch.capturedAt}
• **Water Condition:** ${imgMatch.waterStatus.toUpperCase()}
• **Structure Condition:** ${imgMatch.condition.toUpperCase()}
• **Public Status:** ${imgMatch.publicApproved ? '✅ Approved for Public Portal' : '🔒 Internal Review Only'}`,
      quickActions: [
        { label: '📷 Open in Evidence Gallery', action: () => navigate?.('evidence') },
        { label: '🗺️ View on Map', action: () => navigate?.('gis') },
        { label: '🔄 Compare Before/After', action: () => navigate?.('before-after') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 4. SPECIFIC INSPECTION OR OFFICER (e.g. INS-2042, Suresh, Field Officer)
  // -------------------------------------------------------------
  const insMatch = inspections.find(ins => q.includes(ins.id.toLowerCase()) || (q.includes('officer') && q.includes(ins.officer.toLowerCase())))
  if (insMatch || q.includes('inspection') || q.includes('officer') || q.includes('inspect')) {
    const target = insMatch || inspections[0]
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `📋 **Field Inspection Record: ${target.id}**
• **Assigned Officer:** **${target.officer}**
• **Target Structure:** **${target.assetId}** (${target.watershedId})
• **Last Inspection Date:** ${target.lastInspection}
• **Condition Finding:** ${target.condition.toUpperCase()}
• **Priority Level:** ${target.priority.toUpperCase()} Priority
• **Verification Status:** **${target.status}**

Total active inspections in queue: **${inspections.length}**.`,
      quickActions: [
        { label: '📋 Open Inspection Center', action: () => navigate?.('operations') },
        { label: '✍️ Submit New Observation', action: () => navigate?.('observation') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 5. ALERTS & RISK (e.g. ALT-042, alert, risk, critical, warning)
  // -------------------------------------------------------------
  if (q.includes('alert') || q.includes('alarm') || q.includes('danger') || q.includes('critical') || q.includes('alt-')) {
    const criticalList = alerts.filter(a => a.level === 'critical' || a.level === 'high')
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `🚨 **Active Risk Alerts (${alerts.length} Total):**
Currently tracking **${criticalList.length} High/Critical Alerts**:
${criticalList.slice(0, 3).map(a => `• **${a.id}** (${a.level.toUpperCase()}): ${a.message} on asset **${a.assetId}**`).join('\n')}

All alerts are prioritized using spatial problem concentration and temporal vegetation signals.`,
      dataCard: {
        title: 'Alert Priority Breakdown',
        stats: [
          { label: 'Critical', value: `${alerts.filter(a => a.level === 'critical').length}`, tone: 'red-text' },
          { label: 'High Priority', value: `${alerts.filter(a => a.level === 'high').length}`, tone: 'amber-text' },
          { label: 'Info & Other', value: `${alerts.filter(a => a.level === 'information').length}` }
        ]
      },
      quickActions: [
        { label: '⚠️ Open Alerts Hub', action: () => navigate?.('alerts') },
        { label: '🗺️ Map Problem Clusters', action: () => navigate?.('gis') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 6. HOW-TO / PLATFORM GUIDANCE
  // -------------------------------------------------------------
  if (q.includes('how to') || q.includes('how do i') || q.includes('where is') || q.includes('help') || q.includes('guide')) {
    if (q.includes('upload') || q.includes('photo') || q.includes('camera')) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `📸 **How to Upload a Geo-Coded Field Photo:**
1. Navigate to **Field Observation** (or click the button below).
2. Click **"Click to Capture / Upload Geo-Coded Image"** to pick a file or use your mobile camera.
3. Tap **"Capture Live GPS"** to auto-detect your exact coordinates.
4. Select the structure type (Check Dam, Farm Pond, etc.) and assess water & condition.
5. Click **"SUBMIT & GEOTAG OBSERVATION"** — it is instantly saved to local storage and appears in the Evidence gallery!`,
        quickActions: [
          { label: '➕ Go to Upload Page', action: () => navigate?.('observation') },
          { label: '📷 View Uploaded Evidence', action: () => navigate?.('evidence') }
        ]
      }
    }
    if (q.includes('report') || q.includes('download') || q.includes('csv') || q.includes('pdf')) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `📑 **How to Generate & Download Reports:**
1. Go to the **Reports** section in the navigation menu.
2. Select any report (e.g. *Monthly Watershed Report*, *Spatial Risk Report*, *AI Watershed Summary*).
3. Click **"Download CSV"** for spreadsheet export, or **"Generate"** $\\rightarrow$ **"Print / Save PDF"** for executive printable format.`,
        quickActions: [
          { label: '📑 Open Reports Page', action: () => navigate?.('reports') }
        ]
      }
    }
    if (q.includes('compare') || q.includes('before')) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `🔄 **How to Use Before / After Change Detection:**
1. Go to **Before / After** in the navigation bar.
2. Drag the interactive split-slider left and right to compare **June 2026** vs **September 2026** satellite imagery.
3. Review temporal metrics for water retention, vegetative cover, and structure durability.`,
        quickActions: [
          { label: '🔄 Open Before / After', action: () => navigate?.('before-after') }
        ]
      }
    }
  }

  // -------------------------------------------------------------
  // 7. STATISTICS & AGGREGATIONS (e.g. how many, total, count, summary)
  // -------------------------------------------------------------
  if (q.includes('how many') || q.includes('total') || q.includes('count') || q.includes('summary') || q.includes('all data') || q.includes('statistics')) {
    const checkDams = assets.filter(a => a.type === 'Check Dam').length
    const farmPonds = assets.filter(a => a.type === 'Farm Pond').length
    const recharges = assets.filter(a => a.type === 'Recharge Structure').length
    const damaged = assets.filter(a => a.condition === 'damaged').length

    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `📊 **Platform Summary & Data Telemetry:**
• **Watersheds Monitored:** **${watersheds.length} Catchments** (Total area: ${watersheds.reduce((a, b) => a + b.areaHectares, 0).toLocaleString()} ha)
• **Total Field Assets:** **${assets.length} Structures**
  - Check Dams: **${checkDams}**
  - Farm Ponds: **${farmPonds}**
  - Recharge Structures: **${recharges}**
• **Structural Health:** **${assets.length - damaged} Operational** / **${damaged} Damaged**
• **Geo-Coded Photos:** **${geoImages.length} Seed Images** + **${userUploads.length} Live Uploads**
• **Active Risk Alerts:** **${alerts.length} Flagged Indicators**`,
      dataCard: {
        title: 'Platform Infrastructure Total',
        stats: [
          { label: 'Check Dams', value: `${checkDams}` },
          { label: 'Farm Ponds', value: `${farmPonds}` },
          { label: 'Damaged', value: `${damaged}`, tone: 'red-text' }
        ]
      },
      quickActions: [
        { label: '🗺️ Explore GIS Map', action: () => navigate?.('gis') },
        { label: '📑 Download CSV Reports', action: () => navigate?.('reports') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 8. VEGETATION, NDVI, SATELLITE
  // -------------------------------------------------------------
  if (q.includes('veg') || q.includes('ndvi') || q.includes('canopy') || q.includes('green') || q.includes('tree') || q.includes('forest')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `🌱 **Multispectral Vegetation Analysis:**
• **NDVI Recovery:** **+11.4% average vegetation gain** from 2024 baseline (54% $\\rightarrow$ 71%).
• **Bare Soil Reduction:** Bare land percentage dropped from **32% $\\rightarrow$ 21%**.
• **Top Performing Region:** **Kovilur Watershed (WS-001)** with **82/100** environmental health index.
• **High Stress Area:** **WS-003 (Kundrathur)** showing 36% bare soil on unbunded agricultural slopes.`,
      quickActions: [
        { label: '📊 Spatial Analytics', action: () => navigate?.('insights') },
        { label: '🔄 Before/After Slider', action: () => navigate?.('before-after') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 9. WATER, STORAGE, RAINFALL, DROUGHT
  // -------------------------------------------------------------
  if (q.includes('water') || q.includes('rain') || q.includes('storage') || q.includes('pond') || q.includes('dam') || q.includes('drought') || q.includes('flood')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `💧 **Hydrological & Water Resource Intelligence:**
• **Seasonal Rainfall:** **842 mm** across monitored districts.
• **Surface Water Area Expansion:** **+4.8 km²** across decentralized storage structures.
• **Monitored Water Bodies:** **${waterBodies.length} Primary Catchment Reservoirs** (${waterBodies.filter(w => w.waterStatus === 'poor').length} showing low water levels).
• **Recharge Efficiency:** Estimated at **76%** due to check dam cascades.`,
      quickActions: [
        { label: '🗺️ View Water Bodies on GIS', action: () => navigate?.('gis') },
        { label: '📑 Water Resource Summary', action: () => navigate?.('reports') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 10. ML PREDICTIVE FORECAST (2027–2028)
  // -------------------------------------------------------------
  if (q.includes('forecast') || q.includes('predict') || q.includes('future') || q.includes('2027') || q.includes('2028') || q.includes('trajectory') || q.includes('ai model')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `📈 **Machine Learning Trajectory Projections (2027–2028):**
Using multivariate regression on historical satellite vegetation (NDVI), surface water (NDWI), and check dam density:
• **2026 (Current):** 71% Vegetation Cover · 4.1 km² Water Storage
• **2027 (Projected):** **78% Vegetation Cover** · **4.7 km² Water Area** · 230 ML Recharge
• **2028 (Projected):** **84% Vegetation Cover** · **5.3 km² Water Area** · 275 ML Recharge

*Assumes regular desilting and completion of planned contour bund extensions.*`,
      dataCard: {
        title: 'Projected Multi-Year Gains',
        stats: [
          { label: '2027 Veg Target', value: '78%', tone: 'green-text' },
          { label: '2028 Veg Target', value: '84%', tone: 'green-text' },
          { label: 'Recharge 2028', value: '275 ML', tone: 'blue-text' }
        ]
      },
      quickActions: [
        { label: '📊 Spatial Intelligence', action: () => navigate?.('insights') },
        { label: '⚡ Priority Actions', action: () => navigate?.('priority') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 11. RECOMMENDATIONS & PRESCRIPTIONS
  // -------------------------------------------------------------
  if (q.includes('recommend') || q.includes('suggest') || q.includes('action') || q.includes('plan') || q.includes('what should') || q.includes('next')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `💡 **AI Prescriptive Action Recommendations:**
1. **Critical Desilting:** Execute silt extraction at **WHS-021 Check Dam (Kovilur)** to resolve 14% post-monsoon retention decline.
2. **Soil Erosion Prevention:** Install 450m contour bunds in **WS-003** along identified runoff gullies.
3. **Field Verification:** Verify **WHS-042** condition using the **Geo-Coded Image Upload** tool.
4. **Plantation:** Afforest barren slopes in Ballyguda corridor before onset of seasonal rains.`,
      quickActions: [
        { label: '🎯 Priority Interventions', action: () => navigate?.('priority') },
        { label: '⚠️ Review Alerts', action: () => navigate?.('alerts') },
        { label: '📑 Download Executive Report', action: () => navigate?.('reports') }
      ]
    }
  }

  // -------------------------------------------------------------
  // 12. GENERIC FUZZY / CONVERSATIONAL FALLBACK
  // -------------------------------------------------------------
  return {
    id,
    sender: 'assistant',
    timestamp: now,
    text: `🤖 I parsed your question about **"${rawQuery}"**. 
I have access to the complete **Jal-Impact database**:
• **8 Watersheds** (${watersheds.map(w => w.id).join(', ')})
• **30 Structures** (Check Dams, Farm Ponds, Recharge Wells)
• **${geoImages.length} Geotagged Field Photos** + **${userUploads.length} User Uploads**
• **${alerts.length} Risk Alerts** & **${inspections.length} Inspection Reports**
• **2024–2028 Satellite Trends & ML Forecasts**

Try asking:
- *"Tell me the condition of WHS-021"*
- *"What is the health score of Kovilur Watershed?"*
- *"List all damaged check dams"*
- *"Show me critical risk alerts"*
- *"How do I upload a geo-coded photo?"*`,
    quickActions: [
      { label: '🚨 Check Anomalies', action: () => navigate?.('alerts') },
      { label: '🌱 Vegetation Trends', action: () => navigate?.('insights') },
      { label: '🗺️ Open GIS Command Map', action: () => navigate?.('gis') }
    ]
  }
}

/**
 * Communicates with the isolated FastAPI RAG backend on port 8001.
 * Automatically falls back to client-side intelligence or direct OpenAI if backend is offline.
 */
export async function askOpenAIAssistant(
  rawQuery: string,
  history: AIMessage[] = [],
  navigate?: (view: any) => void
): Promise<AIMessage> {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const id = `msg-${Date.now()}`

  // 1. ATTEMPT FASTAPI RAG BACKEND (http://localhost:8001/api/ai/chat)
  try {
    const backendController = new AbortController()
    const backendTimeout = setTimeout(() => backendController.abort(), 4500)

    const backendRes = await fetch('http://localhost:8001/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: rawQuery,
        conversation_id: 'session-client',
        history: history.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      }),
      signal: backendController.signal
    })
    clearTimeout(backendTimeout)

    if (backendRes.ok) {
      const data = await backendRes.json()
      
      // If backend detected a navigation action, execute it safely
      if (data.action && data.action.type === 'navigate' && data.action.target && navigate) {
        navigate(data.action.target)
      }

      const quickActions: { label: string; action: () => void }[] = []
      if (data.action?.target && navigate) {
        quickActions.push({
          label: `🔗 Go to ${data.action.label || data.action.target}`,
          action: () => navigate(data.action.target)
        })
      }
      quickActions.push({ label: '🗺️ Open GIS Map', action: () => navigate?.('gis') })
      quickActions.push({ label: '📸 View Evidence', action: () => navigate?.('evidence') })

      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: data.response,
        sources: data.sources || [],
        action: data.action,
        quickActions
      }
    }
  } catch (backendErr) {
    console.info('FastAPI AI backend not reachable, seamlessly using client intelligence engine:', backendErr)
  }

  // 2. FALLBACK: DIRECT OPENAI CALL IF API KEY PRESENT
  try {
    const formattedHistory = history.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }))

    const messagesPayload = [
      {
        role: 'system',
        content: `You are Jal-Bot, the official AI Assistant for the JAL IMPACT Geospatial Watershed platform.
Provide helpful, concise, well-formatted explanations about watershed management, NDVI/NDWI, GIS maps, and before/after comparisons.`
      },
      ...formattedHistory,
      { role: 'user', content: rawQuery }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 650
      })
    })

    if (response.ok) {
      const data = await response.json()
      const replyText = data.choices?.[0]?.message?.content || ''
      if (replyText) {
        return {
          id,
          sender: 'assistant',
          timestamp: now,
          text: replyText,
          sources: ['JAL IMPACT Platform Knowledge'],
          quickActions: [
            { label: '🗺️ Open GIS Map', action: () => navigate?.('gis') },
            { label: '⚡ Priority Interventions', action: () => navigate?.('priority') }
          ]
        }
      }
    }
  } catch (openAiErr) {
    console.info('Direct OpenAI API fallback failed, evaluating grounded rule engine:', openAiErr)
  }

  // 3. FALLBACK: GROUNDED LOCAL CLIENT ONTOLOGY ENGINE (Guarantees zero-failure operation)
  return processAIQuery(rawQuery, navigate)
}



