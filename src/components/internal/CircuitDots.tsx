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
  /** Selector of a pane to bend the background behind, if there is one. */
  warpTarget?: string;
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

interface Wave {
  x: number;
  y: number;
  /** Seconds since it started. */
  age: number;
  /** Seconds it lasts. */
  life: number;
  /** Radius in pixels it reaches at the end of its life. */
  reach: number;
  strength: number;
}

/** A charge that has stopped, its tail still fading where it ended. */
interface Ghost {
  charge: Charge;
  x: number;
  y: number;
  age: number;
}

/** Dots of tail kept behind a charge. */
const TRAIL = 7;

/** Seconds a stopped charge's tail takes to fizzle out. */
const GHOST_LIFE = 1.4;

const BASE = "rgba(205, 214, 244, 0.18)";
// Lavender #b4befe, the colour under the name in the header.
const LIT = "180, 190, 254";
const TRACE = "180, 190, 254";

export function CircuitDots({
  spacing = 30,
  radius = 1,
  interval = 0.18,
  maxCharges = 26,
  warpTarget,
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
    const waves: Wave[] = [];
    const ghosts: Ghost[] = [];

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
      ghosts.length = 0;
      drawBase();
    };

    const light = (col: number, row: number) => {
      glow.set(`${col},${row}`, 1);
    };

    const ripple = (
      x: number,
      y: number,
      reach: number,
      life: number,
      strength: number,
    ) => {
      if (waves.length > 40) return;
      waves.push({ x, y, age: 0, life, reach, strength });
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
        speed: 0.45 + Math.random() * 0.5,
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
        ripple(charge.col * spacing, charge.row * spacing, spacing * 1.1, 0.9, 0.5);
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

    const headOf = (charge: Charge) => ({
      x:
        (charge.col + (charge.axis === "x" ? charge.step * charge.progress : 0)) *
        spacing,
      y:
        (charge.row + (charge.axis === "y" ? charge.step * charge.progress : 0)) *
        spacing,
    });

    /** Two heads meeting annihilate and throw a wave from the spot. */
    const collide = () => {
      const hit = spacing * 0.45;
      for (let i = charges.length - 1; i >= 0; i--) {
        const a = headOf(charges[i]);
        for (let j = i - 1; j >= 0; j--) {
          const b = headOf(charges[j]);
          if (Math.abs(a.x - b.x) > hit || Math.abs(a.y - b.y) > hit) continue;
          if (Math.hypot(a.x - b.x, a.y - b.y) > hit) continue;
          const x = (a.x + b.x) / 2;
          const y = (a.y + b.y) / 2;
          ripple(x, y, spacing * 5.5, 1.6, 1);
          ripple(x, y, spacing * 3, 1.1, 0.7);
          light(Math.round(x / spacing), Math.round(y / spacing));
          retire(charges.splice(i, 1)[0]);
          retire(charges.splice(j, 1)[0]);
          i -= 1;
          break;
        }
      }
    };

    // The tail fades by distance behind the head, measured along the path,
    // not by which segment it is. The head moves continuously, so every
    // point's distance does too, and nothing steps when a hop lands. The fade
    // reaches zero exactly where the oldest kept dot sits, so dropping that dot
    // is invisible. `strength` scales the whole tail, for one fizzling out.
    const drawTail = (charge: Charge, hx: number, hy: number, strength: number) => {
      const tail = charge.trail;
      const reach = (TRAIL - 1) * spacing;
      const fade = (d: number) => Math.max(0, 1 - d / reach);
      const points: Array<{ x: number; y: number; d: number }> = [
        { x: hx, y: hy, d: 0 },
      ];
      let d = Math.hypot(
        hx - tail[tail.length - 1].col * spacing,
        hy - tail[tail.length - 1].row * spacing,
      );
      for (let i = tail.length - 1; i >= 0; i--) {
        points.push({ x: tail[i].col * spacing, y: tail[i].row * spacing, d });
        d += spacing;
      }
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const fa = fade(a.d);
        const fb = fade(b.d);
        if (fa <= 0) break;
        if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < 0.01) continue;
        const line = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        line.addColorStop(0, `rgba(${TRACE}, ${0.4 * fa * fa * strength})`);
        line.addColorStop(1, `rgba(${TRACE}, ${0.4 * fb * fb * strength})`);
        ctx.strokeStyle = line;
        ctx.lineWidth = 0.6 + (0.6 * (fa + fb)) / 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    };

    /** A stopped charge keeps drawing its tail, dimming, until it is gone. */
    const retire = (charge: Charge) => {
      const { x, y } = headOf(charge);
      ghosts.push({ charge, x, y, age: 0 });
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
        const reach = spacing * 0.26 * value;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, reach);
        halo.addColorStop(0, `rgba(${LIT}, ${0.12 * value})`);
        halo.addColorStop(1, `rgba(${LIT}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, reach, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${LIT}, ${0.34 * value})`;
        ctx.beginPath();
        ctx.arc(x, y, radius + 0.5 * value, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const charge of charges) {
        const { x: hx, y: hy } = headOf(charge);
        drawTail(charge, hx, hy, 1);

        const head = ctx.createRadialGradient(hx, hy, 0, hx, hy, spacing * 0.3);
        head.addColorStop(0, `rgba(${LIT}, 0.16)`);
        head.addColorStop(1, `rgba(${LIT}, 0)`);
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(hx, hy, spacing * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${LIT}, 0.55)`;
        ctx.beginPath();
        ctx.arc(hx, hy, radius + 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // A charge that has stopped leaves its tail where it was, fizzling out
      // instead of vanishing: the whole trail dims and the head's glow with it.
      for (const ghost of ghosts) {
        const left = 1 - ghost.age / GHOST_LIFE;
        const strength = left * left;
        drawTail(ghost.charge, ghost.x, ghost.y, strength);
        const halo = ctx.createRadialGradient(
          ghost.x,
          ghost.y,
          0,
          ghost.x,
          ghost.y,
          spacing * 0.3,
        );
        halo.addColorStop(0, `rgba(${LIT}, ${0.16 * strength})`);
        halo.addColorStop(1, `rgba(${LIT}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, spacing * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${LIT}, ${0.55 * strength})`;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, radius + 0.7 * left, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rings: the small one each dot makes as a charge lands on it, and the
      // bigger one two charges make when they meet.
      for (const wave of waves) {
        const t = wave.age / wave.life;
        const r = wave.reach * (1 - (1 - t) * (1 - t));
        if (r <= 0) continue;
        ctx.strokeStyle = `rgba(${LIT}, ${wave.strength * 0.3 * (1 - t) * (1 - t)})`;
        ctx.lineWidth = 1.2 * (1 - t) + 0.3;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      warp();
    };

    // Bending the picture behind the pane. CSS cannot displace pixels, so the
    // canvas does it: the strip of itself under the pane is copied out, then
    // laid back down row by row, each row slid sideways along a slow wave.
    const buffer = document.createElement("canvas");
    let elapsed = 0;

    const warp = () => {
      if (!warpTarget) return;
      const pane = document.querySelector(warpTarget);
      if (!pane) return;
      const box = pane.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const amp = 7;
      const x = Math.max(0, box.left - amp);
      const y = Math.max(0, box.top);
      const right = Math.min(w, box.right + amp);
      const bottom = Math.min(h, box.bottom);
      const width = right - x;
      const height = bottom - y;
      if (width <= 0 || height <= 0) return;

      if (buffer.width !== Math.ceil(width * dpr) || buffer.height !== Math.ceil(height * dpr)) {
        buffer.width = Math.ceil(width * dpr);
        buffer.height = Math.ceil(height * dpr);
      }
      const bctx = buffer.getContext("2d");
      if (!bctx) return;
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.clearRect(0, 0, buffer.width, buffer.height);
      bctx.drawImage(
        canvas,
        x * dpr,
        y * dpr,
        width * dpr,
        height * dpr,
        0,
        0,
        buffer.width,
        buffer.height,
      );

      ctx.clearRect(x, y, width, height);
      const strip = 4;
      for (let sy = 0; sy < height; sy += strip) {
        const slide =
          amp * Math.sin(sy / 110 + elapsed * 0.35) +
          amp * 0.45 * Math.sin(sy / 37 - elapsed * 0.22);
        const tall = Math.min(strip, height - sy);
        ctx.drawImage(
          buffer,
          0,
          sy * dpr,
          buffer.width,
          tall * dpr,
          x + slide,
          y + sy,
          width,
          tall,
        );
      }
    };

    let frame = 0;
    let last = performance.now();
    let sinceSpawn = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;

      sinceSpawn += dt;
      if (sinceSpawn > interval) {
        sinceSpawn = 0;
        spawn();
      }

      for (let i = charges.length - 1; i >= 0; i--) {
        if (!advance(charges[i], dt)) retire(charges.splice(i, 1)[0]);
      }
      collide();

      for (let i = ghosts.length - 1; i >= 0; i--) {
        ghosts[i].age += dt;
        if (ghosts[i].age >= GHOST_LIFE) ghosts.splice(i, 1);
      }
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].age += dt;
        if (waves[i].age >= waves[i].life) waves.splice(i, 1);
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
  }, [spacing, radius, interval, maxCharges, warpTarget]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 h-full w-full", className)}
    />
  );
}
