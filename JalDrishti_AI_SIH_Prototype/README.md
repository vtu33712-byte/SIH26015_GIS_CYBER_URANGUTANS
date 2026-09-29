# JalDrishti AI — SIH Software Prototype
**Geospatial Watershed Development Monitoring & Decision Support System**

## 1. Overview
JalDrishti AI is a lightweight, high-performance static prototype designed for the Smart India Hackathon (SIH). It integrates field-level geo-coded intervention tracking, temporal satellite indicator analytics (NDVI / NDWI), automated before/after change detection, interactive Leaflet GIS mapping, priority-zone classification, and a data-driven AI decision-support assistant.

---

## 2. How to Run
1. **Direct Browser**:
   - Double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. **Local HTTP Server (Recommended for offline/development)**:
   - Using Python: `python -m http.server 8080` and open `http://localhost:8080/`
   - Using Node / npx: `npx serve .` or VS Code Live Server.

---

## 3. Implemented Features & Improvements
- **Reliable Data Engine & Error Fixes**:
  - Resolved malformed syntax in `data.js` chart definitions and established full runtime data validation.
- **Interactive Geospatial Mapping (Leaflet)**:
  - Dynamic map rendering using actual GPS coordinates for all 32 interventions and priority intervention zones.
  - Distinct colored circle markers categorized by structure type (Check Dam, Farm Pond, Percolation Pond, Contour Bund, Afforestation).
  - Rich interactive popups displaying intervention details, status, impact, and instant edit/delete actions.
  - Smooth auto-panning and fit-bounds whenever a watershed or filter changes.
  - Graceful fallback messaging if tile servers cannot be reached offline.
- **Data-Driven Synchronization & Filtering**:
  - Selecting any of the 8 watersheds immediately updates the basin summary card, KPI stats, priority zones, mapped interventions, geo-coded photos, before/after change records, and charts.
  - Real-time search by Village, District, or Structure ID.
  - Filter by Structure Type and Implementation Status.
  - Filter geo-coded images by review status (Verified / Pending Review).
- **Practical Record Management (CRUD) & Local Persistence**:
  - Modal form for creating and editing interventions with input validation (coordinates range check, required fields).
  - Support for uploading and previewing local field photo attachments.
  - Automatic persistence to browser `localStorage` (`jaldrishti_custom_interventions_v1` and `jaldrishti_custom_images_v1`).
  - Clear visual badge (`tag-custom`) distinguishing user-created records from representative seed data.
  - One-click **JSON Export** to save your work and **JSON Import** with validation to restore datasets.
  - **Reset Demo** button to revert back to the pristine baseline dataset at any time.
- **Accurate & Responsive Analytics Charts**:
  - Clean HTML5 canvas line charts for Vegetation Trend (NDVI %) and Surface Water Area (km²) across 2024–2026.
  - Dynamic rendering based on the active watershed's actual satellite analysis array.
  - Safe handling of zero-point or single-point datasets with clean fallback rendering.
  - ARIA attributes and screen-reader accessibility labels on canvas elements.
- **Data-Grounded AI Decision Support Assistant**:
  - Context-aware responses dynamically tailored to the currently selected watershed, including its specific vegetation progression, water indicators, priority zones, and intervention counts.
  - Explicit disclaimer labeling indicating representative prototype guidance.

---

## 4. Representative Demo Data Notice
All measurements, GPS coordinates, satellite indicators, field images, and analytical outputs in this repository are **representative demonstration data** curated for the SIH prototype. They are not official SRISHTI-DRISHTI or government-certified field measurements.
