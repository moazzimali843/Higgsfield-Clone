export function StudioBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-[var(--studio-bg)]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--studio-bg)] to-[var(--studio-bg)]" />
    </div>
  );
}
