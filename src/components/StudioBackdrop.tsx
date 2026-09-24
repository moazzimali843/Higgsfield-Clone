export function StudioBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#050508]" />
      <div className="studio-aurora-mesh absolute -inset-[15%] opacity-70" />
      <div
        className="studio-orb absolute -left-[20%] top-[-15%] h-[55vh] w-[55vh] rounded-full bg-violet-600/25 blur-[120px]"
      />
      <div
        className="studio-orb studio-orb-delayed absolute -right-[15%] top-[10%] h-[50vh] w-[50vh] rounded-full bg-cyan-500/15 blur-[110px]"
      />
      <div
        className="studio-orb-pulse absolute bottom-[-20%] left-[25%] h-[45vh] w-[60vh] rounded-full bg-fuchsia-600/10 blur-[100px]"
      />
      <div className="studio-hud-grid absolute inset-0 opacity-80" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
