Attributes {
    time {
        String long_name "Time";
        Int32 base_date 2008, 1, 1, 0;
        String units "days since 2008-01-01  0:00:00 00:00";
        String standard_name "time";
    }
    lon {
        String long_name "Longitude";
        String units "degrees_east";
        String standard_name "longitude";
    }
    lat {
        String long_name "Latitude";
        String units "degrees_north";
        String standard_name "latitude";
    }
    mask {
        String long_name "Land Mask";
        String units "nondimensional";
    }
    depth {
        String long_name "Bathymetry";
        String units "meters";
        String positive "down";
        String standard_name "depth";
    }
    sigma {
        String long_name "Sigma Stretched Vertical Coordinate at Nodes";
        String units "sigma_level";
        String positive "down";
        String standard_name "ocean_sigma_coordinate";
        String formula_terms "sigma: sigma eta: zeta depth: depth";
    }
    zeta {
        String long_name "Water Surface Elevation";
        String units "meters";
        Float32 missing_value -99999.0;
        String positive "up";
        String standard_name "sea_surface_elevation";
    }
    air_u {
        String long_name "Eastward Air Velocity";
        String units "m/s";
        Float32 missing_value -99999.0;
        String standard_name "eastward_wind";
    }
    air_v {
        String long_name "Northward Air Velocity";
        String units "m/s";
        Float32 missing_value -99999.0;
        String standard_name "northward_wind";
    }
    u {
        String long_name "Eastward Water Velocity";
        String units "m/s";
        Float32 missing_value -99999.0;
        String standard_name "eastward_sea_water_velocity";
    }
    v {
        String long_name "Northward Water Velocity";
        String units "m/s";
        Float32 missing_value -99999.0;
        String standard_name "northward_sea_water_velocity";
    }
    w {
        String long_name "Vertical Water Velocity";
        String units "m/s";
        Float32 missing_value -99999.0;
        String standard_name "upward_sea_water_velocity";
    }
    NC_GLOBAL {
        String file_type "Full_Grid";
        String Conventions "COARDS";
        String grid_type "curvilinear";
        String z_type "sigma";
        String model "POM";
        String title "Forecast: Fine Grid, Field";
        String comment "Unix";
        String source "CSDL/MMAP";
        String institution "SGI O300";
        String history "Operation-COOPS";
        String references "eugene.wei@noaa.gov";
        String creation_date "2026-10-21 17:30:32  00:00";
    }
    DODS_EXTRA {
        String Unlimited_Dimension "time";
    }
}
