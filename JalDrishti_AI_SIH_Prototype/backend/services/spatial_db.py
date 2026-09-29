"""
JalDrishti AI — PostgreSQL + PostGIS Spatial Database Service
Defines spatial tables, geometries (POINT, POLYGON, MULTIPOLYGON), and PostGIS SQL queries:
- ST_Within, ST_Buffer, ST_Distance, ST_DWithin, ST_AsGeoJSON
"""

from typing import List, Dict, Any

POSTGIS_SCHEMA_SQL = """
-- PostGIS Spatial Schema for JalDrishti AI
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Watershed Boundaries
CREATE TABLE IF NOT EXISTS watersheds (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    area_km2 NUMERIC(8, 2),
    geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Water Harvesting & Soil Conservation Interventions
CREATE TABLE IF NOT EXISTS interventions (
    id VARCHAR(20) PRIMARY KEY,
    watershed_id VARCHAR(20) REFERENCES watersheds(id),
    structure_type VARCHAR(50) NOT NULL,
    village VARCHAR(100),
    district VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Completed',
    condition VARCHAR(50) DEFAULT 'Good',
    impact VARCHAR(50) DEFAULT 'Positive',
    geom GEOMETRY(Point, 4326),
    inspection_date DATE DEFAULT CURRENT_DATE
);

-- 3. Geo-Coded Ground Field Photos (GPS / KoboToolbox)
CREATE TABLE IF NOT EXISTS field_images (
    id VARCHAR(20) PRIMARY KEY,
    intervention_id VARCHAR(20) REFERENCES interventions(id),
    watershed_id VARCHAR(20) REFERENCES watersheds(id),
    image_url TEXT NOT NULL,
    geom GEOMETRY(Point, 4326),
    ai_confidence NUMERIC(5, 2),
    review_status VARCHAR(50) DEFAULT 'Verified',
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial Indices for high-speed GIS queries
CREATE INDEX IF NOT EXISTS idx_watersheds_geom ON watersheds USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_interventions_geom ON interventions USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_field_images_geom ON field_images USING GIST(geom);
"""

class SpatialDatabaseService:
    @staticmethod
    def get_interventions_within_watershed_sql(watershed_id: str) -> str:
        """PostGIS query to find all structures located inside a watershed polygon."""
        return f"""
        SELECT i.id, i.structure_type, i.village, i.status, i.condition,
               ST_AsGeoJSON(i.geom) AS geojson
        FROM interventions i
        JOIN watersheds w ON ST_Within(i.geom, w.geom)
        WHERE w.id = '{watershed_id}';
        """

    @staticmethod
    def find_structures_near_point_sql(lat: float, lng: float, radius_meters: int = 5000) -> str:
        """PostGIS spatial proximity query using ST_DWithin on geography."""
        return f"""
        SELECT id, structure_type, village, condition,
               ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)::geography) AS distance_meters
        FROM interventions
        WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)::geography, {radius_meters})
        ORDER BY distance_meters ASC;
        """

spatial_db = SpatialDatabaseService()
