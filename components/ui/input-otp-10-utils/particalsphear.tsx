"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function ParticleSphereAnimation({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; z: number; size: number }[] = [];
    const numParticles = 180;
    const radius = 70;

    const resize = () => {
      const size = Math.min(canvas.parentElement?.clientWidth || 160, 160);
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        size: Math.random() * 1.8 + 0.6,
      });
    }

    let angle = 0;

    const draw = () => {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.2);
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.15)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.008;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      particles.forEach((p) => {
        const x = p.x * cos - p.z * sin;
        const z = p.x * sin + p.z * cos;
        const y = p.y;
        const scale = 200 / (200 + z);
        const px = cx + x * scale;
        const py = cy + y * scale;
        const alpha = Math.max(0.15, Math.min(1, (z + radius) / (radius * 2)));
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha * 0.9})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
      style={{ display: "block" }}
    />
  );
}
