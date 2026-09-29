// JalDrishti AI — Comprehensive Watershed & Project Analysis Engine
// Evaluates geospatial health, intervention performance, anomaly risks, and generates predictive forecasts.

const JalDrishtiAnalyzer = (function () {

  /**
   * Calculates comprehensive health and risk metrics for a given watershed or all watersheds.
   * @param {string} watershedId - "all" or specific ID like "WS-001"
   */
  function runFullProjectAnalysis(watershedId = "all") {
    const allWatersheds = JalDrishtiData.getWatersheds();
    const allInterventions = JalDrishtiData.getAllInterventions();
    const allImages = JalDrishtiData.getAllImages();
    const allSatellite = JalDrishtiData.satelliteAnalysis;
    const allZones = JalDrishtiData.priorityZones;
    const allChanges = JalDrishtiData.changeDetection;

    const targetWatersheds = watershedId === "all" 
      ? allWatersheds 
      : allWatersheds.filter(w => w.id === watershedId);

    // 1. Watershed Diagnostics Matrix
    const diagnostics = targetWatersheds.map(ws => {
      const wsInterventions = allInterventions.filter(i => i.watershedId === ws.id);
      const wsImages = allImages.filter(img => img.watershedId === ws.id);
      const wsSat = allSatellite.filter(s => s.watershedId === ws.id).sort((a, b) => a.year - b.year);
      const wsZones = allZones.filter(z => z.watershedId === ws.id);
      const wsChanges = allChanges.filter(c => c.watershedId === ws.id);

      const baselineSat = wsSat[0] || { vegetationPercent: ws.vegetation, waterAreaKm2: 2.0, bareLandPercent: 30, ndvi: 0.40, ndwi: 0.20 };
      const latestSat = wsSat[wsSat.length - 1] || baselineSat;

      // Metric calculations
      const vegGain = latestSat.vegetationPercent - baselineSat.vegetationPercent;
      const waterGain = +(latestSat.waterAreaKm2 - baselineSat.waterAreaKm2).toFixed(2);
      const bareReduction = baselineSat.bareLandPercent - latestSat.bareLandPercent;
      
      const goodConditionCount = wsInterventions.filter(i => i.condition === "Good" || i.condition === "Excellent").length;
      const conditionRatio = wsInterventions.length ? Math.round((goodConditionCount / wsInterventions.length) * 100) : 75;

      const completedCount = wsInterventions.filter(i => i.status === "Completed").length;
      const completionRate = wsInterventions.length ? Math.round((completedCount / wsInterventions.length) * 100) : 80;

      // Ecological Health Index (0-100)
      const healthIndex = Math.round(
        (latestSat.vegetationPercent * 0.35) + 
        (ws.waterIndex * 0.30) + 
        (conditionRatio * 0.20) + 
        (Math.min(100, (vegGain / Math.max(1, baselineSat.vegetationPercent)) * 200) * 0.15)
      );

      // Intervention Density (structures per 10 km²)
      const density = +((wsInterventions.length / Math.max(1, ws.areaKm2)) * 10).toFixed(1);

      // Drought & Runoff Vulnerability (High / Medium / Low)
      let vulnerability = "Low";
      if (ws.waterIndex < 50 || latestSat.bareLandPercent > 32 || wsZones.some(z => z.priority === "High")) {
        vulnerability = ws.waterIndex < 46 ? "Critical / High" : "Moderate";
      }

      return {
        watershed: ws,
        baselineSat,
        latestSat,
        vegGain,
        waterGain,
        bareReduction,
        interventionsCount: wsInterventions.length,
        completionRate,
        conditionRatio,
        healthIndex,
        density,
        vulnerability,
        zonesCount: wsZones.length,
        highPriorityZones: wsZones.filter(z => z.priority === "High").length,
        imagesCount: wsImages.length,
        pendingImagesCount: wsImages.filter(img => img.imageStatus === "Pending Review").length
      };
    });

    // 2. Global Aggregates
    const avgHealthIndex = Math.round(diagnostics.reduce((acc, d) => acc + d.healthIndex, 0) / Math.max(1, diagnostics.length));
    const totalInterventions = diagnostics.reduce((acc, d) => acc + d.interventionsCount, 0);
    const totalVegGainAvg = +(diagnostics.reduce((acc, d) => acc + d.vegGain, 0) / Math.max(1, diagnostics.length)).toFixed(1);
    const totalWaterGain = +(diagnostics.reduce((acc, d) => acc + d.waterGain, 0)).toFixed(1);

    // 3. Automated Anomaly & Risk Detection Engine
    const anomalies = [];

    diagnostics.forEach(d => {
      const ws = d.watershed;
      // Anomaly 1: Severe land degradation with low water retention
      if (d.vulnerability.includes("High") || d.latestSat.bareLandPercent > 32) {
        anomalies.push({
          id: `ANOM-DEG-${ws.id}`,
          watershedId: ws.id,
          watershedName: ws.name,
          severity: "HIGH",
          category: "Soil & Water Stress",
          title: `Severe Dryland Exposure in ${ws.name}`,
          description: `Bare land stands at ${d.latestSat.bareLandPercent}% while Water Index is only ${ws.waterIndex}/100. High erosion risk during monsoons.`,
          action: "Prioritize ridge-to-valley contour bunding and afforestation along high-slope micro-catchments."
        });
      }

      // Anomaly 2: Low structure density in large watershed
      if (d.density < 8.0 && ws.areaKm2 > 35) {
        anomalies.push({
          id: `ANOM-DEN-${ws.id}`,
          watershedId: ws.id,
          watershedName: ws.name,
          severity: "MEDIUM",
          category: "Infrastructure Gap",
          title: `Low Intervention Density (${d.density} structures/10 km²)`,
          description: `Only ${d.interventionsCount} structures cataloged across ${ws.areaKm2} km². Runoff harvesting potential is under-utilized.`,
          action: "Plan 3-5 new cascading check dams along secondary stream tributaries."
        });
      }

      // Anomaly 3: Pending verification backlog
      if (d.pendingImagesCount > 0) {
        anomalies.push({
          id: `ANOM-IMG-${ws.id}`,
          watershedId: ws.id,
          watershedName: ws.name,
          severity: "LOW",
          category: "Ground Validation",
          title: `${d.pendingImagesCount} Field Photos Awaiting Review`,
          description: `Geo-tagged field photos are pending quality verification to confirm structural integrity and water storage levels.`,
          action: "Execute field assistant photo audit workflow to validate AI object detections."
        });
      }
    });

    // Check for damaged or moderate structures
    const riskyStructures = allInterventions.filter(i => 
      (watershedId === "all" || i.watershedId === watershedId) && 
      (i.condition === "Moderate" || i.condition === "Damaged")
    );

    if (riskyStructures.length > 0) {
      anomalies.push({
        id: `ANOM-STR-MAINT`,
        watershedId: watershedId === "all" ? "GLOBAL" : watershedId,
        watershedName: watershedId === "all" ? "All Watersheds" : diagnostics[0]?.watershed.name,
        severity: riskyStructures.some(s => s.condition === "Damaged") ? "HIGH" : "MEDIUM",
        category: "Maintenance Alert",
        title: `${riskyStructures.length} Structures Require De-silting or Repair`,
        description: `Structures in villages (${riskyStructures.slice(0, 3).map(s => s.village).join(", ")}${riskyStructures.length > 3 ? "..." : ""}) show moderate wear or silt buildup.`,
        action: "Issue maintenance work orders for pre-monsoon desilting and spillway reinforcement."
      });
    }

    // 4. Predictive 2027 - 2028 Simulation Model
    const forecast = diagnostics.map(d => {
      const yearlyVegRate = d.vegGain / 2; // 2 years baseline 2024->2026
      const yearlyWaterRate = d.waterGain / 2;
      
      const projVeg2027 = Math.min(95, Math.round(d.latestSat.vegetationPercent + (yearlyVegRate * 0.9)));
      const projVeg2028 = Math.min(98, Math.round(projVeg2027 + (yearlyVegRate * 0.85)));

      const projWater2027 = +(d.latestSat.waterAreaKm2 + (yearlyWaterRate * 0.9)).toFixed(2);
      const projWater2028 = +(projWater2027 + (yearlyWaterRate * 0.85)).toFixed(2);

      return {
        watershedId: d.watershed.id,
        name: d.watershed.name,
        currentVeg: d.latestSat.vegetationPercent,
        projVeg2027,
        projVeg2028,
        currentWater: d.latestSat.waterAreaKm2,
        projWater2027,
        projWater2028
      };
    });

    // 5. Strategic AI Prescriptive Recommendations
    const recommendations = [];
    diagnostics.forEach(d => {
      const ws = d.watershed;
      if (d.vulnerability.includes("High")) {
        recommendations.push({
          watershed: ws.name,
          targetZone: `${ws.district} Catchment`,
          structureType: "Percolation Ponds & Check Dams",
          suggestedUnits: 4,
          estCostLakhs: 18.5,
          expectedImpact: "+16% Groundwater Recharge, -14% Soil Erosion",
          priority: "Immediate (Q1 2027)"
        });
      } else if (d.healthIndex < 75) {
        recommendations.push({
          watershed: ws.name,
          targetZone: `Mid-Stream Zone`,
          structureType: "Farm Ponds & Contour Bunds",
          suggestedUnits: 6,
          estCostLakhs: 12.0,
          expectedImpact: "+11% Supplemental Crop Irrigation",
          priority: "Scheduled (Q2 2027)"
        });
      } else {
        recommendations.push({
          watershed: ws.name,
          targetZone: `Riparian Buffer`,
          structureType: "Afforestation & Catchment Protection",
          suggestedUnits: 1200,
          estCostLakhs: 6.5,
          expectedImpact: "+8% Biodiversity & Silt Stabilization",
          priority: "Routine Sustainment"
        });
      }
    });

    return {
      timestamp: new Date().toISOString(),
      scope: watershedId === "all" ? "Whole Project (All 8 Watersheds)" : diagnostics[0]?.watershed.name,
      watershedId,
      summary: {
        avgHealthIndex,
        totalInterventions,
        totalVegGainAvg,
        totalWaterGain,
        anomaliesCount: anomalies.length,
        criticalAlerts: anomalies.filter(a => a.severity === "HIGH").length,
        watershedsAnalyzed: diagnostics.length
      },
      diagnostics,
      anomalies,
      forecast,
      recommendations
    };
  }

  /**
   * Generates a printable HTML report document for SIH evaluation / project review.
   */
  function generatePrintableReport(watershedId = "all") {
    const analysis = runFullProjectAnalysis(watershedId);
    return `
      <div class="audit-report-container">
        <div class="audit-header">
          <div class="report-brand">
            <h2>JalDrishti AI — Comprehensive Watershed Intelligence Audit</h2>
            <p>Smart India Hackathon Software Prototype • Project Evaluation Report</p>
          </div>
          <div class="report-meta">
            <span><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span><br>
            <span><strong>Scope:</strong> ${analysis.scope}</span><br>
            <span><strong>AI Health Index:</strong> ${analysis.summary.avgHealthIndex}/100</span>
          </div>
        </div>

        <div class="audit-kpis">
          <div class="kpi-card">
            <label>Avg Health Index</label>
            <div class="val">${analysis.summary.avgHealthIndex} / 100</div>
          </div>
          <div class="kpi-card">
            <label>Total Interventions</label>
            <div class="val">${analysis.summary.totalInterventions}</div>
          </div>
          <div class="kpi-card">
            <label>Avg Vegetation Gain</label>
            <div class="val">+${analysis.summary.totalVegGainAvg}%</div>
          </div>
          <div class="kpi-card">
            <label>Surface Water Growth</label>
            <div class="val">+${analysis.summary.totalWaterGain} km²</div>
          </div>
          <div class="kpi-card">
            <label>Critical AI Alerts</label>
            <div class="val ${analysis.summary.criticalAlerts > 0 ? 'text-danger' : 'text-success'}">${analysis.summary.criticalAlerts}</div>
          </div>
        </div>

        <h3 class="section-title">1. Watershed Diagnostic Matrix</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Watershed</th>
              <th>District</th>
              <th>Area</th>
              <th>Health Index</th>
              <th>Structures</th>
              <th>Veg Growth (24→26)</th>
              <th>Vulnerability</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.diagnostics.map(d => `
              <tr>
                <td><strong>${d.watershed.name}</strong></td>
                <td>${d.watershed.district}</td>
                <td>${d.watershed.areaKm2} km²</td>
                <td><strong>${d.healthIndex}/100</strong></td>
                <td>${d.interventionsCount}</td>
                <td>${d.baselineSat.vegetationPercent}% → ${d.latestSat.vegetationPercent}% (+${d.vegGain}%)</td>
                <td><span class="badge-${d.vulnerability.includes('High') ? 'danger' : 'success'}">${d.vulnerability}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h3 class="section-title">2. AI Anomaly & Risk Alerts</h3>
        <div class="anomaly-report-list">
          ${analysis.anomalies.map(a => `
            <div class="report-anomaly-item ${a.severity.toLowerCase()}">
              <div class="anom-head">
                <span class="badge-${a.severity.toLowerCase()}">${a.severity}</span>
                <strong>${a.title}</strong>
                <span class="anom-ws">(${a.watershedName})</span>
              </div>
              <p class="anom-desc">${a.description}</p>
              <div class="anom-action">💡 <strong>AI Recommended Action:</strong> ${a.action}</div>
            </div>
          `).join("")}
        </div>

        <h3 class="section-title">3. Prescriptive 2027–2028 Action Plan</h3>
        <table class="report-table">
          <thead>
            <tr>
              <th>Watershed</th>
              <th>Proposed Interventions</th>
              <th>Units</th>
              <th>Est. Cost (Lakhs)</th>
              <th>Expected Impact</th>
              <th>Timeline</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.recommendations.map(r => `
              <tr>
                <td><strong>${r.watershed}</strong></td>
                <td>${r.structureType}</td>
                <td>${r.suggestedUnits}</td>
                <td>₹${r.estCostLakhs} L</td>
                <td>${r.expectedImpact}</td>
                <td><strong>${r.priority}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="report-footer">
          <p>⚠️ <em>Disclaimer: Generated by JalDrishti AI SIH prototype decision-support engine. Representative data for demonstration purposes.</em></p>
        </div>
      </div>
    `;
  }

  return {
    runFullProjectAnalysis,
    generatePrintableReport
  };

})();

if (typeof window !== "undefined") {
  window.JalDrishtiAnalyzer = JalDrishtiAnalyzer;
}
