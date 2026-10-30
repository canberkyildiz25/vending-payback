"use client";

import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { useEffect, useRef } from "react";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

const DEG_PER_SECOND = 5;
const START: [number, number] = [-15, -28]; // Europe and the Atlantic facing the viewer

/** A slowly turning globe, drawn on canvas. Stops off screen; stands still under reduced motion. */
export function Globe({ label }: { label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let land: GeoPermissibleObjects | null = null;
    let borders: GeoPermissibleObjects | null = null;
    let lon = START[0];
    let raf = 0;
    let last = 0;
    let visible = true;
    let gone = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const graticule = geoGraticule10();

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) canvas.width = Math.round(w * dpr);
      if (canvas.height !== Math.round(h * dpr)) canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const r = Math.min(w, h) * 0.45;
      const cx = w / 2;
      const cy = h / 2;

      // low sun, upper left
      const sun = ctx.createRadialGradient(cx - r * 0.62, cy - r * 0.6, 0, cx - r * 0.62, cy - r * 0.6, r * 0.55);
      sun.addColorStop(0, "rgba(255,150,60,.6)");
      sun.addColorStop(1, "rgba(255,150,60,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      // atmosphere
      const air = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.14);
      air.addColorStop(0, "rgba(255,106,19,0)");
      air.addColorStop(0.45, "rgba(255,106,19,.55)");
      air.addColorStop(1, "rgba(255,106,19,0)");
      ctx.fillStyle = air;
      ctx.fillRect(0, 0, w, h);

      const projection = geoOrthographic().scale(r).translate([cx, cy]).clipAngle(90).rotate([lon, START[1]]);
      const path = geoPath(projection, ctx);

      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "rgba(8,8,8,.92)";
      ctx.fill();

      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(255,255,255,.05)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      if (land && borders) {
        ctx.beginPath();
        path(land);
        ctx.fillStyle = "rgba(255,106,19,.12)";
        ctx.fill();
        ctx.beginPath();
        path(borders);
        ctx.strokeStyle = "rgba(255,196,0,.4)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        path(land);
        ctx.strokeStyle = "rgba(255,214,120,.95)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = "rgba(255,160,90,.85)";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const tick = (now: number) => {
      if (last) lon += ((now - last) / 1000) * DEG_PER_SECOND;
      last = now;
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (still || gone || raf || !visible || !land) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    draw();
    const seen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    seen.observe(canvas);
    const resized = new ResizeObserver(() => {
      if (!raf) draw();
    });
    resized.observe(canvas);

    // The map data is only fetched once the page is up.
    import("world-atlas/countries-110m.json").then((m) => {
      if (gone) return;
      const world = m.default as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
      land = feature(world, world.objects.land);
      borders = mesh(world, world.objects.countries, (a, b) => a !== b);
      draw();
      start();
    });

    return () => {
      gone = true;
      stop();
      seen.disconnect();
      resized.disconnect();
    };
  }, []);

  return <canvas ref={ref} role="img" aria-label={label} className="block aspect-[16/10] w-full" />;
}
