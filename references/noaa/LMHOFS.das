Attributes {
    nprocs {
        String long_name "number of processors";
    }
    partition {
        String long_name "partition";
    }
    x {
        String long_name "nodal x-coordinate";
        String units "meters";
    }
    y {
        String long_name "nodal y-coordinate";
        String units "meters";
    }
    lon {
        String long_name "nodal longitude";
        String standard_name "longitude";
        String units "degrees_east";
    }
    lat {
        String long_name "nodal latitude";
        String standard_name "latitude";
        String units "degrees_north";
    }
    xc {
        String long_name "zonal x-coordinate";
        String units "meters";
    }
    yc {
        String long_name "zonal y-coordinate";
        String units "meters";
    }
    lonc {
        String long_name "zonal longitude";
        String standard_name "longitude";
        String units "degrees_east";
    }
    latc {
        String long_name "zonal latitude";
        String standard_name "latitude";
        String units "degrees_north";
    }
    siglay {
        String long_name "Sigma Layers";
        String standard_name "ocean_sigma/general_coordinate";
        String positive "up";
        Float32 valid_min -1.0;
        Float32 valid_max 0.0;
        String formula_terms "sigma: siglay eta: zeta depth: h";
    }
    siglev {
        String long_name "Sigma Levels";
        String standard_name "ocean_sigma/general_coordinate";
        String positive "up";
        Float32 valid_min -1.0;
        Float32 valid_max 0.0;
        String formula_terms "sigma:siglay eta: zeta depth: h";
    }
    h {
        String long_name "Bathymetry";
        String standard_name "sea_floor_depth_below_geoid";
        String units "m";
        String positive "down";
        String grid "Bathymetry_Mesh";
        String coordinates "lat lon";
        String type "data";
    }
    nv {
        String long_name "nodes surrounding element";
    }
    iint {
        String long_name "internal mode iteration number";
        UInt32 _ChunkSizes 1024;
    }
    time {
        String long_name "time";
        String units "seconds since 2018-01-01 00:00:00";
        String format "defined reference date";
        String time_zone "UTC";
        UInt32 _ChunkSizes 512;
    }
    Times {
        String time_zone "UTC";
        UInt32 _ChunkSizes 1, 26;
        DODS {
            Int32 strlen 26;
            String dimName "DateStrLen";
        }
    }
    zeta {
        String long_name "Water Surface Elevation";
        String units "meters";
        String positive "up";
        String standard_name "sea_surface_height_above_geoid";
        String grid "Bathymetry_Mesh";
        String coordinates "time lat lon";
        String type "data";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    nbe {
        String long_name "elements surrounding each element";
    }
    ntsn {
        String long_name "#nodes surrounding each node";
    }
    nbsn {
        String long_name "nodes surrounding each node";
    }
    ntve {
        String long_name "#elems surrounding each node";
    }
    nbve {
        String long_name "elems surrounding each node";
    }
    a1u {
        String long_name "a1u";
    }
    a2u {
        String long_name "a2u";
    }
    aw0 {
        String long_name "aw0";
    }
    awx {
        String long_name "awx";
    }
    awy {
        String long_name "awy";
    }
    art2 {
        String long_name "Area of elements around a node";
    }
    art1 {
        String long_name "Area of Node-Base Control volume";
    }
    u {
        String long_name "Eastward Water Velocity";
        String standard_name "eastward_sea_water_velocity";
        String units "meters s-1";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time siglay latc lonc";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 10, 85689;
    }
    v {
        String long_name "Northward Water Velocity";
        String standard_name "Northward_sea_water_velocity";
        String units "meters s-1";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time siglay latc lonc";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 10, 85689;
    }
    tauc {
        String long_name "bed stress magnitude from currents";
        String note1 "this stress is bottom boundary condtion on velocity field";
        String note2 "dimensions are stress/rho";
        String units "m^2 s^-2";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time latc lonc";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 171377;
    }
    omega {
        String long_name "Vertical Sigma Coordinate Velocity";
        String units "s-1";
        String grid "fvcom_grid";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    ww {
        String long_name "Upward Water Velocity";
        String units "meters s-1";
        String grid "fvcom_grid";
        String type "data";
        UInt32 _ChunkSizes 1, 10, 85689;
    }
    temp {
        String long_name "temperature";
        String standard_name "sea_water_temperature";
        String units "degrees_C";
        String grid "fvcom_grid";
        String coordinates "time siglay lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 10, 45403;
    }
    salinity {
        String long_name "salinity";
        String standard_name "sea_water_salinity";
        String units "1e-3";
        String grid "fvcom_grid";
        String coordinates "time siglay lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 10, 45403;
    }
    viscofm {
        String long_name "Horizontal Turbulent Eddy Viscosity For Momentum";
        String units "m 2 s-1";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 10, 85689;
    }
    viscofh {
        String long_name "Horizontal Turbulent Eddy Viscosity For Scalars";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        String units "m 2 s-1";
        UInt32 _ChunkSizes 1, 10, 45403;
    }
    km {
        String long_name "Turbulent Eddy Viscosity For Momentum";
        String units "m 2 s-1";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    kh {
        String long_name "Turbulent Eddy Viscosity For Scalars";
        String units "m 2 s-1";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    kq {
        String long_name "Turbulent Eddy Viscosity For Q2/Q2L";
        String units "m 2 s-1";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    q2 {
        String long_name "Turbulent Kinetic Energy";
        String units "m2 s-2";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    q2l {
        String long_name "Turbulent Kinetic Energy X Turbulent Macroscale";
        String units "m3 s-2";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    l {
        String long_name "Turbulent Macroscale";
        String units "m3 s-2";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 11, 45403;
    }
    short_wave {
        String long_name "Short Wave Radiation";
        String units "W m-2";
        String grid "fvcom_grid";
        String coordinates "time lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    net_heat_flux {
        String long_name "Surface Net Heat Flux";
        String units "W m-2";
        String grid "fvcom_grid";
        String coordinates "time lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    sensible_heat_flux {
        String long_name "Sensible Heat Flux";
        String units "W m-2";
        String grid "fvcom_grid";
        String coordinates "time lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    latent_heat_flux {
        String long_name "Latent Heat Flux";
        String units "W m-2";
        String grid "fvcom_grid";
        String coordinates "time lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    long_wave {
        String long_name "Long Wave Radiation";
        String units "W m-2";
        String grid "fvcom_grid";
        String coordinates "time lat lon";
        String type "data";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    uwind_speed {
        String long_name "Eastward Wind Velocity";
        String standard_name "eastward wind";
        String units "meters s-1";
        String grid "fvcom_grid";
        String coordinates "time latc lonc";
        String type "data";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 171377;
    }
    vwind_speed {
        String long_name "Northward Wind Velocity";
        String standard_name "northward wind";
        String units "meters s-1";
        String grid "fvcom_grid";
        String coordinates "time latc lonc";
        String type "data";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 171377;
    }
    atmos_press {
        String long_name "Atmospheric Pressure";
        String units "pascals";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 90806;
    }
    wet_nodes {
        String long_name "Wet_Nodes";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time lat lon";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    wet_cells {
        String long_name "Wet_Cells";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time latc lonc";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 171377;
    }
    wet_nodes_prev_int {
        String long_name "Wet_Nodes_At_Previous_Internal_Step";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time lat lon";
        String mesh "fvcom_mesh";
        String location "node";
        UInt32 _ChunkSizes 1, 90806;
    }
    wet_cells_prev_int {
        String long_name "Wet_Cells_At_Previous_Internal_Step";
        String grid "fvcom_grid";
        String type "data";
        String coordinates "time latc lonc";
        String mesh "fvcom_mesh";
        String location "face";
        UInt32 _ChunkSizes 1, 171377;
    }
    wet_cells_prev_ext {
        String long_name "Wet_Cells_At_Previous_External_Step";
        String grid "fvcom_grid";
        String type "data";
        UInt32 _ChunkSizes 1, 171377;
    }
    inundation_cells {
        String long_name "Inundation_Cells";
        String grid "fvcom_grid";
        String type "data";
        UInt32 _ChunkSizes 1, 171377;
    }
    aice {
        String long_name "ice area";
        String standard_name "ice_area_category";
        String units "";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 90806;
    }
    vice {
        String long_name "ice volume per unit grid area";
        String standard_name "ice_volume_category";
        String units "m";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 90806;
    }
    tsfc {
        String long_name "ice surface temperature";
        String standard_name "ice_surface_temperature";
        String units "deg C";
        String grid "fvcom_grid";
        String coordinates "lat lon";
        String type "data";
        UInt32 _ChunkSizes 1, 90806;
    }
    uuice {
        String long_name "Ice x-velocity";
        String units "meters s-1";
        String grid "fvcom_grid";
        String type "data";
        UInt32 _ChunkSizes 1, 171377;
    }
    vvice {
        String long_name "Ice y-velocity";
        String units "meters s-1";
        String grid "fvcom_grid";
        String type "data";
        UInt32 _ChunkSizes 1, 171377;
    }
    NC_GLOBAL {
        String title "LMHOFS";
        String institution "School for Marine Science and Technology";
        String source "FVCOM_4.4.7";
        String history "model started at: 21/10/2026   13:56";
        String references "http://fvcom.smast.umassd.edu, https://github.com/FVCOM-GitHub/FVCOM";
        String Conventions "CF-1.0";
        String CoordinateSystem "GeoReferenced";
        String CoordinateProjection "proj=utm +zone=16 +datum=NAD83";
        String Tidal_Forcing "Tidal Forcing Time Series Title: lmhofs lateral open boundary netCDF file";
        String River_Forcing "THERE ARE 12 RIVERS IN THIS MODEL.
RIVER INFLOW IS ON THE edges WHERE TEMPERATURE AND SALINITY ARE specified IN THE MODEL.
THE FOLLOWING RIVER NAMES ARE USED:
04127885
04127885
04159130
04159130
04159130
04157005
04157005
04157005
04157005
040851385
040851385
040851385";
        String GroundWater_Forcing "GROUND WATER FORCING IS OFF!";
        String Surface_Heat_Forcing "FVCOM variable surface heat forcing file:
FILE NAME:lmhofs.t12z.20261021.hflux.forecast.nc
SOURCE:FVCOM grid (unstructured) surface forcing
Unknown start date meta data format";
        String Surface_Wind_Forcing "FVCOM variable surface Wind forcing:
FILE NAME:lmhofs.t12z.20261021.met.forecast.nc
SOURCE:FVCOM grid (unstructured) surface forcing
Unknown start date meta data format";
        String Surface_PrecipEvap_Forcing "FVCOM periodic surface precip forcing:
FILE NAME:lmhofs.t12z.20261021.met.forecast.nc
SOURCE:FVCOM grid (unstructured) surface forcing
Unknown start date meta data format";
        String Ice_Model_Forcing "FVCOM variable surface ice model forcing:
FILE NAME:lmhofs.t12z.20261021.met.forecast.nc
SOURCE:FVCOM grid (unstructured) surface forcing
Unknown start date meta data format";
    }
    DODS_EXTRA {
        String Unlimited_Dimension "time";
    }
}
