const GEOSERVER_URL = "https://geo.aclimate.org/geoserver/";

//Workspaces
const NEXTGEN_WORSPACE = "fc_nextgen_hn"
const ANALOGUES_WORSPACE = "aclimate_et"
const CENAOS_WORSPACE = "fc_cenaos_hn"
const ACLIMATE_WORSPACE = "aclimate_et"

const CLIMATOLOGY_WORSPACE = "climatology_hn"
const HISTORICALC_WORSPACE = "historical_climate_hn"

const PREC_STORE = "PREC"
const TMAX_STORE = "TMAX"
const TMIN_STORE = "TMIN"


class Configuration {
    get_geoserver_url() {
        return GEOSERVER_URL;
    }

    get_nextgen_worspace(){
        return NEXTGEN_WORSPACE;
    }
    get_analogues_worspace(){
        return ANALOGUES_WORSPACE;
    }
    get_cenaos_worspace(){
        return CENAOS_WORSPACE;
    }
    get_aclimate_worspace(){
        return ACLIMATE_WORSPACE;
    }
    get_climatology_worspace(){
        return CLIMATOLOGY_WORSPACE;
    }
    get_historical_worspace(){
        return HISTORICALC_WORSPACE;
    }

    get_prec_store(){
        return PREC_STORE;
    }
    get_tmax_store(){
        return TMAX_STORE;
    }
    get_tmin_store(){
        return TMIN_STORE;
    }

}

export default new Configuration();