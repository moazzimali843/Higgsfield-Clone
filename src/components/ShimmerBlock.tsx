type ShimmerBlockProps = {
  className?: string;
  label?: string;
};

export function ShimmerBlock({
  className = "h-4 w-full rounded-md",
  label = "Loading",
}: ShimmerBlockProps) {
  return (
    <div
      className={["studio-shimmer-block", className].filter(Boolean).join(" ")}
      role="status"
      aria-label={label}
    />
  );
}
