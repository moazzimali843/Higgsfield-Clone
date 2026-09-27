import { MotionReveal } from "@/components/MotionReveal";

type StudioPageIntroProps = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  centered?: boolean;
};

export function StudioPageIntro({
  eyebrow,
  title,
  description,
  actions,
  centered = false,
}: StudioPageIntroProps) {
  return (
    <div
      className={[
        "max-w-2xl",
        centered ? "mx-auto text-center" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MotionReveal>
        {eyebrow ? <p className="studio-eyebrow">{eyebrow}</p> : null}
        <h1 className="studio-display mt-2 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-4 text-base leading-relaxed text-studio-muted">
            {description}
          </div>
        ) : null}
        {actions ? <div className="mt-5">{actions}</div> : null}
      </MotionReveal>
    </div>
  );
}
