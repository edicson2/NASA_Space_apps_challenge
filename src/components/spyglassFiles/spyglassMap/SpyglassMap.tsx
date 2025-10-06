import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import * as ol from "ol";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import WMTS from "ol/source/WMTS";
import "../../styles/spyglass.css";

interface SpyglassMapProps {
  lat: number;
  lon: number;
  x: number;
  y: number;
}


const SpyglassMap: React.FC<SpyglassMapProps> = ({ lat, lon, x, y }) => {

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (!mapRef.current) return;

  const resolutions = [
    0.5625,
    0.28125,
    0.140625,
    0.0703125,
    0.03515625,
    0.017578125,
    0.0087890625,
    0.00439453125,
    0.002197265625,
  ];
  const matrixIds = resolutions.map((_, i) => i.toString());

  const tileGrid = new WMTSTileGrid({
    origin: [-180, 90],
    resolutions,
    matrixIds,
    tileSize: 512,
  });

  const view = new View({
    projection: "EPSG:4326",
    center: [lon, lat],
    zoom: 7,
  });

  const dateString = new Date().toISOString().split("T")[0];
  const gibsUrl =
    "https://gibs-{a-c}.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi";

  const gibsLayer = new TileLayer({
    source: new WMTS({
      url: gibsUrl,
      layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
      format: "image/jpeg",
      matrixSet: "250m",
      tileGrid,
      style: "default",
      requestEncoding: "KVP",
      dimensions: { TIME: dateString },
    }),
  });

  const map = new ol.Map({
    target: mapRef.current,
    layers: [gibsLayer],
    view,
  });

  // ✅ Recenter when lat/lon changes
  map.getView().setCenter([lon, lat]);

  return () => map.setTarget(undefined);
}, [lat, lon]);


  return (
    <div
      ref={mapRef}
      className="spyglass"
      style={{
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        border: "4px solid rgba(255,255,255,0.8)",
        overflow: "hidden",
        position: "absolute",
        top: `${y - 150}px`, // center vertically
        left: `${x - 150}px`, // center horizontally
        zIndex: 1000,
        pointerEvents: "none",
      }}

    />
  );
};

export default SpyglassMap;
