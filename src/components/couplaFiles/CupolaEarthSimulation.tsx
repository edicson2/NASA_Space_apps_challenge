import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function CupolaEarthSimulation() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const width = 400;
    const height = 400;

    // Remove existing svg (for hot reloads)
    if (!svgRef.current) return;
    d3.select(svgRef.current).selectAll("*").remove();

    const projection = d3
      .geoOrthographic()
      .scale(180)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "radial-gradient(circle at 30% 30%, #001a33, #000)")
      .style("border-radius", "50%")
      .style("box-shadow", "0 0 30px rgba(0, 150, 255, 0.3)");

    const globe = svg
      .append("path")
      .datum({ type: "Sphere" })
      .attr("fill", "#022b52")
      .attr("stroke", "#0099ff")
      .attr("stroke-width", 0.5)
      .attr("d", path as any);

    const grat = svg
      .append("path")
      .datum(graticule())
      .attr("fill", "none")
      .attr("stroke", "#00bfff")
      .attr("stroke-width", 0.4)
      .attr("opacity", 0.5)
      .attr("d", path as any);

    const land = svg
      .append("path")
      .attr("fill", "#0066cc")
      .attr("stroke", "#003366")
      .attr("stroke-width", 0.3);

    // Load land data
    d3.json(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    ).then((worldData: any) => {
      if (!worldData) return;
      const countries = topojson.feature(
        worldData,
        (worldData as any).objects.countries as any
      );
      land.datum(countries).attr("d", path as any);
    });

    // Rotation animation (kept inside the effect)
    let rotation: [number, number] = [0, 0];
    const timer = d3.timer(() => {
      rotation[0] += 0.15; // rotation speed
      projection.rotate(rotation as any);
      svg.selectAll("path").attr("d", path as any);
    });

    // cleanup on unmount
    return () => {
      timer.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg ref={svgRef}></svg>
      <p className="text-sm text-white/70 mt-2">
        Simulated Earth Grid (Cupola View)
      </p>
    </div>
  );
}
