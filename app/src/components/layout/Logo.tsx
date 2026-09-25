/** AdamLearns mascot: Adam, with short curly hair, a triangular face, a sharp nose and lab goggles. Same artwork as public/favicon.svg. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} role="img" aria-label="AdamLearns">

  <defs>
    <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#14b8a6"/>
      <stop offset="1" stopColor="#0e7490"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#logo-bg)"/>
  {/* t-shirt and neck */}
  <path d="M13 64 C14 57 20 53 26 52 L38 52 C44 53 50 57 51 64 Z" fill="#f59e0b"/>
  <rect x="28.5" y="44" width="7" height="10" rx="3" fill="#d99a66"/>
  {/* ears */}
  <ellipse cx="19" cy="32.5" rx="2.6" ry="3.4" fill="#e3a978"/>
  <ellipse cx="45" cy="32.5" rx="2.6" ry="3.4" fill="#e3a978"/>
  {/* triangular face: wide forehead, pointed chin */}
  <path d="M19.2 24 C19.2 20 24 18.5 32 18.5 C40 18.5 44.8 20 44.8 24 L44.3 31.5 C43.6 38.5 38.2 45.5 33.2 48.6 Q32 49.3 30.8 48.6 C25.8 45.5 20.4 38.5 19.7 31.5 Z" fill="#f0c090"/>
  {/* short curly crop */}
  <g fill="#3b2412">
    <circle cx="20.5" cy="25" r="3.4"/>
    <circle cx="22.5" cy="20.5" r="3.6"/>
    <circle cx="26.5" cy="17.5" r="3.8"/>
    <circle cx="32" cy="16.3" r="3.9"/>
    <circle cx="37.5" cy="17.5" r="3.8"/>
    <circle cx="41.5" cy="20.5" r="3.6"/>
    <circle cx="43.5" cy="25" r="3.4"/>
    <circle cx="29" cy="21" r="3"/>
    <circle cx="35" cy="21" r="3"/>
  </g>
  <g fill="none" stroke="#6b4423" strokeWidth="1" strokeLinecap="round">
    <path d="M24.8 16.6 a1.8 1.8 0 1 1 2.6 2"/>
    <path d="M30.4 15 a1.8 1.8 0 1 1 2.6 2"/>
    <path d="M36 16.6 a1.8 1.8 0 1 1 2.6 2"/>
  </g>
  {/* lab goggles on the forehead */}
  <rect x="18.5" y="24.6" width="27" height="2.4" rx="1.2" fill="#0f172a"/>
  <circle cx="26.5" cy="25.8" r="4" fill="#bae6fd" stroke="#0f172a" strokeWidth="1.5"/>
  <circle cx="37.5" cy="25.8" r="4" fill="#bae6fd" stroke="#0f172a" strokeWidth="1.5"/>
  <circle cx="25.4" cy="24.7" r="1" fill="#fff"/>
  <circle cx="36.4" cy="24.7" r="1" fill="#fff"/>
  {/* eyebrows, eyes */}
  <path d="M24.2 31 L29.3 30.2 M34.7 30.2 L39.8 31" stroke="#2a180a" strokeWidth="1.6" strokeLinecap="round"/>
  <circle cx="27" cy="34" r="1.7" fill="#1f2937"/>
  <circle cx="37" cy="34" r="1.7" fill="#1f2937"/>
  <circle cx="27.6" cy="33.4" r="0.55" fill="#fff"/>
  <circle cx="37.6" cy="33.4" r="0.55" fill="#fff"/>
  {/* sharp nose */}
  <path d="M32.4 32 L29.6 38.6 L33 39" fill="none" stroke="#b5733f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  {/* smile */}
  <path d="M28.6 42.2 Q32 45 35.4 42.2" fill="none" stroke="#7c2d12" strokeWidth="1.7" strokeLinecap="round"/>

    </svg>
  )
}
