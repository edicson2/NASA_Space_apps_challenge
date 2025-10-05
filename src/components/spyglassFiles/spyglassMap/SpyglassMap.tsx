// SpyglassMap.tsx
import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import * as ol from "ol";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import WMTS from "ol/source/WMTS";
import "./SpyglassMap.css";

interface SpyglassMapProps {
  lat: number;
  lon: number;
}

const SpyglassMap: React.FC<SpyglassMapProps> = ({ lat, lon }) => {
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

    const gibsLayer = new TileLayer({
      source: new WMTS({
        url: `https://gibs-{a-c}.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?TIME=${new Date()
          .toISOString()
          .split("T")[0]}`,
        layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
        format: "image/png",
        matrixSet: "250m",
        tileGrid,
        requestEncoding: "KVP",
        style: "default",
      }),
    });

    const map = new ol.Map({
      target: mapRef.current,
      layers: [gibsLayer],
      view,
    });

    // Formula: tilesX, tilesY, TileCol, TileRow
    const tileMatrix = view.getZoom() || 7;
    const tilesX = 2 ** (tileMatrix + 1);
    const tilesY = 2 ** tileMatrix;
    const tileCol = Math.floor(((lon + 180) / 360) * tilesX);
    const tileRow = Math.floor(((90 - lat) / 180) * tilesY);
    console.log({ tilesX, tilesY, tileCol, tileRow });

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
        top: "20px",
        left: "20px",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    />
  );
};

export default SpyglassMap;
