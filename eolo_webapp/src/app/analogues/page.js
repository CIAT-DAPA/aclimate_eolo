"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import {
  FormControl,
  OutlinedInput,
  Button,
  Box,
  IconButton,
  Select,
  InputLabel,
  Card,
  Container,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MenuItem from "@mui/material/MenuItem";
import Configuration from "@/app/config";
import MultiSelect from "@/app/Components/MultiSelect";
import axios from "axios";
import dynamic from "next/dynamic";
import useAuth from "../Hooks/useAuth";
import Loading from "../Components/Loading";
import LoadingOverlay from "../Components/LoadingOverlay";
import FileInputModal from "../Components/Modal";

const Map = dynamic(() => import("@/app/Components/Map"), { ssr: false });

export default function Home() {
  const { loading, auth } = useAuth();
  const [selectedYearHc, setSelectedYearHc] = useState("");
  const [selectedMonthC, setSelectedMonthC] = useState("");
  const [anomalies, setAnomalies] = useState(null);
  const [currentLoading, setCurrentLoading] = useState(false);
  const [tiff, setTiff] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [multiSelectData, setMultiSelectData] = useState([]);

  const [years, setYears] = useState([]);
  const [multYears, setMultYears] = useState([]);
  const [lastMonth, setLastMonth] = useState(null);
  const [months, setMonths] = useState([
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]);

  const [monthsC, setMonthsC] = useState([
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]);

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  // Función general para manejar el cambio en cualquier select
  const handleSelectChange = (setStateFunction) => (event) => {
    setStateFunction(event.target.value);
  };

  const createAnomaly = async (e) => {
    setAnomalies({
      url: `${Configuration.get_api_url()}subtract_rasters`,
      month: selectedMonthC,
      years: multiSelectData,
    });
  };

  const downloadRaster = () => {
    const link = document.createElement("a");
    const url = `${Configuration.get_geoserver_url()}${Configuration.get_climatology_worspace()}/wms?service=WMS&version=1.1.0&time=2000-${selectedMonthC}&request=GetMap&layers=${Configuration.get_climatology_worspace()}%3A${Configuration.get_prec_store()}&bbox=-93.0%2C5.999999739229679%2C-56.9999994635582%2C23.5&width=768&height=373&srs=EPSG%3A4326&styles=&format=image%2Fgeotiff`;
    link.href = url;
    link.download = `PromedioClimatico_${monthsC[selectedMonthC - 1]}.tiff`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 0);
  };

  const downloadAnomalyRaster = () => {
    const link = document.createElement("a");
    link.href = tiff;
    link.download = `Anomalía_${
      monthsC[selectedMonthC - 1]
    }_${multiSelectData.join("-")}.tiff`;

    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 0);
  };

  async function getDatesFromGeoserver(workspace, layer) {
    const url = `${Configuration.get_geoserver_url()}${workspace}/wms?service=WMS&version=1.3.0&request=GetCapabilities`;
    const response = await axios.get(url);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const layers = xmlDoc.getElementsByTagName("Layer");
    let dates;

    for (let i = 0; i < layers.length; i++) {
      const layerName = layers[i].getElementsByTagName("Name")[0].textContent;
      if (layerName === layer) {
        const dimension =
          layers[i].getElementsByTagName("Dimension")[0].textContent;
        const timeInterval = dimension.split(",");
        dates = timeInterval.map((date) => date.split("T")[0].slice(0, -3));
        break;
      }
    }
    return dates;
  }

  useEffect(() => {
    getDatesFromGeoserver(
      Configuration.get_historical_worspace(),
      Configuration.get_prec_store()
    ).then((dates) => {
      const uniqueYears = [...new Set(dates.map((date) => date.split("-")[0]))];
      const currentYear = new Date().getFullYear();
      setYears(uniqueYears);
      setMultYears(uniqueYears);
      //setMultYears(uniqueYears.filter(year => year != currentYear))
      setLastMonth(parseInt(dates[dates.length - 1].split("-")[1]));
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedYearHc == years[years.length - 1]) {
      const filteredMonths = months.slice(0, lastMonth);
      setMonths(filteredMonths);
    } else {
      if (months.length != monthsC.length) {
        setMonths([...monthsC]);
      }
    }
  }, [selectedYearHc]);

  return (
    <Container className={styles.main}>
      {loading || !auth ? (
        <Loading />
      ) : (
        <>
          <div className={styles.title_analogues_container}>
            <h1>Análogos</h1>
            <p className={styles.title_analogues_text}>
              {`El módulo de análogos es una herramienta dentro de nuestra plataforma que te permite mejorar la precisión de tus pronósticos climáticos al identificar y analizar patrones climáticos pasados que son análogos o similares al presente.
                Aquí tienes una explicación más detallada de cómo funciona:
              `}
            </p>
            <Box className={styles.accion_container}>
              <FormControl
                sx={{ m: 1, minWidth: 60, width: "30%" }}
                size="small"
              >
                <InputLabel id="select_month">{"Seleccione un mes"}</InputLabel>
                <Select
                  labelId="select_month"
                  input={
                    <OutlinedInput
                      label={"Seleccione un mes"}
                      value={selectedMonthC}
                      onChange={handleSelectChange(setSelectedMonthC)}
                    />
                  }
                >
                  {monthsC.map((d, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                style={{
                  width: "16%",
                  backgroundColor: "#e37b13",
                  color: "#ffff",
                  marginRight: "2%",
                }}
                onClick={handleOpen}
              >
                Cargar rasters
              </Button>
            </Box>
          </div>

          <Box className={styles.map_container}>
            <div className={styles.historical_map}>
              <div className={styles.info_container}>
                <h2>Consultar históricos climáticos</h2>
                <p>
                  {
                    "Nuestra herramienta analiza un conjunto de datos históricos climáticos para identificar años en los que las condiciones climáticas fueron similares a las actuales. Esto se logra mediante el análisis de precipitación."
                  }
                </p>
                <FormControl
                  sx={{ m: 1, minWidth: 60, width: "40%" }}
                  size="small"
                >
                  <InputLabel id="select_year_hc">
                    {"Seleccione el año"}
                  </InputLabel>
                  <Select
                    labelId="select_year_hc"
                    disabled={!(selectedMonthC != "")}
                    input={
                      <OutlinedInput
                        label={"Seleccione el año"}
                        value={selectedYearHc}
                        onChange={handleSelectChange(setSelectedYearHc)}
                      />
                    }
                  >
                    {years.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <Card>
                <Map
                  className={styles.map}
                  style={{
                    width: "100%",
                    height: "100%",
                    justifySelf: "center",
                  }}
                  zoom={7}
                  center={[14.5007343, -86.6719949]}
                  url={Configuration.get_geoserver_url()}
                  workspace={Configuration.get_historical_worspace()}
                  store={Configuration.get_prec_store()}
                  year={selectedYearHc}
                  month={selectedMonthC}
                />
              </Card>
            </div>

            <div className={styles.historical_map}>
              <div className={styles.info_container}>
                <h2>Promedio de históricos climáticos</h2>
                <p>
                  {
                    "La herramienta calcula el promedio histórico de la precipitación durante esos años. Esto proporciona una referencia adicional para evaluar las condiciones actuales y realizar pronósticos más precisos."
                  }
                </p>
              </div>

              <Card>
                <Map
                  className={styles.map}
                  style={{
                    width: "100%",
                    height: "100%",
                    justifySelf: "center",
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                  zoom={7}
                  center={[14.5007343, -86.6719949]}
                  url={Configuration.get_geoserver_url()}
                  workspace={Configuration.get_climatology_worspace()}
                  store={Configuration.get_prec_store()}
                  year={2000}
                  month={selectedMonthC}
                  child={
                    <IconButton
                      color="primary"
                      aria-label="add to shopping cart"
                      className={styles.download_raster_l}
                      disabled={!selectedMonthC}
                      onClick={downloadRaster}
                    >
                      <FileDownloadOutlinedIcon />
                    </IconButton>
                  }
                />
              </Card>
            </div>

            <div className={styles.anomalies_map}>
              <div className={styles.info_container}>
                <h2>Pronóstico de anomalía</h2>
                <p>
                  Vestibulum varius maximus odio, vitae porttitor metus lobortis
                  in. Sed ut hendrerit tortor, non lobortis ex. Suspendisse
                  sagittis sollicitudin lorem, quis ornare eros tempor congue
                </p>

                <div className={styles.anomalies_but_cont}>
                  <MultiSelect
                    arrayData={multYears}
                    label={"Años análogos"}
                    data={multiSelectData}
                    setData={setMultiSelectData}
                    disabled={!(selectedMonthC != "")}
                  />
                  <IconButton
                    aria-label="Calcular anomalia"
                    color="primary"
                    onClick={createAnomaly}
                    size={"large"}
                    style={{ color: "#e37b13" }}
                    disabled={multiSelectData.length < 2}
                  >
                    <PlayCircleIcon
                      style={{ height: "1.5em", width: "1.5em" }}
                    />
                  </IconButton>
                </div>
              </div>
              <Card>
                <Map
                  className={styles.map}
                  style={{
                    width: "100%",
                    height: "100%",
                    justifySelf: "center",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                  zoom={7.5}
                  center={[14.5007343, -86.6719949]}
                  anomalies={anomalies}
                  isAnomalies={true}
                  setCurrentLoading={setCurrentLoading}
                  workspace={Configuration.get_cenaos_worspace()}
                  store={Configuration.get_anomalies_style()}
                  minZoom={8}
                  setTiff={setTiff}
                  child={
                    <IconButton
                      color="primary"
                      aria-label="add to shopping cart"
                      className={styles.download_raster}
                      disabled={!tiff}
                      onClick={downloadAnomalyRaster}
                    >
                      <FileDownloadOutlinedIcon />
                    </IconButton>
                  }
                />
              </Card>
            </div>
          </Box>
        </>
      )}
      {currentLoading && <LoadingOverlay />}
      <FileInputModal
        open={modalOpen}
        handleOpen={handleOpen}
        handleClose={handleClose}
      />
    </Container>
  );
}
