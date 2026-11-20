Attributes {
    time {
        String long_name "Time";
        Int32 base_date 2016, 1, 1, 0;
        String units "days since 2016-01-01  0:00:00 00:00";
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
    temp {
        String long_name "Temperature";
        String units "Celsius";
        Float32 missing_value -99999.0;
        String standard_name "sea_water_temperature";
    }
    salt {
        String long_name "Salinity";
        String units "ppt";
        Float32 missing_value -99999.0;
        String standard_name "sea_water_salinity";
    }
    NC_GLOBAL {
        String file_type "Full_Grid";
        String Conventions "COARDS";
        String grid_type "curvilinear";
        String z_type "sigma";
        String model "EFDC_3D";
        String title "St_Johns_River";
        String comment "Experimental";
        String source "SJROFS";
        String institution "NOAA/NOS/OCS/CSDL";
        String history "original";
        String references "aijun.zhang@noaa.gov";
        String creation_date "2026-10-21 17:50:25  00:00";
    }
    DODS_EXTRA {
        String Unlimited_Dimension "time";
    }
}
