import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface CircuitDotsProps {
  /** Distance in CSS pixels between neighbouring dots. */
  spacing?: number;
  /** Radius of a resting dot. */
  radius?: number;
  /** Average seconds between new pulses. */
  interval?: number;
  /** Most charges travelling at once. */
  maxCharges?: number;
  className?: string;
}

interface Charge {
  col: number;
  row: number;
  axis: "x" | "y";
  step: -1 | 1;
  /** 0 to 1 along the current edge. */
  progress: number;
  /** Edges per second. */
  speed: number;
  hopsLeft: number;
  /** Dots already passed, oldest first, for the fading tail. */
  trail: Array<{ col: number; row: number }>;
}

/** Dots of tail kept behind a charge. */
const TRAIL = 7;

const BASE = "rgba(205, 214, 244, 0.18)";
// Lavender #b4befe, the colour under the name in the header.
const LIT = "180, 190, 254";
const TRACE = "180, 190, 254";

export function CircuitDots({
  spacing = 30,
  radius = 1,
  interval = 0.18,
  maxCharges = 26,
  className,
}: CircuitDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let base: HTMLCanvasElement | null = null;

    // Dots that are lit right now, keyed by "col,row", holding their decay.
    const glow = new Map<string, number>();
    const charges: Charge[] = [];

    const drawBase = () => {
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      const bctx = base.getContext("2d");
      if (!bctx) return;
      bctx.scale(dpr, dpr);
      bctx.fillStyle = BASE;
      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row <= rows; row++) {
          bctx.beginPath();
          bctx.arc(col * spacing, row * spacing, radius, 0, Math.PI * 2);
          bctx.fill();
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / spacing);
      rows = Math.ceil(h / spacing);
      glow.clear();
      charges.length = 0;
      drawBase();
    };

    const light = (col: number, row: number) => {
      glow.set(`${col},${row}`, 1);
    };

    const spawn = () => {
      if (charges.length >= maxCharges) return;
      const col = Math.floor(Math.random() * (cols + 1));
      const row = Math.floor(Math.random() * (rows + 1));
      light(col, row);
      const axis = Math.random() < 0.5 ? "x" : "y";
      charges.push({
        col,
        row,
        axis,
        step: Math.random() < 0.5 ? -1 : 1,
        progress: 0,
        speed: 1.1 + Math.random() * 1.4,
        hopsLeft: 5 + Math.floor(Math.random() * 8),
        trail: [{ col, row }],
      });
    };

    const advance = (charge: Charge, dt: number) => {
      charge.progress += charge.speed * dt;
      while (charge.progress >= 1) {
        charge.progress -= 1;
        if (charge.axis === "x") charge.col += charge.step;
        else charge.row += charge.step;
        charge.hopsLeft -= 1;
        light(charge.col, charge.row);
        charge.trail.push({ col: charge.col, row: charge.row });
        if (charge.trail.length > TRAIL) charge.trail.shift();
        // A quarter turn now and then is what makes it read as a circuit.
        if (Math.random() < 0.35) {
          charge.axis = charge.axis === "x" ? "y" : "x";
          charge.step = Math.random() < 0.5 ? -1 : 1;
        }
      }
      const off =
        charge.col < -1 ||
        charge.row < -1 ||
        charge.col > cols + 1 ||
        charge.row > rows + 1;
      return charge.hopsLeft > 0 && !off;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (base) ctx.drawImage(base, 0, 0, canvas.width / dpr, canvas.height / dpr);

      // Everything lit is drawn additively, so crossing traces build up.
      ctx.globalCompositeOperation = "lighter";

      for (const [key, value] of glow) {
        const [col, row] = key.split(",").map(Number);
        const x = col * spacing;
        const y = row * spacing;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, spacing * 0.42 * value);
        halo.addColorStop(0, `rgba(${LIT}, ${0.4 * value})`);
        halo.addColorStop(1, `rgba(${LIT}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, spacing * 0.42 * value, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${LIT}, ${0.7 * value})`;
        ctx.beginPath();
        ctx.arc(x, y, radius + 1.2 * value, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const charge of charges) {
        const x = charge.col * spacing;
        const y = charge.row * spacing;
        const dx = charge.axis === "x" ? charge.step * spacing : 0;
        const dy = charge.axis === "y" ? charge.step * spacing : 0;
        const hx = x + dx * charge.progress;
        const hy = y + dy * charge.progress;

        // The tail: older segments thinner and fainter.
        const tail = charge.trail;
        for (let i = 1; i < tail.length; i++) {
          const age = (i + 1) / tail.length;
          ctx.strokeStyle = `rgba(${TRACE}, ${0.42 * age * age})`;
          ctx.lineWidth = 0.6 + 0.9 * age;
          ctx.beginPath();
          ctx.moveTo(tail[i - 1].col * spacing, tail[i - 1].row * spacing);
          ctx.lineTo(tail[i].col * spacing, tail[i].row * spacing);
          ctx.stroke();
        }

        // The edge the head is crossing right now.
        ctx.strokeStyle = `rgba(${TRACE}, 0.55)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        const head = ctx.createRadialGradient(hx, hy, 0, hx, hy, spacing * 0.5);
        head.addColorStop(0, `rgba(${LIT}, 0.55)`);
        head.addColorStop(1, `rgba(${LIT}, 0)`);
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(hx, hy, spacing * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${LIT}, 0.95)`;
        ctx.beginPath();
        ctx.arc(hx, hy, radius + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    let frame = 0;
    let last = performance.now();
    let sinceSpawn = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      sinceSpawn += dt;
      if (sinceSpawn > interval) {
        sinceSpawn = 0;
        spawn();
      }

      for (let i = charges.length - 1; i >= 0; i--) {
        if (!advance(charges[i], dt)) charges.splice(i, 1);
      }
      for (const [key, value] of glow) {
        const next = value - dt * 0.45;
        if (next <= 0) glow.delete(key);
        else glow.set(key, next);
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      resize();
      if (reduced.matches) {
        draw();
        return;
      }
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      cancelAnimationFrame(frame);
      start();
    };

    start();
    window.addEventListener("resize", onResize);
    reduced.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
    };
  }, [spacing, radius, interval, maxCharges]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 h-full w-full", className)}
    />
  );
}
