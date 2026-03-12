/**
 * Botanical line-art SVG illustrations for the Solace UI.
 * Thin, continuous-line drawings of leaves and flowers.
 */

export const LeafBranch = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 300"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`text-botanical ${className}`}
  >
    {/* Main stem */}
    <path d="M100 280 C100 240, 98 200, 100 160 C102 120, 95 80, 100 40" />
    {/* Left leaves */}
    <path d="M100 240 C80 230, 55 235, 45 220 C55 215, 80 218, 100 230" />
    <path d="M100 200 C75 185, 50 190, 35 175 C50 168, 75 175, 100 190" />
    <path d="M100 155 C78 142, 55 148, 40 130 C55 125, 78 132, 100 148" />
    {/* Right leaves */}
    <path d="M100 220 C120 208, 145 212, 158 198 C145 192, 120 198, 100 212" />
    <path d="M100 175 C125 162, 148 168, 160 150 C148 145, 125 152, 100 168" />
    <path d="M100 120 C118 108, 140 112, 150 95 C140 90, 118 98, 100 112" />
    {/* Top bud */}
    <path d="M100 40 C95 25, 88 15, 92 5" />
    <path d="M100 40 C105 25, 112 15, 108 5" />
    {/* Leaf veins */}
    <path d="M100 235 C85 228, 65 230, 55 222" opacity="0.4" />
    <path d="M100 195 C82 183, 62 187, 48 177" opacity="0.4" />
    <path d="M100 215 C115 205, 135 208, 148 198" opacity="0.4" />
  </svg>
);

export const DelicateFlower = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    stroke="currentColor"
    strokeWidth="0.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`text-botanical ${className}`}
  >
    {/* Petals */}
    <path d="M80 80 C70 60, 55 45, 65 30 C75 35, 78 55, 80 80" />
    <path d="M80 80 C95 65, 115 55, 120 40 C110 42, 92 58, 80 80" />
    <path d="M80 80 C100 78, 120 82, 130 75 C122 70, 100 72, 80 80" />
    <path d="M80 80 C95 95, 110 110, 118 120 C108 115, 90 98, 80 80" />
    <path d="M80 80 C65 95, 50 105, 42 118 C52 115, 68 100, 80 80" />
    <path d="M80 80 C60 78, 40 82, 32 75 C40 70, 60 72, 80 80" />
    {/* Center */}
    <circle cx="80" cy="80" r="4" strokeWidth="0.6" />
    <circle cx="80" cy="80" r="1.5" strokeWidth="0.6" />
    {/* Stem */}
    <path d="M80 84 C80 100, 78 120, 80 150" />
    <path d="M80 120 C70 112, 60 115, 55 108" />
  </svg>
);

export const SmallLeaf = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 80 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="0.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`text-botanical ${className}`}
  >
    <path d="M40 90 C40 70, 38 50, 40 20" />
    <path d="M40 50 C30 42, 18 45, 12 35 C20 32, 32 38, 40 46" />
    <path d="M40 35 C50 28, 62 32, 68 22 C60 20, 48 25, 40 32" />
    <path d="M40 20 C38 12, 35 5, 38 0" />
  </svg>
);

/** Soft watercolor-style blob */
export const PastelBlob = ({
  className = "",
  variant = "peach",
}: {
  className?: string;
  variant?: "peach" | "tan";
}) => (
  <svg viewBox="0 0 200 200" className={className}>
    <defs>
      <filter id={`blur-${variant}`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
      </filter>
    </defs>
    <ellipse
      cx="100"
      cy="100"
      rx="80"
      ry="70"
      fill={variant === "peach" ? "hsl(18 60% 88% / 0.6)" : "hsl(30 40% 87% / 0.5)"}
      filter={`url(#blur-${variant})`}
      transform="rotate(-15 100 100)"
    />
  </svg>
);
