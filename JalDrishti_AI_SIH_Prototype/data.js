// JalDrishti AI — SIH Prototype Data & Store Layer
const DEMO_MODE = true;

const DATA_INFO = {
  project: "JalDrishti AI",
  version: "1.0 Prototype",
  dataType: "Representative Demo Dataset",
  sourceNote: "Prototype values for SIH demonstration; not official SRISHTI-DRISHTI or government field data.",
  lastUpdated: "2026-09-29"
};

const SEED_WATERSHEDS = [
  { id: "WS-001", name: "Kaveri Watershed", state: "Tamil Nadu", district: "Salem", areaKm2: 42.6, villages: 8, vegetation: 68, waterIndex: 61, interventionCount: 47, priority: "Medium", status: "Active Monitoring", center: [11.6643, 78.146] },
  { id: "WS-002", name: "Vaigai Watershed", state: "Tamil Nadu", district: "Madurai", areaKm2: 38.4, villages: 6, vegetation: 54, waterIndex: 48, interventionCount: 35, priority: "High", status: "Needs Attention", center: [9.9252, 78.1198] },
  { id: "WS-003", name: "Palar Watershed", state: "Tamil Nadu", district: "Vellore", areaKm2: 51.8, villages: 11, vegetation: 73, waterIndex: 69, interventionCount: 62, priority: "Low", status: "Good", center: [12.9165, 79.1325] },
  { id: "WS-004", name: "Noyyal Watershed", state: "Tamil Nadu", district: "Coimbatore", areaKm2: 45.2, villages: 9, vegetation: 59, waterIndex: 52, interventionCount: 41, priority: "Medium", status: "Active Monitoring", center: [11.0168, 76.9558] },
  { id: "WS-005", name: "Thamirabarani Watershed", state: "Tamil Nadu", district: "Tirunelveli", areaKm2: 48.7, villages: 10, vegetation: 79, waterIndex: 76, interventionCount: 58, priority: "Low", status: "Good", center: [8.7139, 77.7567] },
  { id: "WS-006", name: "Amaravathi Watershed", state: "Tamil Nadu", district: "Tiruppur", areaKm2: 36.9, villages: 7, vegetation: 57, waterIndex: 45, interventionCount: 39, priority: "High", status: "Needs Attention", center: [10.7867, 77.2807] },
  { id: "WS-007", name: "Bhavani Watershed", state: "Tamil Nadu", district: "Erode", areaKm2: 57.3, villages: 13, vegetation: 71, waterIndex: 67, interventionCount: 81, priority: "Low", status: "Good", center: [11.341, 77.7172] },
  { id: "WS-008", name: "Manimuthar Watershed", state: "Tamil Nadu", district: "Tenkasi", areaKm2: 31.5, villages: 5, vegetation: 49, waterIndex: 43, interventionCount: 28, priority: "High", status: "Needs Attention", center: [8.9595, 77.3152] }
];

const SEED_INTERVENTIONS = [
  ["INT-001", "WS-001", "Check Dam", 11.6643, 78.146, "Mettur", "Salem", "2025-07-18", "Completed", "Good", "Positive"],
  ["INT-002", "WS-001", "Farm Pond", 11.6102, 78.1245, "Kolathur", "Salem", "2025-08-04", "Completed", "Good", "Positive"],
  ["INT-003", "WS-001", "Contour Bund", 11.6851, 78.2023, "Mecheri", "Salem", "2025-09-12", "Completed", "Moderate", "Positive"],
  ["INT-004", "WS-001", "Percolation Pond", 11.6412, 78.1718, "Nangavalli", "Salem", "2026-01-22", "Under Monitoring", "Good", "Positive"],
  ["INT-005", "WS-001", "Afforestation", 11.7032, 78.1587, "Omalur", "Salem", "2026-02-15", "Completed", "Good", "Positive"],
  ["INT-006", "WS-002", "Farm Pond", 9.9252, 78.1198, "Melur", "Madurai", "2025-06-12", "Completed", "Moderate", "Moderate"],
  ["INT-007", "WS-002", "Check Dam", 9.9561, 78.0673, "Alanganallur", "Madurai", "2025-08-20", "Completed", "Good", "Positive"],
  ["INT-008", "WS-002", "Contour Bund", 9.8895, 78.1536, "Kottampatti", "Madurai", "2026-01-17", "Under Monitoring", "Moderate", "Moderate"],
  ["INT-009", "WS-002", "Percolation Pond", 9.9017, 78.0983, "Thirumangalam", "Madurai", "2026-03-10", "Completed", "Good", "Positive"],
  ["INT-010", "WS-003", "Check Dam", 12.9165, 79.1325, "Katpadi", "Vellore", "2025-05-14", "Completed", "Good", "Positive"],
  ["INT-011", "WS-003", "Farm Pond", 12.9482, 79.1754, "Gudiyatham", "Vellore", "2025-09-08", "Completed", "Good", "Positive"],
  ["INT-012", "WS-003", "Afforestation", 12.8832, 79.0841, "Anaicut", "Vellore", "2026-02-02", "Completed", "Good", "Positive"],
  ["INT-013", "WS-003", "Contour Bund", 12.9645, 79.1022, "K.V.Kuppam", "Vellore", "2026-02-22", "Completed", "Good", "Positive"],
  ["INT-014", "WS-004", "Check Dam", 11.0168, 76.9558, "Perur", "Coimbatore", "2025-07-11", "Completed", "Moderate", "Moderate"],
  ["INT-015", "WS-004", "Farm Pond", 11.0451, 76.9845, "Madampatti", "Coimbatore", "2025-10-05", "Completed", "Good", "Positive"],
  ["INT-016", "WS-004", "Afforestation", 10.9864, 76.9321, "Kovaipudur", "Coimbatore", "2026-02-18", "Under Monitoring", "Good", "Positive"],
  ["INT-017", "WS-005", "Check Dam", 8.7139, 77.7567, "Ambasamudram", "Tirunelveli", "2025-06-08", "Completed", "Excellent", "Positive"],
  ["INT-018", "WS-005", "Farm Pond", 8.7421, 77.7812, "Kallidaikurichi", "Tirunelveli", "2025-09-22", "Completed", "Good", "Positive"],
  ["INT-019", "WS-005", "Afforestation", 8.6814, 77.7342, "Papanasam", "Tirunelveli", "2026-01-14", "Completed", "Excellent", "Positive"],
  ["INT-020", "WS-005", "Percolation Pond", 8.6998, 77.8031, "Cheranmahadevi", "Tirunelveli", "2026-03-04", "Completed", "Good", "Positive"],
  ["INT-021", "WS-006", "Check Dam", 10.7867, 77.2807, "Dharapuram", "Tiruppur", "2025-08-17", "Completed", "Moderate", "Moderate"],
  ["INT-022", "WS-006", "Farm Pond", 10.8124, 77.3015, "Kangeyam", "Tiruppur", "2025-11-02", "Under Monitoring", "Moderate", "Moderate"],
  ["INT-023", "WS-006", "Contour Bund", 10.7642, 77.2531, "Mulanur", "Tiruppur", "2026-01-29", "Completed", "Good", "Positive"],
  ["INT-024", "WS-007", "Check Dam", 11.341, 77.7172, "Bhavani", "Erode", "2025-05-21", "Completed", "Excellent", "Positive"],
  ["INT-025", "WS-007", "Farm Pond", 11.3651, 77.7448, "Anthiyur", "Erode", "2025-08-14", "Completed", "Good", "Positive"],
  ["INT-026", "WS-007", "Afforestation", 11.3165, 77.6842, "Gobichettipalayam", "Erode", "2025-12-12", "Completed", "Excellent", "Positive"],
  ["INT-027", "WS-007", "Percolation Pond", 11.3892, 77.7011, "Sathyamangalam", "Erode", "2026-02-10", "Completed", "Good", "Positive"],
  ["INT-028", "WS-008", "Check Dam", 8.9595, 77.3152, "Tenkasi", "Tenkasi", "2025-07-28", "Completed", "Moderate", "Moderate"],
  ["INT-029", "WS-008", "Farm Pond", 8.9821, 77.3378, "Kadayanallur", "Tenkasi", "2025-10-14", "Under Monitoring", "Moderate", "Moderate"],
  ["INT-030", "WS-008", "Contour Bund", 8.9345, 77.2921, "Sankarankovil", "Tenkasi", "2026-01-18", "Completed", "Good", "Positive"],
  ["INT-031", "WS-008", "Afforestation", 8.9722, 77.2804, "Alangulam", "Tenkasi", "2026-03-01", "Under Monitoring", "Moderate", "Moderate"],
  ["INT-032", "WS-008", "Percolation Pond", 8.9471, 77.3482, "Pavoorchatram", "Tenkasi", "2026-03-15", "Completed", "Good", "Positive"]
].map(x => ({
  id: x[0],
  watershedId: x[1],
  type: x[2],
  latitude: x[3],
  longitude: x[4],
  village: x[5],
  district: x[6],
  date: x[7],
  status: x[8],
  condition: x[9],
  impact: x[10],
  isCustom: false
}));

const SEED_GEO_CODED_IMAGES = SEED_INTERVENTIONS.slice(0, 12).map((x, i) => ({
  id: `IMG-${String(i + 1).padStart(3, "0")}`,
  interventionId: x.id,
  watershedId: x.watershedId,
  imageSrc: i % 2 === 0 ? "field-obs-2.jpg" : "field-obs-1.jpg",
  type: x.type,
  latitude: x.latitude,
  longitude: x.longitude,
  village: x.village,
  date: x.date,
  imageStatus: i === 6 || i === 10 ? "Pending Review" : "Verified",
  detectedObjects: [x.type, "Water", "Vegetation"],
  confidence: 82 + ((i * 3) % 16),
  isCustom: false
}));

const satelliteAnalysis = [];
const yearly = {
  "WS-001": [[2024, 0.42, 0.21, 51, 2.8, 31], [2025, 0.48, 0.26, 59, 3.2, 27], [2026, 0.55, 0.32, 68, 3.7, 22]],
  "WS-002": [[2024, 0.38, 0.17, 42, 2.1, 39], [2025, 0.44, 0.21, 48, 2.4, 34], [2026, 0.47, 0.24, 54, 2.8, 30]],
  "WS-003": [[2024, 0.51, 0.31, 61, 3.7, 21], [2025, 0.58, 0.36, 67, 4.0, 17], [2026, 0.63, 0.41, 73, 4.4, 13]],
  "WS-004": [[2024, 0.41, 0.19, 48, 2.4, 34], [2025, 0.46, 0.23, 54, 2.7, 29], [2026, 0.51, 0.28, 59, 3.1, 25]],
  "WS-005": [[2024, 0.57, 0.38, 68, 4.2, 17], [2025, 0.64, 0.44, 74, 4.6, 13], [2026, 0.69, 0.49, 79, 5.1, 10]],
  "WS-006": [[2024, 0.37, 0.16, 44, 1.9, 41], [2025, 0.42, 0.19, 51, 2.2, 36], [2026, 0.46, 0.23, 57, 2.5, 31]],
  "WS-007": [[2024, 0.54, 0.34, 62, 4.1, 19], [2025, 0.60, 0.39, 67, 4.5, 15], [2026, 0.65, 0.44, 71, 4.9, 12]],
  "WS-008": [[2024, 0.34, 0.14, 39, 1.5, 45], [2025, 0.39, 0.18, 44, 1.8, 40], [2026, 0.43, 0.21, 49, 2.1, 36]]
};
Object.entries(yearly).forEach(([watershedId, rows]) =>
  rows.forEach(r =>
    satelliteAnalysis.push({
      watershedId,
      year: r[0],
      ndvi: r[1],
      ndwi: r[2],
      vegetationPercent: r[3],
      waterAreaKm2: r[4],
      bareLandPercent: r[5]
    })
  )
);

const changeDetection = [
  ["CD-001", "WS-001", "Mettur", "Check Dam", [43, 1.8, 38], [61, 2.6, 25], [18, 0.8, -13], 89],
  ["CD-002", "WS-002", "Melur", "Farm Pond", [38, 1.4, 42], [54, 2.1, 30], [16, 0.7, -12], 86],
  ["CD-003", "WS-003", "Katpadi", "Check Dam", [52, 2.8, 23], [71, 3.9, 14], [19, 1.1, -9], 93],
  ["CD-004", "WS-004", "Perur", "Check Dam", [42, 1.9, 36], [59, 2.8, 25], [17, 0.9, -11], 88],
  ["CD-005", "WS-005", "Ambasamudram", "Check Dam", [61, 3.7, 19], [79, 4.9, 10], [18, 1.2, -9], 95],
  ["CD-006", "WS-006", "Dharapuram", "Check Dam", [36, 1.3, 44], [52, 2.0, 32], [16, 0.7, -12], 87],
  ["CD-007", "WS-007", "Bhavani", "Check Dam", [56, 3.2, 21], [68, 4.3, 13], [12, 1.1, -8], 92],
  ["CD-008", "WS-008", "Tenkasi", "Check Dam", [32, 1.1, 48], [46, 1.8, 37], [14, 0.7, -11], 84]
].map(x => ({
  id: x[0],
  watershedId: x[1],
  location: x[2],
  intervention: x[3],
  beforeYear: 2024,
  afterYear: 2026,
  before: { vegetation: x[4][0], waterArea: x[4][1], bareLand: x[4][2] },
  after: { vegetation: x[5][0], waterArea: x[5][1], bareLand: x[5][2] },
  changes: { vegetation: x[6][0], waterArea: x[6][1], bareLand: x[6][2] },
  confidence: x[7]
}));

const landUse = [
  { watershedId: "WS-001", year: 2026, categories: { Agriculture: 38, Vegetation: 27, WaterBodies: 9, BuiltUp: 8, BareLand: 18 } },
  { watershedId: "WS-002", year: 2026, categories: { Agriculture: 42, Vegetation: 22, WaterBodies: 7, BuiltUp: 10, BareLand: 19 } },
  { watershedId: "WS-003", year: 2026, categories: { Agriculture: 35, Vegetation: 36, WaterBodies: 11, BuiltUp: 7, BareLand: 11 } }
];

const waterResources = [
  ["WR-001", "WS-001", "Mettur Check Dam", "Check Dam", 1.8, 72, "Good"],
  ["WR-002", "WS-001", "Kolathur Farm Pond", "Farm Pond", 0.9, 64, "Good"],
  ["WR-003", "WS-001", "Nangavalli Pond", "Percolation Pond", 1.2, 47, "Moderate"],
  ["WR-004", "WS-002", "Melur Farm Pond", "Farm Pond", 0.8, 52, "Moderate"],
  ["WR-005", "WS-003", "Katpadi Check Dam", "Check Dam", 2.1, 81, "Excellent"],
  ["WR-006", "WS-005", "Ambasamudram Check Dam", "Check Dam", 2.8, 88, "Excellent"],
  ["WR-007", "WS-006", "Dharapuram Check Dam", "Check Dam", 1.1, 42, "Moderate"],
  ["WR-008", "WS-008", "Tenkasi Check Dam", "Check Dam", 1.3, 39, "Needs Monitoring"]
].map(x => ({ id: x[0], watershedId: x[1], name: x[2], type: x[3], capacityMillionLitres: x[4], waterLevel: x[5], status: x[6] }));

const priorityZones = [
  ["ZONE-A", "WS-001", "Zone A", 11.6752, 78.1681, 38, 31, 67, "High", "Field verification recommended"],
  ["ZONE-B", "WS-001", "Zone B", 11.6321, 78.1902, 59, 52, 35, "Medium", "Continue monitoring"],
  ["ZONE-C", "WS-001", "Zone C", 11.7014, 78.1215, 76, 71, 18, "Low", "Maintain existing interventions"],
  ["ZONE-D", "WS-002", "Zone D", 9.9412, 78.1345, 34, 29, 72, "High", "Inspect water retention structures"],
  ["ZONE-E", "WS-006", "Zone E", 10.8032, 77.2674, 41, 35, 65, "High", "Prioritize field assessment"],
  ["ZONE-F", "WS-008", "Zone F", 8.9614, 77.3291, 36, 28, 70, "High", "Review intervention coverage"],
  ["ZONE-G", "WS-003", "Zone G", 12.9321, 79.1512, 68, 64, 22, "Low", "Sustain soil conservation"],
  ["ZONE-H", "WS-004", "Zone H", 11.0289, 76.9641, 51, 46, 48, "Medium", "Periodic silt inspection"],
  ["ZONE-I", "WS-005", "Zone I", 8.7265, 77.7712, 75, 72, 19, "Low", "Model watershed best practices"],
  ["ZONE-J", "WS-007", "Zone J", 11.3541, 77.7289, 69, 65, 24, "Low", "Routine seasonal checks"]
].map(x => ({ id: x[0], watershedId: x[1], name: x[2], latitude: x[3], longitude: x[4], vegetation: x[5], waterIndex: x[6], landDegradation: x[7], priority: x[8], recommendation: x[9] }));

const charts = {
  vegetationTrend: { title: "Vegetation Trend", labels: ["2024", "2025", "2026"], datasets: [{ label: "Vegetation Coverage", data: [51, 59, 68] }] },
  waterTrend: { title: "Water Area Trend", labels: ["2024", "2025", "2026"], datasets: [{ label: "Water Area (km²)", data: [2.8, 3.2, 3.7] }] },
  interventionTypes: { title: "Intervention Distribution", labels: ["Check Dams", "Farm Ponds", "Contour Bunds", "Percolation Ponds", "Afforestation"], datasets: [{ label: "Interventions", data: [126, 142, 96, 61, 61] }] },
  watershedVegetation: { title: "Vegetation by Watershed", labels: ["Kaveri", "Vaigai", "Palar", "Noyyal", "Thamirabarani", "Amaravathi", "Bhavani", "Manimuthar"], datasets: [{ label: "Vegetation %", data: [68, 54, 73, 59, 79, 57, 71, 49] }] },
  priorityDistribution: { title: "Priority Zone Distribution", labels: ["High", "Medium", "Low"], datasets: [{ label: "Zones", data: [4, 2, 1] }] },
  landUse: { title: "Land Use / Land Cover", labels: ["Agriculture", "Vegetation", "Water Bodies", "Built-up", "Bare Land"], datasets: [{ label: "Area %", data: [38, 27, 9, 8, 18] }] }
};

const watershedScores = SEED_WATERSHEDS.map((w, i) => ({
  watershedId: w.id,
  score: [78, 61, 86, 69, 91, 58, 88, 53][i],
  confidence: [86, 82, 91, 85, 94, 80, 92, 79][i]
}));

// LocalStorage Persistent Store
const STORAGE_KEY_INTERVENTIONS = "jaldrishti_custom_interventions_v1";
const STORAGE_KEY_IMAGES = "jaldrishti_custom_images_v1";

function loadStoredInterventions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
    if (!raw) return [...SEED_INTERVENTIONS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED_INTERVENTIONS];
  } catch (err) {
    console.warn("Could not parse stored interventions, using seed data:", err);
    return [...SEED_INTERVENTIONS];
  }
}

function saveStoredInterventions(list) {
  try {
    localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to persist interventions to localStorage:", err);
  }
}

function loadStoredImages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IMAGES);
    if (!raw) return [...SEED_GEO_CODED_IMAGES];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...SEED_GEO_CODED_IMAGES];
  } catch (err) {
    console.warn("Could not parse stored images, using seed data:", err);
    return [...SEED_GEO_CODED_IMAGES];
  }
}

function saveStoredImages(list) {
  try {
    localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(list));
  } catch (err) {
    console.error("Failed to persist images to localStorage:", err);
  }
}

let activeInterventions = loadStoredInterventions();
let activeImages = loadStoredImages();

// API / Query methods
function getWatersheds() {
  return SEED_WATERSHEDS;
}

function getWatershedById(id) {
  return SEED_WATERSHEDS.find(w => w.id === id) || SEED_WATERSHEDS[0];
}

function getAllInterventions() {
  return activeInterventions;
}

function getInterventionsByWatershed(id, filters = {}) {
  let list = activeInterventions;
  if (id && id !== "all") {
    list = list.filter(x => x.watershedId === id);
  }
  if (filters.type && filters.type !== "all") {
    list = list.filter(x => x.type === filters.type);
  }
  if (filters.status && filters.status !== "all") {
    list = list.filter(x => x.status === filters.status);
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(x =>
      x.id.toLowerCase().includes(q) ||
      x.village.toLowerCase().includes(q) ||
      x.district.toLowerCase().includes(q) ||
      x.type.toLowerCase().includes(q)
    );
  }
  return list;
}

function addIntervention(record) {
  const newId = record.id || `INT-${String(activeInterventions.length + 1).padStart(3, "0")}`;
  const newIntervention = {
    id: newId,
    watershedId: record.watershedId || "WS-001",
    type: record.type || "Check Dam",
    latitude: Number(record.latitude) || 11.6643,
    longitude: Number(record.longitude) || 78.146,
    village: record.village || "Unknown Village",
    district: record.district || "Salem",
    date: record.date || new Date().toISOString().slice(0, 10),
    status: record.status || "Completed",
    condition: record.condition || "Good",
    impact: record.impact || "Positive",
    isCustom: true
  };
  activeInterventions.unshift(newIntervention);
  saveStoredInterventions(activeInterventions);

  // If image metadata was provided, attach it too
  if (record.imageSrc || record.imageData) {
    const newImage = {
      id: `IMG-${String(activeImages.length + 1).padStart(3, "0")}`,
      interventionId: newIntervention.id,
      watershedId: newIntervention.watershedId,
      imageSrc: record.imageData || record.imageSrc || "assets/images/prototype_01.svg",
      type: newIntervention.type,
      latitude: newIntervention.latitude,
      longitude: newIntervention.longitude,
      village: newIntervention.village,
      date: newIntervention.date,
      imageStatus: record.imageStatus || "Verified",
      detectedObjects: [newIntervention.type, "Water", "Vegetation"],
      confidence: 85,
      isCustom: true
    };
    activeImages.unshift(newImage);
    saveStoredImages(activeImages);
  }
  return newIntervention;
}

function updateIntervention(id, updatedFields) {
  const idx = activeInterventions.findIndex(x => x.id === id);
  if (idx === -1) return null;
  activeInterventions[idx] = {
    ...activeInterventions[idx],
    ...updatedFields,
    latitude: Number(updatedFields.latitude ?? activeInterventions[idx].latitude),
    longitude: Number(updatedFields.longitude ?? activeInterventions[idx].longitude),
    isCustom: true
  };
  saveStoredInterventions(activeInterventions);
  return activeInterventions[idx];
}

function deleteIntervention(id) {
  activeInterventions = activeInterventions.filter(x => x.id !== id);
  saveStoredInterventions(activeInterventions);
  activeImages = activeImages.filter(x => x.interventionId !== id);
  saveStoredImages(activeImages);
  return true;
}

function addStandaloneImage(imgData) {
  const newImage = {
    id: `IMG-${String(activeImages.length + 1).padStart(3, "0")}`,
    interventionId: imgData.interventionId || `INT-${String(activeInterventions.length + 1).padStart(3, "0")}`,
    watershedId: imgData.watershedId || "WS-001",
    imageSrc: imgData.imageSrc || "assets/images/prototype_01.svg",
    type: imgData.type || "Check Dam",
    latitude: Number(imgData.latitude) || 11.6643,
    longitude: Number(imgData.longitude) || 78.146,
    village: imgData.village || "Field Location",
    date: imgData.date || new Date().toISOString().slice(0, 10),
    imageStatus: imgData.imageStatus || "Verified",
    detectedObjects: [imgData.type || "Structure", "Water", "Vegetation"],
    confidence: 88,
    isCustom: true
  };
  activeImages.unshift(newImage);
  saveStoredImages(activeImages);
  return newImage;
}

function getAllImages() {
  return activeImages;
}

function getImagesByWatershed(id, filterStatus = "all") {
  let list = activeImages;
  if (id && id !== "all") {
    list = list.filter(x => x.watershedId === id);
  }
  if (filterStatus && filterStatus !== "all") {
    list = list.filter(x => x.imageStatus === filterStatus);
  }
  return list;
}

function getSatelliteData(id) {
  return satelliteAnalysis.filter(x => x.watershedId === id);
}

function getChangeDetection(id) {
  if (!id || id === "all") return changeDetection;
  const filtered = changeDetection.filter(x => x.watershedId === id);
  return filtered.length > 0 ? filtered : changeDetection.slice(0, 3);
}

function getPriorityZones(id) {
  if (!id || id === "all") return priorityZones;
  const zones = priorityZones.filter(x => x.watershedId === id);
  return zones.length > 0 ? zones : priorityZones.filter(x => x.priority === "High").slice(0, 2);
}

function getWatershedScore(id) {
  return watershedScores.find(x => x.watershedId === id) || { score: 72, confidence: 85 };
}

function getDashboardStats() {
  const verifiedCount = activeImages.filter(x => x.imageStatus === "Verified").length;
  const pendingCount = activeImages.filter(x => x.imageStatus === "Pending Review").length;
  return {
    watershedsMonitored: SEED_WATERSHEDS.length,
    geoCodedImages: activeImages.length,
    interventions: activeInterventions.length,
    waterStructures: activeInterventions.filter(x => ["Check Dam", "Farm Pond", "Percolation Pond"].includes(x.type)).length,
    villagesCovered: new Set(activeInterventions.map(x => x.village)).size,
    vegetationChange: 14.8,
    waterAreaChange: 8.6,
    priorityZones: priorityZones.length,
    verifiedImages: verifiedCount,
    pendingImages: pendingCount
  };
}

// JSON Export & Import
function exportDataJSON() {
  const payload = {
    exportedAt: new Date().toISOString(),
    dataType: "JalDrishti AI Prototype Dataset",
    version: "1.0",
    disclaimer: "Representative SIH demonstration data; not official government measurements.",
    watersheds: SEED_WATERSHEDS,
    interventions: activeInterventions,
    images: activeImages,
    satelliteAnalysis,
    priorityZones
  };
  return JSON.stringify(payload, null, 2);
}

function importDataJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== "object") throw new Error("Invalid JSON structure");
    if (!Array.isArray(data.interventions)) throw new Error("Missing 'interventions' array in imported JSON");

    // Validate intervention records
    const validInterventions = data.interventions.map((item, idx) => {
      if (!item.id || typeof item.latitude !== "number" || typeof item.longitude !== "number") {
        throw new Error(`Invalid record at index ${idx}: Must have id, latitude (number), and longitude (number).`);
      }
      return {
        id: String(item.id),
        watershedId: item.watershedId || "WS-001",
        type: item.type || "Check Dam",
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        village: item.village || "Imported Village",
        district: item.district || "Imported District",
        date: item.date || new Date().toISOString().slice(0, 10),
        status: item.status || "Completed",
        condition: item.condition || "Good",
        impact: item.impact || "Positive",
        isCustom: true
      };
    });

    activeInterventions = validInterventions;
    saveStoredInterventions(activeInterventions);

    if (Array.isArray(data.images)) {
      activeImages = data.images.map((img, idx) => ({
        id: img.id || `IMG-${String(idx + 1).padStart(3, "0")}`,
        interventionId: img.interventionId || "",
        watershedId: img.watershedId || "WS-001",
        imageSrc: img.imageSrc || "assets/images/prototype_01.svg",
        type: img.type || "Check Dam",
        latitude: Number(img.latitude) || 11.6643,
        longitude: Number(img.longitude) || 78.146,
        village: img.village || "Imported Village",
        date: img.date || "2026-09-29",
        imageStatus: img.imageStatus || "Verified",
        detectedObjects: img.detectedObjects || ["Water", "Vegetation"],
        confidence: Number(img.confidence) || 85,
        isCustom: true
      }));
      saveStoredImages(activeImages);
    }
    return { success: true, count: validInterventions.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function resetToDemoData() {
  localStorage.removeItem(STORAGE_KEY_INTERVENTIONS);
  localStorage.removeItem(STORAGE_KEY_IMAGES);
  activeInterventions = [...SEED_INTERVENTIONS];
  activeImages = [...SEED_GEO_CODED_IMAGES];
  return true;
}

// Data-driven AI Assistant response generator
function searchAIResponse(query, selectedWatershedId = "WS-001") {
  const q = (query || "").toLowerCase();
  const ws = getWatershedById(selectedWatershedId);
  const sat = getSatelliteData(selectedWatershedId);
  const sat24 = sat.find(s => s.year === 2024) || { vegetationPercent: 51, waterAreaKm2: 2.8, ndvi: 0.42, ndwi: 0.21 };
  const sat26 = sat.find(s => s.year === 2026) || { vegetationPercent: 68, waterAreaKm2: 3.7, ndvi: 0.55, ndwi: 0.32 };
  const wsInterventions = getInterventionsByWatershed(selectedWatershedId);
  const wsZones = getPriorityZones(selectedWatershedId);

  const disclaimer = "<br><small class='muted'>[Note: Demo prototype response based on synthetic SIH dataset — not official government field data.]</small>";

  if (q.includes("priority") || q.includes("attention") || q.includes("risk") || q.includes("zone")) {
    const zoneNames = wsZones.map(z => `<strong>${z.name}</strong> (${z.priority} Priority - ${z.recommendation})`).join(", ");
    return `In the selected <strong>${ws.name}</strong> (${ws.district} District), priority areas identified from prototype indicators include: ${zoneNames || "No immediate high-risk zones recorded"}. Field verification is recommended before taking official action.${disclaimer}`;
  }

  if (q.includes("vegetation") || q.includes("ndvi") || q.includes("green") || q.includes("plant")) {
    return `For <strong>${ws.name}</strong>, prototype satellite indicators show vegetation coverage progressing from <strong>${sat24.vegetationPercent}%</strong> in 2024 (NDVI ${sat24.ndvi}) to <strong>${sat26.vegetationPercent}%</strong> in 2026 (NDVI ${sat26.ndwi || sat26.ndvi}). Overall watershed condition is labeled as <em>${ws.status}</em>.${disclaimer}`;
  }

  if (q.includes("water") || q.includes("ndwi") || q.includes("pond") || q.includes("dam") || q.includes("reservoir")) {
    return `For <strong>${ws.name}</strong>, mapped surface water area in the prototype dataset indicates a change from <strong>${sat24.waterAreaKm2} km²</strong> (2024) to <strong>${sat26.waterAreaKm2} km²</strong> (2026), with a current Water Index score of ${ws.waterIndex}/100 across monitored structures.${disclaimer}`;
  }

  if (q.includes("intervention") || q.includes("structure") || q.includes("count") || q.includes("record")) {
    const types = [...new Set(wsInterventions.map(x => x.type))].join(", ");
    return `<strong>${ws.name}</strong> has <strong>${wsInterventions.length} active intervention records</strong> in this prototype view, including types such as: ${types || "Check Dams, Farm Ponds, Contour Bunds"}. Each structure is geotagged and tracked with inspection status.${disclaimer}`;
  }

  if (q.includes("change") || q.includes("before") || q.includes("after") || q.includes("detect")) {
    const cd = getChangeDetection(selectedWatershedId)[0];
    if (cd) {
      return `Change detection analysis at <strong>${cd.location}</strong> (${cd.intervention}) indicates a positive change: Vegetation shifted from ${cd.before.vegetation}% to ${cd.after.vegetation}% (+${cd.changes.vegetation}%), and water area increased from ${cd.before.waterArea} to ${cd.after.waterArea} km² (+${cd.changes.waterArea} km²) with ${cd.confidence}% prototype confidence.${disclaimer}`;
    }
    return `Temporal change detection compares baseline 2024 and recent 2026 satellite and field indicators to evaluate intervention outcomes.${disclaimer}`;
  }

  if (q.includes("image") || q.includes("photo") || q.includes("geotag") || q.includes("camera")) {
    const imgCount = getImagesByWatershed(selectedWatershedId).length;
    return `The prototype dataset contains <strong>${imgCount} geo-coded field images</strong> linked to ${ws.name}. Each image record retains GPS coordinates, capture date, detected features (water/vegetation), and verification tags.${disclaimer}`;
  }

  if (q.includes("report") || q.includes("summary") || q.includes("export")) {
    return `You can generate a comprehensive decision-support summary for <strong>${ws.name}</strong> combining geotagged interventions, satellite trends (${sat24.vegetationPercent}% → ${sat26.vegetationPercent}%), change detection, and priority zones. You can also export the records as JSON from the Map Markers toolbar.${disclaimer}`;
  }

  return `I am the JalDrishti AI demo assistant. You can ask about <strong>vegetation</strong>, <strong>water area</strong>, <strong>interventions</strong>, <strong>priority zones</strong>, <strong>change detection</strong>, or <strong>geo-coded images</strong> for <em>${ws.name}</em>.${disclaimer}`;
}

const JalDrishtiData = {
  DEMO_MODE,
  DATA_INFO,
  watersheds: SEED_WATERSHEDS,
  getWatersheds,
  getWatershedById,
  getAllInterventions,
  getInterventionsByWatershed,
  addIntervention,
  updateIntervention,
  deleteIntervention,
  getAllImages,
  getImagesByWatershed,
  addStandaloneImage,
  satelliteAnalysis,
  getSatelliteData,
  changeDetection,
  getChangeDetection,
  landUse,
  waterResources,
  priorityZones,
  getPriorityZones,
  getWatershedScore,
  getDashboardStats,
  charts,
  searchAIResponse,
  exportDataJSON,
  importDataJSON,
  resetToDemoData
};
