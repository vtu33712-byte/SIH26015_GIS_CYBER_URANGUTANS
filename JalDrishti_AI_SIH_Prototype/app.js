// JalDrishti AI — SIH Prototype Application Logic & AI Analysis Controller

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = n => typeof n === "number" ? n.toLocaleString() : n;

let leafletMap = null;
let mapMarkersGroup = null;
let currentSelectedWatershedId = "WS-001";
let currentAnalysisScope = "all";
let currentAnomalyFilter = "all";

// Toast Notification
function showToast(msg, isError = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.style.background = isError ? "#991b1b" : "#0d283c";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}

// 1. STATS KPI SECTION
function renderStats() {
  const s = JalDrishtiData.getDashboardStats();
  $("#stats").innerHTML = [
    ["Watersheds Monitored", s.watershedsMonitored, "Active SIH demonstration units"],
    ["Geo-coded Field Images", s.geoCodedImages, `${s.verifiedImages} Verified • ${s.pendingImages} Pending`],
    ["Field Interventions", s.interventions, `${s.waterStructures} Water harvesting structures`],
    ["Priority Action Zones", s.priorityZones, "Target critical micro-catchments"]
  ].map(x => `
    <div class="stat">
      <small>${x[0]}</small>
      <b>${fmt(x[1])}</b>
      <span>${x[2]}</span>
    </div>
  `).join("");
}

// 2. WATERSHED SELECTOR & EXPLORER
function initWatershedSelect() {
  const sel = $("#watershedSelect");
  const scopeSel = $("#analysisWatershedScope");
  const formSel = $("#formWatershed");
  const watersheds = JalDrishtiData.getWatersheds();

  const options = watersheds.map(w => `<option value="${w.id}">${w.name} • ${w.district}</option>`).join("");
  sel.innerHTML = options;
  formSel.innerHTML = options;
  scopeSel.innerHTML = `<option value="all">Analyze All 8 Watersheds</option>` + options;

  sel.addEventListener("change", e => {
    currentSelectedWatershedId = e.target.value;
    onWatershedChanged();
  });

  scopeSel.addEventListener("change", e => {
    currentAnalysisScope = e.target.value;
    triggerAIAnalysis();
  });
}

function onWatershedChanged() {
  renderWatershedCard();
  renderZones();
  renderMarkers();
  renderImages();
  renderChanges();
  updateCharts();
  updateMapCenter();
  $("#chartWatershedBadge").textContent = JalDrishtiData.getWatershedById(currentSelectedWatershedId).name;
}

function renderWatershedCard() {
  const w = JalDrishtiData.getWatershedById(currentSelectedWatershedId);
  const score = JalDrishtiData.getWatershedScore(currentSelectedWatershedId);
  const sat = JalDrishtiData.getSatelliteData(currentSelectedWatershedId);
  const latestSat = sat[sat.length - 1] || { vegetationPercent: w.vegetation, waterAreaKm2: 2.8, bareLandPercent: 25 };

  $("#watershedCard").innerHTML = `
    <div class="stat" style="height: 100%;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h3 style="margin:0; font-size: 18px; color: #0b324f;">${w.name}</h3>
          <p style="margin:2px 0 12px; font-size: 13px; color: #536e80;">${w.district}, ${w.state}</p>
        </div>
        <span class="tag ${w.status === 'Good' ? 'tag-highlight' : 'tag-custom'}">${w.status}</span>
      </div>
      <div class="grid two" style="gap: 8px; margin-top: 6px;">
        <div style="background: #f5f9fc; padding: 10px; border-radius: 8px;">
          <small style="color:#647d8e; font-size:11px;">Total Area</small>
          <div style="font-size:16px; font-weight:800; color:#102b3f;">${w.areaKm2} km²</div>
        </div>
        <div style="background: #f5f9fc; padding: 10px; border-radius: 8px;">
          <small style="color:#647d8e; font-size:11px;">Villages Covered</small>
          <div style="font-size:16px; font-weight:800; color:#102b3f;">${w.villages}</div>
        </div>
        <div style="background: #f5f9fc; padding: 10px; border-radius: 8px;">
          <small style="color:#647d8e; font-size:11px;">Vegetation Index</small>
          <div style="font-size:16px; font-weight:800; color:#16804f;">${latestSat.vegetationPercent}% (NDVI)</div>
        </div>
        <div style="background: #f5f9fc; padding: 10px; border-radius: 8px;">
          <small style="color:#647d8e; font-size:11px;">AI Health Score</small>
          <div style="font-size:16px; font-weight:800; color:#0b5fa5;">${score?.score || 75}/100</div>
        </div>
      </div>
    </div>
  `;
}

function renderZones() {
  const zones = JalDrishtiData.getPriorityZones(currentSelectedWatershedId);
  const container = $("#zones");
  if (!zones.length) {
    container.innerHTML = `<p class="muted">No high-risk zones flagged for this watershed.</p>`;
    return;
  }
  container.innerHTML = zones.map(z => `
    <div class="marker" style="margin-bottom: 10px;">
      <div class="marker-head">
        <strong>${z.name}</strong>
        <span class="badge-${z.priority === 'High' ? 'danger' : 'warning'}">${z.priority} Priority</span>
      </div>
      <p style="margin: 4px 0;">Vegetation ${z.vegetation}% • Water Index ${z.waterIndex}% • Land Degradation ${z.landDegradation}%</p>
      <small style="color:#116b48;">💡 ${z.recommendation}</small>
    </div>
  `).join("");
}

// 3. AI PROJECT ANALYSIS & INSIGHTS SUITE
function initAIAnalysisTabs() {
  $$(".ai-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".ai-tab").forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      $$(".ai-tab-pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const target = $("#" + tab.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  // Anomaly filter buttons
  $$(".btn-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".btn-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentAnomalyFilter = btn.dataset.severity;
      renderAnomaliesTab();
    });
  });

  // Action Buttons
  $("#triggerAnalysisBtn").addEventListener("click", () => triggerAIAnalysis());
  $("#headerRunAnalysisBtn").addEventListener("click", () => {
    $("#aiAnalysisSection").scrollIntoView({ behavior: "smooth" });
    triggerAIAnalysis();
  });
  $("#heroAnalysisBtn").addEventListener("click", () => {
    $("#aiAnalysisSection").scrollIntoView({ behavior: "smooth" });
    triggerAIAnalysis();
  });
  $("#heroReportBtn").addEventListener("click", openAuditReport);
  $("#openReportModalBtn").addEventListener("click", openAuditReport);
  $("#closeReportModalBtn").addEventListener("click", closeAuditReport);
  $("#printReportBtn").addEventListener("click", () => window.print());
}

let latestAnalysisResult = null;

function triggerAIAnalysis() {
  const scanBar = $("#analysisScanBar");
  const fill = $("#scanProgressBarFill");
  const msg = $("#scanStatusMsg");
  const pct = $("#scanPercent");

  scanBar.style.display = "block";
  fill.style.width = "0%";
  pct.textContent = "0%";

  const steps = [
    { p: 25, t: "Ingesting multispectral satellite layers & NDVI/NDWI indices..." },
    { p: 55, t: "Correlating 32+ geo-tagged interventions with ground runoff models..." },
    { p: 85, t: "Evaluating micro-catchment degradation risks & anomaly flags..." },
    { p: 100, t: "Synthesizing prescriptive 2027–2028 decision matrix!" }
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx < steps.length) {
      fill.style.width = steps[stepIdx].p + "%";
      pct.textContent = steps[stepIdx].p + "%";
      msg.textContent = steps[stepIdx].t;
      stepIdx++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        scanBar.style.display = "none";
        executeAIAnalysisRender();
        showToast("✅ AI Project Health Analysis Complete!");
      }, 350);
    }
  }, 180);
}

function executeAIAnalysisRender() {
  const analysis = JalDrishtiAnalyzer.runFullProjectAnalysis(currentAnalysisScope);
  latestAnalysisResult = analysis;

  $("#analysisScopeBadge").textContent = `Scope: ${analysis.scope}`;
  $("#anomalyTabCount").textContent = analysis.anomalies.length;

  // 1. Overview Tab
  $("#gaugeValue").textContent = analysis.summary.avgHealthIndex;
  let healthText = "Optimal Ecological Health";
  let healthSub = "High vegetation stability, active water recharge, and resilient interventions.";
  if (analysis.summary.avgHealthIndex < 65) {
    healthText = "Vulnerable / Attention Required";
    healthSub = "Soil degradation and low water retention in priority zones require urgent intervention.";
    $("#gaugeCircle").style.borderColor = "#ef4444";
  } else if (analysis.summary.avgHealthIndex < 80) {
    healthText = "Moderate Watershed Health";
    healthSub = "Steady vegetation gain; continuous desilting and bund maintenance recommended.";
  }
  $("#healthRatingText").textContent = healthText;
  $("#healthRatingSubtext").textContent = healthSub;

  $("#statVegTrajectory").textContent = `+${analysis.summary.totalVegGainAvg}%`;
  $("#statWaterGrowth").textContent = `+${analysis.summary.totalWaterGain} km²`;
  const opReady = analysis.diagnostics.length ? analysis.diagnostics[0].conditionRatio : 82;
  $("#statStructureHealth").textContent = `${opReady}% Good/Excl`;
  $("#statRiskCount").textContent = `${analysis.summary.criticalAlerts} Critical`;

  $("#aiOverviewSummaryNarrative").innerHTML = `
    <strong>AI Executive Synthesis:</strong> Monitored scope covers <strong>${analysis.diagnostics.length} watershed units</strong> with <strong>${analysis.summary.totalInterventions} geo-tagged structures</strong>. 
    Baseline comparisons (2024 → 2026) show an average vegetation gain of <strong>+${analysis.summary.totalVegGainAvg}%</strong> and surface water expansion of <strong>+${analysis.summary.totalWaterGain} km²</strong>. 
    The AI diagnostic engine flagged <strong>${analysis.summary.criticalAlerts} critical anomaly zones</strong> where high land degradation intersects with water scarcity, recommending immediate pre-monsoon contour bunding and desilting.
  `;

  // 2. Matrix Tab
  $("#diagnosticTableBody").innerHTML = analysis.diagnostics.map(d => `
    <tr>
      <td><strong>${d.watershed.name}</strong></td>
      <td>${d.watershed.district}, ${d.watershed.state}</td>
      <td>${d.watershed.areaKm2} km²</td>
      <td><strong style="color:#4f46e5;">${d.healthIndex} / 100</strong></td>
      <td>${d.interventionsCount} structures</td>
      <td><span style="color:#16a34a; font-weight:700;">+${d.vegGain}%</span> (${d.baselineSat.vegetationPercent}% → ${d.latestSat.vegetationPercent}%)</td>
      <td>+${d.waterGain} km²</td>
      <td><span class="${d.vulnerability.includes('High') ? 'badge-danger' : 'badge-success'}">${d.vulnerability}</span></td>
      <td><button class="btn-sm btn-secondary" onclick="inspectWatershedFromMatrix('${d.watershed.id}')">Explore</button></td>
    </tr>
  `).join("");

  // 3. Anomalies Tab
  renderAnomaliesTab();

  // 4. Forecast Tab
  $("#forecastGridContainer").innerHTML = analysis.forecast.map(f => `
    <div class="forecast-card">
      <h4>${f.name}</h4>
      <div class="forecast-stat-pair">
        <span>Current Veg (2026):</span>
        <strong>${f.currentVeg}%</strong>
      </div>
      <div class="forecast-stat-pair">
        <span>Projected 2027:</span>
        <strong style="color:#10b981;">${f.projVeg2027}%</strong>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${f.projVeg2027}%"></div></div>
      <div class="forecast-stat-pair" style="margin-top:6px;">
        <span>Projected 2028:</span>
        <strong style="color:#059669;">${f.projVeg2028}%</strong>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${f.projVeg2028}%"></div></div>
      <div style="font-size:11px; color:#64748b; margin-top:4px;">
        💧 Water Cap: ${f.currentWater} → <strong>${f.projWater2028} km²</strong>
      </div>
    </div>
  `).join("");

  // 5. Recommendations Tab
  $("#recommendationTableBody").innerHTML = analysis.recommendations.map(r => `
    <tr>
      <td><strong>${r.watershed}</strong><br><small class="muted">${r.targetZone}</small></td>
      <td><strong>${r.structureType}</strong></td>
      <td>${r.suggestedUnits} units</td>
      <td>₹${r.estCostLakhs} Lakhs</td>
      <td><span style="color:#059669; font-weight:600;">${r.expectedImpact}</span></td>
      <td><span class="${r.priority.includes('Immediate') ? 'badge-danger' : 'badge-success'}">${r.priority}</span></td>
    </tr>
  `).join("");
}

function renderAnomaliesTab() {
  if (!latestAnalysisResult) return;
  const filtered = currentAnomalyFilter === "all"
    ? latestAnalysisResult.anomalies
    : latestAnalysisResult.anomalies.filter(a => a.severity === currentAnomalyFilter);

  const container = $("#anomalyListContainer");
  if (!filtered.length) {
    container.innerHTML = `<p class="muted" style="grid-column: 1/-1; padding: 20px; text-align: center;">No ${currentAnomalyFilter} severity anomalies identified in the current scope.</p>`;
    return;
  }

  container.innerHTML = filtered.map(a => `
    <div class="anomaly-card ${a.severity.toLowerCase()}">
      <div class="anomaly-card-head">
        <span class="badge-${a.severity.toLowerCase()}">${a.severity} PRIORITY</span>
        <small class="muted">${a.category}</small>
      </div>
      <h4>${a.title}</h4>
      <p>${a.description}</p>
      <div class="anomaly-action-box">
        <strong>💡 Suggested AI Action:</strong> ${a.action}
      </div>
    </div>
  `).join("");
}

window.inspectWatershedFromMatrix = function(wsId) {
  $("#watershedSelect").value = wsId;
  currentSelectedWatershedId = wsId;
  onWatershedChanged();
  $("#watershedCard").scrollIntoView({ behavior: "smooth" });
  showToast(`Switched view to ${JalDrishtiData.getWatershedById(wsId).name}`);
};

function openAuditReport() {
  const reportHtml = JalDrishtiAnalyzer.generatePrintableReport(currentAnalysisScope);
  $("#reportContainer").innerHTML = reportHtml;
  $("#auditReportModal").showModal();
}

function closeAuditReport() {
  $("#auditReportModal").close();
}

// 4. LEAFLET INTERACTIVE MAP
function initMap() {
  const mapElement = $("#map");
  if (!mapElement || typeof L === "undefined") {
    $("#mapFallback").style.display = "block";
    return;
  }

  try {
    leafletMap = L.map("map", {
      center: [11.6643, 78.146],
      zoom: 10,
      scrollWheelZoom: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(leafletMap);

    mapMarkersGroup = L.layerGroup().addTo(leafletMap);
    renderMapMarkers();
  } catch (err) {
    console.warn("Leaflet map initialization fallback:", err);
    $("#mapFallback").style.display = "block";
  }
}

function updateMapCenter() {
  if (!leafletMap) return;
  const ws = JalDrishtiData.getWatershedById(currentSelectedWatershedId);
  if (ws && ws.center) {
    leafletMap.setView(ws.center, 11, { animate: true });
    renderMapMarkers();
  }
}

function getMarkerColor(type) {
  switch (type) {
    case "Check Dam": return "#0284c7";
    case "Farm Pond": case "Percolation Pond": return "#059669";
    case "Contour Bund": return "#d97706";
    case "Afforestation": return "#16a34a";
    default: return "#4f46e5";
  }
}

function renderMapMarkers() {
  if (!leafletMap || !mapMarkersGroup) return;
  mapMarkersGroup.clearLayers();

  const filters = {
    type: $("#typeFilter").value,
    status: $("#statusFilter").value,
    search: $("#markerSearchInput").value
  };

  const list = JalDrishtiData.getInterventionsByWatershed(currentSelectedWatershedId, filters);

  list.forEach(m => {
    const color = getMarkerColor(m.type);
    const circle = L.circleMarker([m.latitude, m.longitude], {
      radius: 8,
      fillColor: color,
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    });

    circle.bindPopup(`
      <div style="font-family: sans-serif; min-width: 170px;">
        <strong style="color:#0f2e46; font-size:14px;">${m.type}</strong>
        <div style="font-size:12px; color:#4a6575; margin: 3px 0 6px;">📍 ${m.village}, ${m.district}</div>
        <div style="font-size:11px; margin-bottom: 4px;">📅 Date: ${m.date}</div>
        <div style="font-size:11px; margin-bottom: 6px;">Status: <strong>${m.status}</strong> (${m.condition})</div>
        <button class="btn-sm btn-primary" onclick="openEditRecordModal('${m.id}')" style="width:100%;">Edit Record</button>
      </div>
    `);

    circle.addTo(mapMarkersGroup);
  });
}

// 5. FIELD INTERVENTIONS GRID & CRUD
function renderMarkers() {
  const filters = {
    type: $("#typeFilter").value,
    status: $("#statusFilter").value,
    search: $("#markerSearchInput").value
  };

  const list = JalDrishtiData.getInterventionsByWatershed(currentSelectedWatershedId, filters);
  const container = $("#markers");

  if (!list.length) {
    container.innerHTML = `<p class="muted" style="grid-column: 1/-1; padding: 24px; text-align: center;">No intervention records matched your active filter criteria.</p>`;
    return;
  }

  container.innerHTML = list.map(m => `
    <div class="marker">
      <div class="marker-head">
        <strong>📍 ${m.type}</strong>
        <span class="tag ${m.isCustom ? 'tag-custom' : ''}">${m.id}</span>
      </div>
      <p><b>${m.village}</b>, ${m.district}</p>
      <small>GPS: ${m.latitude.toFixed(4)}, ${m.longitude.toFixed(4)}<br>Date: ${m.date}</small>
      <div class="marker-footer">
        <div>
          <span class="tag ${m.condition === 'Good' || m.condition === 'Excellent' ? 'tag-highlight' : 'tag-custom'}">${m.condition}</span>
          <span class="tag" style="background:#f1f5f9; color:#475569;">${m.status}</span>
        </div>
        <div class="card-actions">
          <button class="btn-sm btn-secondary" onclick="openEditRecordModal('${m.id}')">Edit</button>
        </div>
      </div>
    </div>
  `).join("");

  renderMapMarkers();
}

function initInterventionFilters() {
  $("#typeFilter").addEventListener("change", renderMarkers);
  $("#statusFilter").addEventListener("change", renderMarkers);
  $("#markerSearchInput").addEventListener("input", renderMarkers);
  $("#clearFiltersBtn").addEventListener("click", () => {
    $("#typeFilter").value = "all";
    $("#statusFilter").value = "all";
    $("#markerSearchInput").value = "";
    renderMarkers();
  });
}

// Modal Form
function initRecordModal() {
  const modal = $("#recordModal");
  $("#addInterventionBtn").addEventListener("click", () => {
    $("#editRecordId").value = "";
    $("#modalTitle").textContent = "Add New Intervention";
    $("#interventionForm").reset();
    $("#formWatershed").value = currentSelectedWatershedId;
    $("#formDate").value = new Date().toISOString().slice(0, 10);
    $("#deleteRecordBtn").style.display = "none";
    $("#imagePreviewContainer").style.display = "none";
    $("#formValidationMsg").style.display = "none";
    modal.showModal();
  });

  $("#closeModalBtn").addEventListener("click", () => modal.close());
  $("#cancelModalBtn").addEventListener("click", () => modal.close());

  $("#formImageFile").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        $("#imagePreviewImg").src = ev.target.result;
        $("#imagePreviewContainer").style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  $("#interventionForm").addEventListener("submit", e => {
    e.preventDefault();
    const editId = $("#editRecordId").value;
    const lat = parseFloat($("#formLatitude").value);
    const lng = parseFloat($("#formLongitude").value);

    if (isNaN(lat) || isNaN(lng)) {
      $("#formValidationMsg").textContent = "Please enter valid numerical latitude and longitude.";
      $("#formValidationMsg").style.display = "block";
      return;
    }

    const payload = {
      watershedId: $("#formWatershed").value,
      type: $("#formType").value,
      village: $("#formVillage").value.trim(),
      district: $("#formDistrict").value.trim(),
      latitude: lat,
      longitude: lng,
      date: $("#formDate").value,
      status: $("#formStatus").value,
      condition: $("#formCondition").value,
      impact: $("#formImpact").value,
      imageData: $("#imagePreviewContainer").style.display !== "none" ? $("#imagePreviewImg").src : null
    };

    if (editId) {
      JalDrishtiData.updateIntervention(editId, payload);
      showToast(`Updated intervention ${editId}`);
    } else {
      const created = JalDrishtiData.addIntervention(payload);
      showToast(`Created new intervention ${created.id}`);
    }

    modal.close();
    renderStats();
    renderMarkers();
    renderImages();
    executeAIAnalysisRender();
  });

  $("#deleteRecordBtn").addEventListener("click", () => {
    const editId = $("#editRecordId").value;
    if (editId && confirm(`Are you sure you want to delete ${editId}?`)) {
      JalDrishtiData.deleteIntervention(editId);
      modal.close();
      showToast(`Deleted ${editId}`);
      renderStats();
      renderMarkers();
      renderImages();
      executeAIAnalysisRender();
    }
  });

  // JSON Import & Export & Reset
  $("#exportJsonBtn").addEventListener("click", () => {
    const jsonStr = JalDrishtiData.exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jaldrishti_data_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded prototype dataset JSON");
  });

  $("#importJsonInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const result = JalDrishtiData.importDataJSON(ev.target.result);
        if (result.success) {
          showToast(`Successfully imported ${result.count} records!`);
          renderStats();
          renderMarkers();
          renderImages();
          executeAIAnalysisRender();
        } else {
          showToast(`Import error: ${result.error}`, true);
        }
      };
      reader.readAsText(file);
    }
  });

  $("#resetDemoBtn").addEventListener("click", () => {
    if (confirm("Reset all custom interventions to initial demo seed data?")) {
      JalDrishtiData.resetToDemoData();
      showToast("Reset to factory demo seed dataset");
      renderStats();
      renderMarkers();
      renderImages();
      executeAIAnalysisRender();
    }
  });
}

window.openEditRecordModal = function(id) {
  const item = JalDrishtiData.getAllInterventions().find(x => x.id === id);
  if (!item) return;

  $("#modalTitle").textContent = `Edit Intervention ${item.id}`;
  $("#editRecordId").value = item.id;
  $("#formWatershed").value = item.watershedId;
  $("#formType").value = item.type;
  $("#formVillage").value = item.village;
  $("#formDistrict").value = item.district;
  $("#formLatitude").value = item.latitude;
  $("#formLongitude").value = item.longitude;
  $("#formDate").value = item.date;
  $("#formStatus").value = item.status;
  $("#formCondition").value = item.condition;
  $("#formImpact").value = item.impact;
  $("#deleteRecordBtn").style.display = "inline-block";
  $("#formValidationMsg").style.display = "none";
  $("#imagePreviewContainer").style.display = "none";

  $("#recordModal").showModal();
};

// 6. GEO-CODED FIELD IMAGES
function renderImages() {
  const filter = $("#imageStatusFilter").value;
  const list = JalDrishtiData.getImagesByWatershed(currentSelectedWatershedId, filter);
  const container = $("#images");

  if (!list.length) {
    container.innerHTML = `<p class="muted" style="grid-column: 1/-1; padding: 20px; text-align: center;">No images found matching this status filter.</p>`;
    return;
  }

  container.innerHTML = list.map((x, i) => `
    <div class="image">
      <img src="${x.imageSrc}" alt="Representative field photo for ${x.type}">
      <div class="meta">
        <strong>${x.type} • ${x.village}</strong>
        <small>📍 ${x.latitude.toFixed(4)}, ${x.longitude.toFixed(4)}<br>📅 ${x.date}<br>AI Confidence: ${x.confidence}%</small>
        <div style="margin-top:8px;">
          <span class="tag ${x.imageStatus === 'Verified' ? 'tag-highlight' : 'tag-custom'}">${x.imageStatus}</span>
          ${x.isCustom ? '<span class="tag tag-custom">User Attached</span>' : ''}
        </div>
      </div>
    </div>
  `).join("");
}

function initImageFilters() {
  $("#imageStatusFilter").addEventListener("change", renderImages);
}

// Dedicated Image Upload Modal Logic
function initImageUploadModal() {
  const modal = $("#imageUploadModal");
  if (!modal) return;

  const uploadWatershedSelect = $("#uploadWatershedSelect");
  const openBtn = $("#uploadImageModalBtn");
  const closeBtn = $("#closeImageUploadModalBtn");
  const cancelBtn = $("#cancelImageUploadBtn");
  const form = $("#imageUploadForm");
  const photoInput = $("#uploadPhotoInput");
  const previewBox = $("#uploadPhotoPreviewBox");
  const previewImg = $("#uploadPhotoPreviewImg");
  const autoGpsBtn = $("#autoGpsBtn");
  const gpsMsg = $("#gpsStatusMessage");

  // Populate watersheds
  uploadWatershedSelect.innerHTML = JalDrishtiData.getWatersheds().map(w => `
    <option value="${w.id}">${w.name} (${w.district})</option>
  `).join("");

  function updateDefaultCoordinates() {
    const ws = JalDrishtiData.getWatershedById(uploadWatershedSelect.value);
    if (ws && ws.center) {
      $("#uploadLatitude").value = ws.center[0];
      $("#uploadLongitude").value = ws.center[1];
    }
  }

  uploadWatershedSelect.addEventListener("change", updateDefaultCoordinates);

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      uploadWatershedSelect.value = currentSelectedWatershedId;
      $("#uploadDate").value = new Date().toISOString().slice(0, 10);
      updateDefaultCoordinates();
      previewBox.style.display = "none";
      previewImg.src = "";
      gpsMsg.textContent = "";
      form.reset();
      $("#uploadDate").value = new Date().toISOString().slice(0, 10);
      modal.showModal();
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", () => modal.close());
  if (cancelBtn) cancelBtn.addEventListener("click", () => modal.close());

  // Image Preview
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewImg.src = ev.target.result;
        previewBox.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      previewBox.style.display = "none";
      previewImg.src = "";
    }
  });

  // GPS auto-detection
  autoGpsBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      gpsMsg.textContent = "⚠️ Geolocation not supported by browser. Enter manually.";
      return;
    }
    gpsMsg.textContent = "📡 Acquiring GPS position...";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        $("#uploadLatitude").value = pos.coords.latitude.toFixed(4);
        $("#uploadLongitude").value = pos.coords.longitude.toFixed(4);
        gpsMsg.textContent = `✅ Locked GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      },
      (err) => {
        gpsMsg.textContent = `⚠️ Could not get live GPS (${err.message}). Using watershed center coordinates.`;
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  // Form Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = photoInput.files[0];
    if (!file) {
      alert("Please choose a photo to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgDataUrl = ev.target.result;
      const watershedId = uploadWatershedSelect.value;
      const type = $("#uploadStructureType").value;
      const village = $("#uploadVillage").value.trim() || "Field Site";
      const date = $("#uploadDate").value;
      const latitude = Number($("#uploadLatitude").value);
      const longitude = Number($("#uploadLongitude").value);

      const added = JalDrishtiData.addStandaloneImage({
        watershedId,
        type,
        village,
        date,
        latitude,
        longitude,
        imageSrc: imgDataUrl,
        imageStatus: "Verified"
      });

      modal.close();
      showToast(`✅ Successfully uploaded and geotagged field photo ${added.id}!`);
      
      // If uploaded to currently selected watershed, refresh immediately
      if (currentSelectedWatershedId === watershedId) {
        renderImages();
      }
      renderStats();
      executeAIAnalysisRender();
    };
    reader.readAsDataURL(file);
  });
}

// 7. BEFORE / AFTER SATELLITE CHANGES
function renderChanges() {
  const list = JalDrishtiData.getChangeDetection(currentSelectedWatershedId);
  $("#changes").innerHTML = list.map(x => `
    <div class="change">
      <h3>${x.location}</h3>
      <p class="muted">${x.intervention}</p>
      <div class="body">
        <b>2024 (Baseline) → 2026 (Recent)</b>
        <p>🌱 Vegetation: <strong>${x.before.vegetation}% → ${x.after.vegetation}%</strong> (${x.changes.vegetation > 0 ? '+' : ''}${x.changes.vegetation}%)</p>
        <p>💧 Water Area: <strong>${x.before.waterArea} → ${x.after.waterArea} km²</strong> (+${x.changes.waterArea} km²)</p>
        <p>🟫 Bare Land: <strong>${x.before.bareLand}% → ${x.after.bareLand}%</strong> (${x.changes.bareLand}%)</p>
        <div style="margin-top: 8px;">
          <span class="tag tag-highlight">AI Detection Confidence: ${x.confidence}%</span>
        </div>
      </div>
    </div>
  `).join("");
}

// 8. DYNAMIC CANVAS CHARTS
function drawChart(canvasId, labels, values, color = "#116b48") {
  const c = $(canvasId);
  if (!c) return;
  const ctx = c.getContext("2d");
  const w = c.width = 600;
  const h = c.height = 260;
  ctx.clearRect(0, 0, w, h);

  const max = Math.max(...values) * 1.2 || 10;
  const pad = 40;

  // Grid lines
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = h - pad - ((h - 2 * pad) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }

  // Line
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad + ((w - 2 * pad) * i) / (values.length - 1);
    const y = h - pad - ((h - 2 * pad) * v) / max;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Points & Labels
  values.forEach((v, i) => {
    const x = pad + ((w - 2 * pad) * i) / (values.length - 1);
    const y = h - pad - ((h - 2 * pad) * v) / max;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#334155";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x, h - 14);
    ctx.fillText(v, x, y - 12);
  });
}

function updateCharts() {
  const sat = JalDrishtiData.getSatelliteData(currentSelectedWatershedId);
  if (sat && sat.length) {
    const labels = sat.map(s => String(s.year));
    const vegValues = sat.map(s => s.vegetationPercent);
    const waterValues = sat.map(s => s.waterAreaKm2);
    drawChart("#vegChart", labels, vegValues, "#16804f");
    drawChart("#waterChart", labels, waterValues, "#0284c7");
  }
}

// 9. AI CHAT ASSISTANT
function initChatAssistant() {
  function ask() {
    const input = $("#question");
    const q = input.value.trim();
    if (!q) return;

    const chatLog = $("#chatLog");
    chatLog.innerHTML += `<div class="msg user">${q}</div>`;
    
    // Generate grounded response
    const reply = JalDrishtiData.searchAIResponse(q, currentSelectedWatershedId);
    chatLog.innerHTML += `<div class="msg ai">${reply}</div>`;
    
    input.value = "";
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  $("#ask").addEventListener("click", ask);
  $("#question").addEventListener("keydown", e => {
    if (e.key === "Enter") ask();
  });
}

// BOOTSTRAP APPLICATION
document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  initWatershedSelect();
  initAIAnalysisTabs();
  initInterventionFilters();
  initImageFilters();
  initImageUploadModal();
  initRecordModal();
  initChatAssistant();
  initMap();

  onWatershedChanged();
  executeAIAnalysisRender();

  $("#chatLog").innerHTML = `<div class="msg ai">Hello! I am the JalDrishti AI assistant. Ask me about <strong>vegetation</strong>, <strong>water area</strong>, <strong>interventions</strong>, <strong>change detection</strong> or <strong>priority zones</strong>.</div>`;
});
