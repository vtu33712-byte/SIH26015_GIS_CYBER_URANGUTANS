"""
Website Capability Map and Safe Action Dispatcher for JAL IMPACT AI Assistant.
Strictly limits actions to pre-approved, non-destructive navigation and view commands.
"""

from typing import Optional, Dict, Any

# Map of supported routes and their semantic intent keywords
CAPABILITY_MAP: Dict[str, Dict[str, Any]] = {
    "overview": {
        "route": "/",
        "label": "Overview Dashboard",
        "description": "Executive dashboard showing overall watershed health, rainfall, and core indicators.",
        "keywords": ["dashboard", "home", "overview", "main page", "summary", "stats"]
    },
    "gis": {
        "route": "/gis",
        "label": "GIS Command Map",
        "description": "Interactive geospatial map with watershed boundaries, water bodies, and asset markers.",
        "keywords": ["gis", "map", "geospatial", "layers", "coordinates", "drainage", "boundary", "satellite map"]
    },
    "evidence": {
        "route": "/geo-images",
        "label": "Geo-Coded Field Evidence",
        "description": "Gallery of geotagged ground photographs linked to watershed structures.",
        "keywords": ["evidence", "geo images", "photos", "field photos", "gallery", "camera", "pictures", "captures"]
    },
    "insights": {
        "route": "/development-insights",
        "label": "Spatial Intelligence & Analytics",
        "description": "Spatial pattern recognition, problem clusters, vegetation trends, and erosion heatmaps.",
        "keywords": ["insights", "spatial intelligence", "analytics", "patterns", "clusters", "heatmaps", "trends", "vegetation change"]
    },
    "operations": {
        "route": "/inspections",
        "label": "Field Operations & Inspections",
        "description": "Inspection management, scheduling, and officer verification queue.",
        "keywords": ["inspections", "operations", "field work", "tasks", "verification queue", "officer inspection"]
    },
    "observation": {
        "route": "/field-observation",
        "label": "Field Observation & Upload",
        "description": "Form for capturing live GPS coordinates and uploading field observation photos.",
        "keywords": ["observation", "upload photo", "capture gps", "new observation", "field upload", "geotag"]
    },
    "before-after": {
        "route": "/before-after",
        "label": "Temporal Before / After Comparison",
        "description": "Interactive split-screen slider comparing pre- and post-intervention watershed imagery.",
        "keywords": ["before after", "comparison", "slider", "temporal change", "past vs present", "compare", "recovery"]
    },
    "priority": {
        "route": "/priority-intervention",
        "label": "Priority Interventions",
        "description": "Prioritization ranking of structures needing immediate repair, desilting, or maintenance.",
        "keywords": ["priority", "critical structures", "urgent intervention", "ranking", "risk zones"]
    },
    "alerts": {
        "route": "/alerts",
        "label": "Risk Alerts & Monitoring",
        "description": "Severity-coded alerts tracking structural damage, water depletion, and erosion risks.",
        "keywords": ["alerts", "notifications", "warnings", "critical alerts", "alarms"]
    },
    "reports": {
        "route": "/reports",
        "label": "Reports & Decision Support",
        "description": "Downloadable CSV and PDF summary reports for administrative decision making.",
        "keywords": ["reports", "download csv", "export report", "summary sheet", "documentation"]
    }
}


def detect_website_action(query: str) -> Optional[Dict[str, Any]]:
    """
    Detects if the user query requests navigation to a specific existing website module.
    Returns a validated action payload or None.
    """
    query_lower = query.lower().strip()
    
    # Navigation triggers
    triggers = ["open", "go to", "show me", "take me to", "navigate to", "view", "where can i see", "where is", "switch to"]
    
    is_nav_request = any(trigger in query_lower for trigger in triggers)
    
    if not is_nav_request and len(query_lower.split()) > 6:
        # If it's a long theoretical question like "explain what is on the gis map", don't force navigation
        return None

    # Check for direct matches in capability keywords
    for key, cap in CAPABILITY_MAP.items():
        for keyword in cap["keywords"]:
            if keyword in query_lower:
                return {
                    "type": "navigate",
                    "target": key,
                    "route": cap["route"],
                    "label": cap["label"],
                    "confirmation": f"Navigating to {cap['label']} ({cap['route']})."
                }
                
    return None
