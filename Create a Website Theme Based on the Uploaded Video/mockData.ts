import type { Alert, Asset, FieldObservation, GeoCodedImage, Inspection, PriorityZone, Report, SpatialInsight, TrendPoint, Village, WaterBody, Watershed } from '../types/domain'

const places = ['Kovilur', 'Mangadu', 'Madurantakam', 'Kundrathur', 'Padappai', 'Sriperumbudur', 'Oragadam', 'Uthiramerur']
const centers: [number, number][] = [[12.979,79.970],[13.041,80.094],[12.511,79.884],[12.997,80.097],[12.879,80.026],[12.967,79.944],[12.831,79.982],[12.615,79.758]]
export const trendData: TrendPoint[] = [
  { date:'01 Jun 2026', month:'Jun 2026', waterAvailability:69, vegetation:61, fieldObservations:82 },
  { date:'01 Jul 2026', month:'Jul 2026', waterAvailability:64, vegetation:62, fieldObservations:96 },
  { date:'01 Aug 2026', month:'Aug 2026', waterAvailability:54, vegetation:60, fieldObservations:111 },
  { date:'11 Sep 2026', month:'Sep 2026', waterAvailability:42, vegetation:58, fieldObservations:128 },
]
export const watersheds: Watershed[] = places.map((village, index) => ({ id:`WS-${String(index+1).padStart(3,'0')}`, name:`${village} Watershed`, village, district:index === 2 ? 'Chengalpattu' : 'Kancheepuram', areaHectares:[2450,1980,3120,1740,2860,3380,2210,2640][index], assetCount:[84,67,91,58,73,102,64,78][index], imageCount:[428,316,502,274,391,544,305,362][index], indicator:[82,76,64,79,71,84,59,77][index], status:index === 2 || index === 6 ? 'attention' : index === 4 ? 'moderate' : 'healthy', center:centers[index], lastUpdated:['11 Sep 2026','10 Sep 2026','11 Sep 2026','09 Sep 2026','08 Sep 2026','10 Sep 2026','11 Sep 2026','07 Sep 2026'][index], waterAvailability:[42,57,36,62,48,73,31,61][index], vegetation:[58,64,49,67,55,70,47,63][index], trend:trendData }))

const pinnedIds = ['WHS-009','WHS-013','WHS-021','WHS-028','WHS-042','WHS-087']
const generatedIds = Array.from({length:100},(_,index)=>`WHS-${String(index+1).padStart(3,'0')}`).filter(id=>!pinnedIds.includes(id)).slice(0,24)
const assetIds = [...pinnedIds,...generatedIds]
const assetOverrides: Record<string, Partial<Asset>> = {
  'WHS-009':{type:'Farm Pond',village:'Madurantakam',watershedId:'WS-003',condition:'moderate',waterStatus:'poor',risk:'high',center:[12.511,79.884]},
  'WHS-013':{type:'Recharge Structure',village:'Kundrathur',watershedId:'WS-004',condition:'good',waterStatus:'moderate',risk:'medium',center:[12.997,80.097]},
  'WHS-021':{type:'Check Dam',village:'Kovilur',watershedId:'WS-001',condition:'moderate',waterStatus:'poor',risk:'high',center:[12.997,79.985],lastInspection:'03 Sep 2026',publicSummary:'Moderate condition check dam with poor water status in the latest approved field image.'},
  'WHS-028':{type:'Farm Pond',village:'Kovilur',watershedId:'WS-001',condition:'good',waterStatus:'moderate',risk:'medium',center:[12.976,79.990]},
  'WHS-042':{type:'Farm Pond',village:'Madurantakam',watershedId:'WS-003',condition:'damaged',waterStatus:'poor',risk:'high',center:[12.961,79.952]},
  'WHS-087':{type:'Recharge Structure',village:'Mangadu',watershedId:'WS-002',condition:'moderate',waterStatus:'moderate',risk:'high',center:[12.978,80.005]},
}
const imageAssetIds = ['WHS-021','WHS-028','WHS-013','WHS-042','WHS-009','WHS-087']
export const assets: Asset[] = assetIds.map((id,index)=>{
  const watershed=watersheds[index%watersheds.length]
  const override=assetOverrides[id]
  const selectedWatershed=watersheds.find(item=>item.id===(override?.watershedId||watershed.id))||watershed
  const coordinates=override?.center||[selectedWatershed.center[0]+((index%5)-2)*.004,selectedWatershed.center[1]+((index%7)-3)*.004] as [number,number]
  const condition=override?.condition||(index%9===0?'damaged':index%4===0?'good':'moderate')
  const waterStatus=override?.waterStatus||(index%6===0?'poor':index%3===0?'good':'moderate')
  const risk=override?.risk||(condition==='damaged'&&waterStatus==='poor'?'high':index%7===0?'low':'medium')
  return {id,type:override?.type||['Check Dam','Farm Pond','Recharge Structure','Water Harvesting Tank','Canal'][index%5],village:override?.village||selectedWatershed.village||places[index%8],watershedId:selectedWatershed.id,condition,waterStatus,risk,lastInspection:override?.lastInspection||`${String(10-index%8).padStart(2,'0')} Sep 2026`,center:coordinates,name:`${override?.type||'Watershed Asset'} ${id.slice(-3)}`,district:selectedWatershed.district,observationCount:4+(index*3)%19,developmentStatus:risk==='high'?'Field verification recommended':'Monitoring on schedule',publicSummary:override?.publicSummary||`${condition} condition asset at ${selectedWatershed.village}; latest approved observation reports ${waterStatus} water.`,internalRecommendation:risk==='high'?'Prioritize field verification and review the latest geo-coded evidence.':'Continue scheduled monitoring and update the next field visit.'}
})

const imageDates=['11 Sep 2026','10 Sep 2026','09 Sep 2026','08 Sep 2026','07 Sep 2026','06 Sep 2026','05 Sep 2026','04 Sep 2026','03 Sep 2026','02 Sep 2026','29 Aug 2026','25 Aug 2026']
export const geoImages: GeoCodedImage[] = Array.from({length:50},(_,index)=>{
  const assetId=index<imageAssetIds.length?imageAssetIds[index]:assetIds[(index*7+2)%assetIds.length]
  const asset=assets.find(item=>item.id===assetId)!
  const watershed=watersheds.find(item=>item.id===asset.watershedId)!
  const waterStatus=index===0||index===3||index===4?'poor':index%5===0?'good':index%2===0?'moderate':'poor'
  const condition=index===0?'moderate':index===3?'damaged':index%4===0?'good':'moderate'
  const date=imageDates[index%imageDates.length]
  const capturedAt=`${date}, ${String(9+index%8).padStart(2,'0')}:42`
  const observation=index===0?'Low water presence with moderate check dam condition; confirm storage after field visit.':waterStatus==='poor'?'Low visible water level; compare with the previous capture and verify on site.':'Geo-coded field image available for watershed monitoring and comparison.'
  return {id:`IMG-${1024+index}`,watershedId:watershed.id,assetId,village:asset.village,capturedAt,coordinates:[asset.center[0]+(index%3)*.0004,asset.center[1]-(index%4)*.0003],waterStatus,condition,publicApproved:index%7!==5,observation,capturedBy:`Field Officer ${String(index%6+1).padStart(2,'0')}`,source:'demo'}
})
assets.forEach(asset=>{asset.latestImageId=geoImages.find(image=>image.assetId===asset.id)?.id||'IMG-1024'})

export const fieldObservations: FieldObservation[] = Array.from({length:20},(_,index)=>{
  const image=geoImages[index]
  const asset=assets.find(item=>item.id===image.assetId)!
  return {id:`OBS-${String(2026001+index)}`,assetId:asset.id,watershedId:asset.watershedId,capturedAt:image.capturedAt,water:image.waterStatus,condition:image.condition,vegetation:index%3?'good':'moderate',erosion:index%5===0,status:index<7?'verified':index<15?'pending_verification':'needs_follow_up',officer:image.capturedBy,coordinates:image.coordinates,imageId:image.id,note:image.observation}
})
export const inspections: Inspection[] = assets.slice(0,20).map((asset,index)=>({id:`INS-${String(2042-index)}`,assetId:asset.id,watershedId:asset.watershedId,officer:`Field Officer ${String(index%12+1).padStart(2,'0')}`,lastInspection:asset.lastInspection,condition:asset.condition,priority:asset.risk,status:index<4?'Completed':index===4?'In progress':'Due',scheduledDate:`${String(12+index).padStart(2,'0')} Sep 2026`,completedDate:index<4?`${String(8+index).padStart(2,'0')} Sep 2026`:undefined,summary:index<4?'Site condition recorded; geo-coded evidence attached.':'Confirm water level, structure condition and latest imagery.'}))

const firstAlerts: Alert[] = [
  {id:'ALT-2026-001',level:'critical',title:'Critical water decline',message:'Water availability declined by 12% in the latest review period.',assetId:'WHS-021',watershedId:'WS-001',observationDate:'11 Sep 2026',evidenceCount:1,reviewed:false,location:'Kovilur',date:'11 Sep 2026',evidenceIds:['IMG-1024'],recommendation:'Field verification recommended; inspect water storage and check-dam condition.'},
  {id:'ALT-2026-002',level:'high',title:'Structural deterioration detected',message:'Recent evidence indicates visible deterioration at Farm Pond WHS-042.',assetId:'WHS-042',watershedId:'WS-003',observationDate:'10 Sep 2026',evidenceCount:1,reviewed:false,location:'Madurantakam',date:'10 Sep 2026',evidenceIds:['IMG-1027'],recommendation:'Review the latest image and schedule an engineering inspection.'},
  {id:'ALT-2026-003',level:'medium',title:'Vegetation change requires review',message:'Vegetation cover is below the seasonal reference in the latest capture.',assetId:'WHS-087',watershedId:'WS-002',observationDate:'09 Sep 2026',evidenceCount:1,reviewed:false,location:'Mangadu',date:'09 Sep 2026',evidenceIds:['IMG-1029'],recommendation:'Compare with the prior season and add a field note at the next visit.'},
  {id:'ALT-2026-004',level:'information',title:'Watershed status updated',message:'The Kovilur watershed profile has a new approved image and monitoring update.',assetId:'WHS-021',watershedId:'WS-001',observationDate:'08 Sep 2026',evidenceCount:1,reviewed:false,location:'Kovilur',date:'08 Sep 2026',evidenceIds:['IMG-1025'],recommendation:'Open the watershed profile to review the latest public-safe summary.'},
]
export const alerts: Alert[] = [...firstAlerts,...Array.from({length:11},(_,index)=>{
  const asset=assets[(index+6)%assets.length]
  const image=geoImages.find(item=>item.assetId===asset.id)
  const level: Alert['level']=(['high','medium','information','critical','medium','high','information','medium','high','critical','information'] as Alert['level'][])[index]
  return {id:`ALT-2026-${String(index+5).padStart(3,'0')}`,level,title:level==='critical'?'Priority water condition review':level==='high'?'Asset condition requires verification':level==='medium'?'Seasonal indicator changed':'New field evidence available',message:level==='critical'?'Water status and recent observations indicate a priority field review.':'A prototype spatial signal has changed and should be reviewed against field evidence.',assetId:asset.id,watershedId:asset.watershedId,observationDate:image?.capturedAt||'06 Sep 2026',evidenceCount:image?1:0,reviewed:false,location:asset.village,date:image?.capturedAt||'06 Sep 2026',evidenceIds:image?[image.id]:[],recommendation:level==='critical'||level==='high'?'Open the GIS location and verify the finding in the field.':'Review the location profile and compare recent observations.'}
})]

export const villages: Village[] = [
  ['Kovilur','WS-001',4230,1040,[12.979,79.970]],['Mangadu','WS-002',6170,1520,[13.041,80.094]],['Madurantakam','WS-003',8920,2190,[12.511,79.884]],['Kundrathur','WS-004',7280,1820,[12.997,80.097]],['Padappai','WS-005',5460,1320,[12.879,80.026]],['Sriperumbudur','WS-006',9670,2410,[12.967,79.944]],['Oragadam','WS-007',3790,910,[12.831,79.982]],['Uthiramerur','WS-008',4830,1180,[12.615,79.758]],['Walajabad','WS-001',3510,860,[12.793,79.823]],['Singaperumal Koil','WS-005',2890,710,[12.759,80.010]],
].map(([name,watershedId,population,households,center],index)=>({id:`VIL-${String(index+1).padStart(3,'0')}`,name:name as string,watershedId:watershedId as string,population:population as number,householdCount:households as number,assetCount:24-index,agriculturalArea:145-index*4,center:center as [number,number],waterAccess:index===2||index===6?'needs_attention':index%3===0?'moderate':'good'}))
export const waterBodies: WaterBody[] = watersheds.map((watershed,index)=>({id:`WB-${String(14+index).padStart(3,'0')}`,villageId:villages[index].id,name:`${watershed.village} ${index%2?'Reservoir':'Water Tank'}`,type:index%2?'reservoir':'tank',waterStatus:watershed.waterAvailability!<45?'poor':watershed.waterAvailability!<65?'moderate':'good',waterLevel:watershed.waterAvailability,trend:index===0?'54% → 42%':'Seasonal monitoring',observedAt:watershed.lastUpdated||'11 Sep 2026',center:watershed.center}))
export const spatialInsights: SpatialInsight[] = [
  {id:'SI-001',label:'Possible erosion',count:18,priority:'high',description:'Potential erosion concentration along the south-eastern drainage edge.',date:'11 Sep 2026',location:'Kovilur',coordinates:[12.991,79.984],magnitude:74,watershedId:'WS-001'},
  {id:'SI-002',label:'Visible deterioration',count:12,priority:'high',description:'Assets with visible decline in recent geo-coded evidence.',date:'10 Sep 2026',location:'Madurantakam',coordinates:[12.961,79.952],magnitude:63,watershedId:'WS-003'},
  {id:'SI-003',label:'Declining water',count:9,priority:'medium',description:'September water estimate is 12 points below the August reference.',date:'11 Sep 2026',location:'Kovilur',coordinates:[12.979,79.970],magnitude:68,watershedId:'WS-001'},
  {id:'SI-004',label:'Reduced vegetation',count:7,priority:'medium',description:'Vegetation stress signal in the latest seasonal comparison.',date:'09 Sep 2026',location:'Oragadam',coordinates:[12.831,79.982],magnitude:57,watershedId:'WS-007'},
  {id:'SI-005',label:'Water-body status change',count:6,priority:'medium',description:'Recent image observations report poor water status at linked assets.',date:'08 Sep 2026',location:'Padappai',coordinates:[12.879,80.026],magnitude:49,watershedId:'WS-005'},
  {id:'SI-006',label:'Vegetation recovery',count:4,priority:'low',description:'A moderate recovery signal is visible around monitored assets.',date:'07 Sep 2026',location:'Sriperumbudur',coordinates:[12.967,79.944],magnitude:42,watershedId:'WS-006'},
]
export const priorityZones: PriorityZone[] = assets.slice(0,8).map((asset,index)=>({id:`PZ-${asset.id.slice(-3)}`,assetId:asset.id,watershedId:asset.watershedId,priority:asset.risk==='high'?'high':asset.risk==='medium'?'medium':'low',reasons:[asset.waterStatus==='poor'?'Low water presence':'Seasonal indicator change',asset.condition==='damaged'||asset.condition==='critical'?'Visible deterioration':'Recent field evidence',asset.risk==='high'?'Field verification recommended':'Continue scheduled review'],recommendedAction:asset.risk==='high'?'Field verification':asset.risk==='medium'?'Continue scheduled monitoring':'Routine monitoring',lastChanged:index===0?'11 Sep 2026':'08 Sep 2026'}))
export const publicReports: Report[] = [
  {id:'PUB-01',title:'Watershed Development Overview',audience:'public',description:'Public progress, resources and approved imagery across monitored watersheds.',generatedAt:'11 Sep 2026',updatedAt:'11 Sep 2026'},
  {id:'PUB-02',title:'Public Watershed Status',audience:'public',description:'Approved watershed status, development indicator and recent public updates.',generatedAt:'10 Sep 2026',updatedAt:'10 Sep 2026'},
  {id:'PUB-03',title:'Water Resource Summary',audience:'public',description:'A high-level summary of public water-resource monitoring and seasonal trends.',generatedAt:'09 Sep 2026',updatedAt:'09 Sep 2026'},
]
export const governmentReports: Report[] = ['Watershed Development Report','Spatial Risk Report','Asset Condition Report','Field Observation Report','AI Watershed Summary','Priority Intervention Report'].map((title,index)=>({id:`GOV-0${index+1}`,title,audience:'government',description:`${title} prepared from the connected prototype records for official review.`,generatedAt:'11 Sep 2026',updatedAt:'11 Sep 2026',containsAI:title==='AI Watershed Summary'}))

export const mockWatersheds=watersheds
export const mockAssets=assets
export const mockGeoCodedImages=geoImages
export const mockFieldObservations=fieldObservations
export const mockInspections=inspections
export const mockAlerts=alerts
export const mockVillages=villages
export const mockWaterBodies=waterBodies
export const mockSpatialInsights=spatialInsights
export const mockPriorityZones=priorityZones
export const mockReports=[...publicReports,...governmentReports]
export const findWatershed=(id:string)=>watersheds.find(item=>item.id===id)
export const findAsset=(id:string)=>assets.find(item=>item.id===id)
export const findImage=(id:string)=>geoImages.find(item=>item.id===id)
export const getWatershedImages=(id:string,publicOnly=false)=>geoImages.filter(item=>item.watershedId===id&&(!publicOnly||item.publicApproved))
export const getAssetImages=(id:string,publicOnly=false)=>geoImages.filter(item=>item.assetId===id&&(!publicOnly||item.publicApproved))
