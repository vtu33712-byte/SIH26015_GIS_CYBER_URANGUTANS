# NDVI, Vegetation Analysis & Remote Sensing

## Normalized Difference Vegetation Index (NDVI)
The Normalized Difference Vegetation Index (NDVI) is a standardized satellite index that generates an image showing greenness, relative biomass, and plant vigor:

$$NDVI = \frac{NIR - Red}{NIR + Red}$$

- **Spectral Basis**: Healthy green vegetation absorbs visible red light for photosynthesis and strongly reflects near-infrared (NIR) light through healthy leaf mesophyll cell structures.
- **Value Range**:
  - **-1.0 to 0.0**: Water bodies, snow, clouds, deep moisture.
  - **0.0 to 0.2**: Bare soil, rock, urban concrete, sand.
  - **0.2 to 0.4**: Sparse vegetation, dry shrubs, grasslands, senescent crops.
  - **0.4 to 0.7**: Moderate vegetation, rainfed agricultural fields, orchards.
  - **0.7 to 1.0**: Dense forest canopy, irrigated high-biomass crops.

## Vegetation Recovery & Change Detection in JAL IMPACT
In the JAL IMPACT platform, multi-temporal NDVI from Sentinel-2 and Landsat satellites is processed alongside ground photos to measure vegetative recovery. Successful check dams and percolation ponds result in a measurable buffer of elevated NDVI (+10% to +25%) within a 500-meter radius around the structure due to elevated groundwater levels.
