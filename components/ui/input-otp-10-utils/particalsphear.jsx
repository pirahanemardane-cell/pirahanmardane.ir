"use client";
export default function ParticleSphereAnimation({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent animate-pulse" />
      <div className="absolute inset-3 rounded-full border border-primary/40 animate-spin" style={{ animationDuration: "12s" }} />
      <div className="w-10 h-10 rounded-full bg-primary/50" />
    </div>
  );
}
