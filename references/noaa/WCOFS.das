Attributes {
    ntimes {
        String long_name "number of long time-steps";
    }
    ndtfast {
        String long_name "number of short time-steps";
    }
    dt {
        String long_name "size of long time-steps";
        String units "second";
    }
    dtfast {
        String long_name "size of short time-steps";
        String units "second";
    }
    dstart {
        String long_name "time stamp assigned to model initilization";
        String units "days since 2016-01-01 00:00:00";
        String calendar "proleptic_gregorian";
    }
    nHIS {
        String long_name "number of time-steps between history records";
    }
    ndefHIS {
        String long_name "number of time-steps between the creation of history files";
    }
    nRST {
        String long_name "number of time-steps between restart records";
        String cycle "only latest two records are maintained";
    }
    ntsAVG {
        String long_name "starting time-step for accumulation of time-averaged fields";
    }
    nAVG {
        String long_name "number of time-steps between time-averaged records";
    }
    ndefAVG {
        String long_name "number of time-steps between the creation of average files";
    }
    nSTA {
        String long_name "number of time-steps between stations records";
    }
    Falpha {
        String long_name "Power-law shape barotropic filter parameter";
    }
    Fbeta {
        String long_name "Power-law shape barotropic filter parameter";
    }
    Fgamma {
        String long_name "Power-law shape barotropic filter parameter";
    }
    nl_tnu2 {
        String long_name "nonlinear model Laplacian mixing coefficient for tracers";
        String units "meter2 second-1";
    }
    nl_visc2 {
        String long_name "nonlinear model Laplacian mixing coefficient for momentum";
        String units "meter2 second-1";
    }
    LuvSponge {
        String long_name "horizontal viscosity sponge activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LtracerSponge {
        String long_name "horizontal diffusivity sponge activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    Akt_bak {
        String long_name "background vertical mixing coefficient for tracers";
        String units "meter2 second-1";
    }
    Akv_bak {
        String long_name "background vertical mixing coefficient for momentum";
        String units "meter2 second-1";
    }
    Akk_bak {
        String long_name "background vertical mixing coefficient for turbulent energy";
        String units "meter2 second-1";
    }
    Akp_bak {
        String long_name "background vertical mixing coefficient for length scale";
        String units "meter2 second-1";
    }
    rdrg {
        String long_name "linear drag coefficient";
        String units "meter second-1";
    }
    rdrg2 {
        String long_name "quadratic drag coefficient";
    }
    Zob {
        String long_name "bottom roughness";
        String units "meter";
    }
    Zos {
        String long_name "surface roughness";
        String units "meter";
    }
    Znudg {
        String long_name "free-surface nudging/relaxation inverse time scale";
        String units "day-1";
    }
    M2nudg {
        String long_name "2D momentum nudging/relaxation inverse time scale";
        String units "day-1";
    }
    M3nudg {
        String long_name "3D momentum nudging/relaxation inverse time scale";
        String units "day-1";
    }
    Tnudg {
        String long_name "Tracers nudging/relaxation inverse time scale";
        String units "day-1";
    }
    FSobc_in {
        String long_name "free-surface inflow, nudging inverse time scale";
        String units "second-1";
    }
    FSobc_out {
        String long_name "free-surface outflow, nudging inverse time scale";
        String units "second-1";
    }
    M2obc_in {
        String long_name "2D momentum inflow, nudging inverse time scale";
        String units "second-1";
    }
    M2obc_out {
        String long_name "2D momentum outflow, nudging inverse time scale";
        String units "second-1";
    }
    Tobc_in {
        String long_name "tracers inflow, nudging inverse time scale";
        String units "second-1";
    }
    Tobc_out {
        String long_name "tracers outflow, nudging inverse time scale";
        String units "second-1";
    }
    M3obc_in {
        String long_name "3D momentum inflow, nudging inverse time scale";
        String units "second-1";
    }
    M3obc_out {
        String long_name "3D momentum outflow, nudging inverse time scale";
        String units "second-1";
    }
    rho0 {
        String long_name "mean density used in Boussinesq approximation";
        String units "kilogram meter-3";
    }
    gamma2 {
        String long_name "slipperiness parameter";
    }
    LuvSrc {
        String long_name "momentum point sources and sink activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LwSrc {
        String long_name "mass point sources and sink activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LtracerSrc {
        String long_name "tracer point sources and sink activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LsshCLM {
        String long_name "sea surface height climatology processing switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    Lm2CLM {
        String long_name "2D momentum climatology processing switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    Lm3CLM {
        String long_name "3D momentum climatology processing switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LtracerCLM {
        String long_name "tracer climatology processing switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LnudgeM2CLM {
        String long_name "2D momentum climatology nudging activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LnudgeM3CLM {
        String long_name "3D momentum climatology nudging activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    LnudgeTCLM {
        String long_name "tracer climatology nudging activation switch";
        Int32 flag_values 0, 1;
        String flag_meanings ".FALSE. .TRUE.";
    }
    spherical {
        String long_name "grid type logical switch";
        Int32 flag_values 0, 1;
        String flag_meanings "Cartesian spherical";
    }
    xl {
        String long_name "domain length in the XI-direction";
        String units "meter";
    }
    el {
        String long_name "domain length in the ETA-direction";
        String units "meter";
    }
    Vtransform {
        String long_name "vertical terrain-following transformation equation";
    }
    Vstretching {
        String long_name "vertical terrain-following stretching function";
    }
    theta_s {
        String long_name "S-coordinate surface control parameter";
    }
    theta_b {
        String long_name "S-coordinate bottom control parameter";
    }
    Tcline {
        String long_name "S-coordinate surface/bottom layer width";
        String units "meter";
    }
    hc {
        String long_name "S-coordinate parameter, critical depth";
        String units "meter";
    }
    grid {
        String cf_role "grid_topology";
        Int32 topology_dimension 2;
        String node_dimensions "xi_psi eta_psi";
        String face_dimensions "xi_rho: xi_psi (padding: both) eta_rho: eta_psi (padding: both)";
        String edge1_dimensions "xi_u: xi_psi eta_u: eta_psi (padding: both)";
        String edge2_dimensions "xi_v: xi_psi (padding: both) eta_v: eta_psi";
        String node_coordinates "lon_psi lat_psi";
        String face_coordinates "lon_rho lat_rho";
        String edge1_coordinates "lon_u lat_u";
        String edge2_coordinates "lon_v lat_v";
        String vertical_dimensions "s_rho: s_w (padding: none)";
    }
    s_rho {
        String standard_name "ocean_s_coordinate_g2";
        String long_name "S-coordinate at RHO-points";
        Float64 valid_min -1.0;
        Float64 valid_max 0.0;
        String positive "up";
        String formula_terms "s: s_rho C: Cs_r eta: zeta depth: h depth_c: hc";
    }
    s_w {
        String standard_name "ocean_s_coordinate_g2";
        String long_name "S-coordinate at W-points";
        Float64 valid_min -1.0;
        Float64 valid_max 0.0;
        String positive "up";
        String formula_terms "s: s_w C: Cs_w eta: zeta depth: h depth_c: hc";
    }
    Cs_r {
        String long_name "S-coordinate stretching curves at RHO-points";
        Float64 valid_min -1.0;
        Float64 valid_max 0.0;
    }
    Cs_w {
        String long_name "S-coordinate stretching curves at W-points";
        Float64 valid_min -1.0;
        Float64 valid_max 0.0;
    }
    h {
        String standard_name "sea_floor_depth";
        String long_name "time-independent bathymetry";
        String units "meter";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho";
        String field "bathymetry";
    }
    f {
        String standard_name "coriolis_parameter";
        String long_name "Coriolis parameter";
        String units "second-1";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho";
        String field "coriolis";
    }
    pm {
        String standard_name "inverse_grid_x_spacing";
        String long_name "curvilinear coordinate metric in XI";
        String units "meter-1";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho";
        String field "pm";
    }
    pn {
        String standard_name "inverse_grid_y_spacing";
        String long_name "curvilinear coordinate metric in ETA";
        String units "meter-1";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho";
        String field "pn";
    }
    lon_rho {
        String standard_name "grid_longitude_at_cell_center";
        String long_name "longitude of RHO-points";
        String units "degree_east";
        String field "lon_rho";
    }
    lat_rho {
        String standard_name "grid_latitude_at_cell_center";
        String long_name "latitude of RHO-points";
        String units "degree_north";
        String field "lat_rho";
    }
    lon_u {
        String standard_name "grid_longitude_at_cell_y_edges";
        String long_name "longitude of U-points";
        String units "degree_east";
        String field "lon_u";
    }
    lat_u {
        String standard_name "grid_latitude_at_cell_y_edges";
        String long_name "latitude of U-points";
        String units "degree_north";
        String field "lat_u";
    }
    lon_v {
        String standard_name "grid_longitude_at_cell_x_edges";
        String long_name "longitude of V-points";
        String units "degree_east";
        String field "lon_v";
    }
    lat_v {
        String standard_name "grid_latitude_at_cell_x_edges";
        String long_name "latitude of V-points";
        String units "degree_north";
        String field "lat_v";
    }
    lon_psi {
        String standard_name "grid_longitude_at_cell_corners";
        String long_name "longitude of PSI-points";
        String units "degree_east";
        String field "lon_psi";
    }
    lat_psi {
        String standard_name "grid_latitude_at_cell_corners";
        String long_name "latitude of PSI-points";
        String units "degree_north";
        String field "lat_psi";
    }
    angle {
        String standard_name "grid_angle_of_rotation_from_east_to_y";
        String long_name "angle between XI-axis and EAST";
        String units "radians";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho";
        String field "angle";
    }
    mask_rho {
        String standard_name "land_sea_mask_at_cell_center";
        String long_name "mask on RHO-points";
        Float64 flag_values 0.0, 1.0;
        String flag_meanings "land water";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho";
    }
    mask_u {
        String standard_name "land_sea_mask_at_cell_y_edges";
        String long_name "mask on U-points";
        Float64 flag_values 0.0, 1.0;
        String flag_meanings "land water";
        String grid "grid";
        String location "edge1";
        String coordinates "lon_u lat_u";
    }
    mask_v {
        String standard_name "land_sea_mask_at_cell_x_edges";
        String long_name "mask on V-points";
        Float64 flag_values 0.0, 1.0;
        String flag_meanings "land water";
        String grid "grid";
        String location "edge2";
        String coordinates "lon_v lat_v";
    }
    mask_psi {
        String standard_name "land_sea_mask_at_cell_corners";
        String long_name "mask on PSI-points";
        Float64 flag_values 0.0, 1.0;
        String flag_meanings "land water";
        String grid "grid";
        String location "node";
        String coordinates "lon_psi lat_psi";
    }
    ocean_time {
        String standard_name "time";
        String long_name "time since initialization";
        String units "seconds since 2016-01-01 00:00:00";
        String calendar "proleptic_gregorian";
        String field "time";
        UInt32 _ChunkSizes 512;
    }
    zeta {
        String standard_name "sea_surface_height_above_geopotential_datum";
        String long_name "free-surface";
        String units "meter";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho ocean_time";
        String field "free-surface";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 1016, 348;
    }
    ubar {
        String standard_name "barotropic_sea_water_x_velocity";
        String long_name "vertically integrated u-momentum component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "edge1";
        String coordinates "lon_u lat_u ocean_time";
        String field "u-barotropic";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 1016, 347;
    }
    vbar {
        String standard_name "barotropic_sea_water_y_velocity";
        String long_name "vertically integrated v-momentum component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "edge2";
        String coordinates "lon_v lat_v ocean_time";
        String field "v-barotropic";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 1015, 348;
    }
    u {
        String standard_name "sea_water_x_velocity";
        String long_name "u-momentum component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "edge1";
        String coordinates "lon_u lat_u s_rho ocean_time";
        String field "u-velocity";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 14, 339, 116;
    }
    v {
        String standard_name "sea_water_y_velocity";
        String long_name "v-momentum component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "edge2";
        String coordinates "lon_v lat_v s_rho ocean_time";
        String field "v-velocity";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 14, 339, 116;
    }
    w {
        String standard_name "upward_sea_water_velocity";
        String long_name "vertical momentum component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho s_w ocean_time";
        String field "w-velocity";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 14, 339, 116;
    }
    temp {
        String standard_name "sea_water_potential_temperature";
        String long_name "potential temperature";
        String units "Celsius";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho s_rho ocean_time";
        String field "temperature";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 14, 339, 116;
    }
    salt {
        String standard_name "sea_water_practical_salinity";
        String long_name "salinity";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho s_rho ocean_time";
        String field "salinity";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 14, 339, 116;
    }
    Pair {
        String standard_name "surface_air_pressure";
        String long_name "surface air pressure";
        String units "millibar";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho ocean_time";
        String field "surface air pressure";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 1016, 348;
    }
    Uwind {
        String standard_name "surface_x_wind";
        String long_name "surface u-wind component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho ocean_time";
        String field "u-wind";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 1016, 348;
    }
    Vwind {
        String standard_name "surface_y_wind";
        String long_name "surface v-wind component";
        String units "meter second-1";
        String time "ocean_time";
        String cell_methods "ocean_time: point";
        String grid "grid";
        String location "face";
        String coordinates "lon_rho lat_rho ocean_time";
        String field "v-wind";
        Float32 _FillValue 1.0E37;
        UInt32 _ChunkSizes 1, 1016, 348;
    }
    NC_GLOBAL {
        String file "wcofs.t03z.20261021.fields.forecast_0025.nc";
        String format "netCDF-4/HDF5 file";
        String Conventions "CF-1.4, SGRID-0.3";
        String type "ROMS/TOMS history file";
        String title "wcofs forecast RUN in operational mode";
        String var_info "varinfo.yaml";
        String rst_file "wcofs.t03z.20261021.rst.forecast.nc";
        String his_base "wcofs.t03z.20261021.fields.forecast";
        String avg_file "wcofs.avg.nc";
        String sta_file "wcofs.t03z.20261021.stations.forecast.nc";
        String grd_file "wcofs.romsgrid.nc";
        String ini_file "wcofs.t03z.20261021.rst.nowcast.nc";
        String river_file "wcofs.t03z.20261021.river.nc";
        String tide_file "wcofs.roms.tides.nc";
        String frc_file_01 "wcofs.t03z.20261021.met.forecast.nc";
        String bry_file_01 "wcofs.t03z.20261021.obc.nc";
        String clm_file_01 "wcofs.t03z.20261021.clim.nc";
        String nud_file "wcofs.nudgcoef.nc";
        String script_file "./wcofs_ROMS_forecast.in";
        String spos_file "wcofs.stations.in";
        String NLM_TADV "
ADVECTION:   HORIZONTAL   VERTICAL     
temp:        Upstream3    Centered4    
salt:        Upstream3    Centered4";
        String NLM_LBC "
EDGE:  WEST   SOUTH  EAST   NORTH  
zeta:  Cha    Cha    Clo    Cha    
ubar:  Fla    Fla    Clo    Fla    
vbar:  Fla    Fla    Clo    Fla    
u:     RadNud RadNud Clo    RadNud 
v:     RadNud RadNud Clo    RadNud 
temp:  RadNud RadNud Clo    RadNud 
salt:  RadNud RadNud Clo    RadNud 
tke:   Gra    Gra    Clo    Gra";
        String git_url "https://github.com/NOAA-CO-OPS/2024-NOS-Code-Package_v3.6.0";
        String git_rev "c1e184cd03c2208a7b6924f2ef264d1c9feeb838";
        String svn_url "https://www.myroms.org/svn/src/trunk";
        String svn_rev "1209";
        String code_dir "/lfs/h1/ops/test/packages/nosofs.v3.6.15/sorc/ROMS.fd";
        String header_dir "/lfs/h1/ops/test/packages/nosofs.v3.6.15/include";
        String header_file "wcofs.h";
        String os "Linux";
        String cpu "x86_64";
        String compiler_system "ftn-intel";
        String compiler_command "/opt/cray/pe/craype/2.7.17/bin/ftn";
        String compiler_flags "-fp-model precise -ip -O3";
        String tiling "008x060";
        String history "ROMS/TOMS, Version 4.2, Wednesday - October 21, 2026 -  3:13:36 AM";
        String ana_file "ROMS/Functionals/ana_btflux.h";
        String CPP_options "mode, ADD_FSOBC, ADD_M2OBC, ANA_BSFLUX, ANA_BTFLUX, ASSUMED_SHAPE, AVERAGES, BOUNDARY_ALLREDUCE, BULK_FLUXES, COLLECT_ALLGATHER, CURVGRID, DJ_GRADPS, DOUBLE_PRECISION, EMINUSP, HDF5, LIMIT_STFLX_COOLING, LONGWAVE_OUT, MASKING, MIX_S_TS, MIX_S_UV, MPI, MY25_MIXING, NONLINEAR, NONLIN_EOS, N2S2_HORAVG, POWER_LAW, PROFILE, K_GSCHEME, RADIATION_2D, REDUCE_ALLREDUCE, RI_SPLINES, !RST_SINGLE, SALINITY, STEP2D_LF_AM3, SOLAR_SOURCE, SOLVE3D, SPLINES_VDIFF, SPLINES_VVISC, SSH_TIDES, STATIONS, TS_DIF2, UV_ADV, UV_COR, UV_U3HADVECTION, UV_C4VADVECTION, UV_QDRAG, UV_TIDES, UV_VIS2, VAR_RHO_2D";
    }
    DODS_EXTRA {
        String Unlimited_Dimension "ocean_time";
    }
    EXTRA_DIMENSION {
        Int32 N 40;
    }
}
