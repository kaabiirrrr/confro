/**
 * Connect AI — Premium Logo Component
 * Variants: 'icon' | 'horizontal' | 'stacked'
 * Themes:   'dark' | 'light'
 */
export default function ConnectAILogo({
  variant = 'horizontal',
  theme = 'dark',
  size = 40,
  className = '',
}) {
  const isLight = theme === 'light';
  const uid = `cai-${variant}-${theme}`;

  // Scale factors for each variant
  const iconSize = size;
  const textScale = size / 40;

  return variant === 'icon' ? (
    <IconMark size={iconSize} light={isLight} uid={uid} className={className} />
  ) : variant === 'stacked' ? (
    <StackedLogo size={iconSize} light={isLight} uid={uid} className={className} />
  ) : (
    <HorizontalLogo size={iconSize} light={isLight} uid={uid} className={className} />
  );
}

/* ─── Shared Icon Mark ─────────────────────────────────────── */
function IconMark({ size, light, uid, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Connect AI icon"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          {light
            ? <><stop offset="0%" stopColor="#EFF6FF" /><stop offset="100%" stopColor="#DBEAFE" /></>
            : <><stop offset="0%" stopColor="#0B1C3D" /><stop offset="100%" stopColor="#1E3A8A" /></>
          }
        </linearGradient>
        <linearGradient id={`${uid}-star`} x1="30" y1="22" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={`${uid}-node`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={light ? '1.5' : '2.5'} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded square bg */}
      <rect width="80" height="80" rx="18" fill={`url(#${uid}-bg)`} />

      {/* ── "C" arc formed by node connections ── */}
      {/* The arc sweeps from top-right, around left, to bottom-right — forming a C */}
      <path
        d="M 54 18 A 22 22 0 1 0 54 62"
        stroke={light ? 'rgba(59,130,246,0.25)' : 'rgba(96,165,250,0.3)'}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Connection lines between nodes ── */}
      <g stroke={light ? 'rgba(59,130,246,0.2)' : 'rgba(96,165,250,0.25)'} strokeWidth="1" fill="none" strokeLinecap="round">
        {/* Top-right → center */}
        <line x1="54" y1="18" x2="40" y2="40" />
        {/* Left → center */}
        <line x1="18" y1="40" x2="40" y2="40" />
        {/* Bottom-right → center */}
        <line x1="54" y1="62" x2="40" y2="40" />
        {/* Top-left → center */}
        <line x1="22" y1="22" x2="40" y2="40" />
        {/* Bottom-left → center */}
        <line x1="22" y1="58" x2="40" y2="40" />
      </g>

      {/* ── Nodes ── */}
      <g filter={`url(#${uid}-soft)`}>
        {/* Top-right */}
        <circle cx="54" cy="18" r="3.5" fill={light ? '#60A5FA' : '#60A5FA'} opacity={light ? '0.7' : '0.85'} />
        {/* Right (open end of C) — slightly faded */}
        <circle cx="62" cy="40" r="2.5" fill={light ? '#93C5FD' : '#93C5FD'} opacity={light ? '0.4' : '0.4'} />
        {/* Bottom-right */}
        <circle cx="54" cy="62" r="3.5" fill={light ? '#60A5FA' : '#60A5FA'} opacity={light ? '0.7' : '0.85'} />
        {/* Left (C midpoint) */}
        <circle cx="18" cy="40" r="3.5" fill={light ? '#3B82F6' : '#22D3EE'} opacity={light ? '0.8' : '0.9'} />
        {/* Top-left */}
        <circle cx="22" cy="22" r="2.8" fill={light ? '#60A5FA' : '#60A5FA'} opacity={light ? '0.55' : '0.65'} />
        {/* Bottom-left */}
        <circle cx="22" cy="58" r="2.8" fill={light ? '#60A5FA' : '#60A5FA'} opacity={light ? '0.55' : '0.65'} />
      </g>

      {/* ── Central star ── */}
      <path
        d="M40 24
           C40.7 31.5 41.3 33 46 35.5
           C50.5 37.8 52 38.8 58 40
           C52 41.2 50.5 42.2 46 44.5
           C41.3 47 40.7 48.5 40 56
           C39.3 48.5 38.7 47 34 44.5
           C29.5 42.2 28 41.2 22 40
           C28 38.8 29.5 37.8 34 35.5
           C38.7 33 39.3 31.5 40 24Z"
        fill={`url(#${uid}-star)`}
        filter={`url(#${uid}-glow)`}
      />

      {/* Star inner highlight */}
      <path
        d="M40 29
           C40.4 34.5 41 35.8 44.5 37.8
           C47.8 39.6 49 40.2 54 40
           C49 39.8 47.8 40.4 44.5 42.2
           C41 44.2 40.4 45.5 40 51
           C39.6 45.5 39 44.2 35.5 42.2
           C32.2 40.4 31 39.8 26 40
           C31 40.2 32.2 39.6 35.5 37.8
           C39 35.8 39.6 34.5 40 29Z"
        fill={light ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
      />

      {/* Center dot */}
      <circle cx="40" cy="40" r="2.5" fill={light ? 'white' : 'rgba(255,255,255,0.9)'} />
    </svg>
  );
}

/* ─── Horizontal: Icon + "Connect AI" text ─────────────────── */
function HorizontalLogo({ size, light, uid, className }) {
  const textColor = light ? '#0F172A' : '#F1F5F9';
  const aiColor   = light ? '#0EA5E9' : '#22D3EE';

  return (
    <svg
      width={size * 3.8}
      height={size}
      viewBox={`0 0 ${80 * 3.8} 80`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Connect AI"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          {light
            ? <><stop offset="0%" stopColor="#EFF6FF" /><stop offset="100%" stopColor="#DBEAFE" /></>
            : <><stop offset="0%" stopColor="#0B1C3D" /><stop offset="100%" stopColor="#1E3A8A" /></>
          }
        </linearGradient>
        <linearGradient id={`${uid}-star`} x1="30" y1="22" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={light ? '1.5' : '2.5'} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Icon mark (redrawn inline at 0,0) */}
      <rect width="80" height="80" rx="18" fill={`url(#${uid}-bg)`} />
      <path d="M 54 18 A 22 22 0 1 0 54 62" stroke={light ? 'rgba(59,130,246,0.25)' : 'rgba(96,165,250,0.3)'} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <g stroke={light ? 'rgba(59,130,246,0.2)' : 'rgba(96,165,250,0.25)'} strokeWidth="1" fill="none" strokeLinecap="round">
        <line x1="54" y1="18" x2="40" y2="40" />
        <line x1="18" y1="40" x2="40" y2="40" />
        <line x1="54" y1="62" x2="40" y2="40" />
        <line x1="22" y1="22" x2="40" y2="40" />
        <line x1="22" y1="58" x2="40" y2="40" />
      </g>
      <g filter={`url(#${uid}-soft)`}>
        <circle cx="54" cy="18" r="3.5" fill="#60A5FA" opacity={light ? '0.7' : '0.85'} />
        <circle cx="54" cy="62" r="3.5" fill="#60A5FA" opacity={light ? '0.7' : '0.85'} />
        <circle cx="18" cy="40" r="3.5" fill={light ? '#3B82F6' : '#22D3EE'} opacity={light ? '0.8' : '0.9'} />
        <circle cx="22" cy="22" r="2.8" fill="#60A5FA" opacity={light ? '0.55' : '0.65'} />
        <circle cx="22" cy="58" r="2.8" fill="#60A5FA" opacity={light ? '0.55' : '0.65'} />
      </g>
      <path d="M40 24 C40.7 31.5 41.3 33 46 35.5 C50.5 37.8 52 38.8 58 40 C52 41.2 50.5 42.2 46 44.5 C41.3 47 40.7 48.5 40 56 C39.3 48.5 38.7 47 34 44.5 C29.5 42.2 28 41.2 22 40 C28 38.8 29.5 37.8 34 35.5 C38.7 33 39.3 31.5 40 24Z" fill={`url(#${uid}-star)`} filter={`url(#${uid}-glow)`} />
      <path d="M40 29 C40.4 34.5 41 35.8 44.5 37.8 C47.8 39.6 49 40.2 54 40 C49 39.8 47.8 40.4 44.5 42.2 C41 44.2 40.4 45.5 40 51 C39.6 45.5 39 44.2 35.5 42.2 C32.2 40.4 31 39.8 26 40 C31 40.2 32.2 39.6 35.5 37.8 C39 35.8 39.6 34.5 40 29Z" fill={light ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'} />
      <circle cx="40" cy="40" r="2.5" fill={light ? 'white' : 'rgba(255,255,255,0.9)'} />

      {/* "Connect" text */}
      <text
        x="96"
        y="50"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="600"
        letterSpacing="-0.5"
        fill={textColor}
      >
        Connect
      </text>

      {/* "AI" text — highlighted */}
      <text
        x="96"
        y="50"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="600"
        letterSpacing="-0.5"
        fill={textColor}
      >
        <tspan dx="168">{'  '}</tspan>
      </text>
      <text
        x="270"
        y="50"
        fontFamily="Inter, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="-0.3"
        fill={aiColor}
      >
        AI
      </text>
    </svg>
  );
}

/* ─── Stacked: Icon top, text below ────────────────────────── */
function StackedLogo({ size, light, uid, className }) {
  const textColor = light ? '#0F172A' : '#F1F5F9';
  const aiColor   = light ? '#0EA5E9' : '#22D3EE';

  return (
    <svg
      width={size}
      height={size * 1.7}
      viewBox={`0 0 80 ${80 * 1.7}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Connect AI"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          {light
            ? <><stop offset="0%" stopColor="#EFF6FF" /><stop offset="100%" stopColor="#DBEAFE" /></>
            : <><stop offset="0%" stopColor="#0B1C3D" /><stop offset="100%" stopColor="#1E3A8A" /></>
          }
        </linearGradient>
        <linearGradient id={`${uid}-star`} x1="30" y1="22" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={light ? '1.5' : '2.5'} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Icon */}
      <rect width="80" height="80" rx="18" fill={`url(#${uid}-bg)`} />
      <path d="M 54 18 A 22 22 0 1 0 54 62" stroke={light ? 'rgba(59,130,246,0.25)' : 'rgba(96,165,250,0.3)'} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <g stroke={light ? 'rgba(59,130,246,0.2)' : 'rgba(96,165,250,0.25)'} strokeWidth="1" fill="none" strokeLinecap="round">
        <line x1="54" y1="18" x2="40" y2="40" />
        <line x1="18" y1="40" x2="40" y2="40" />
        <line x1="54" y1="62" x2="40" y2="40" />
        <line x1="22" y1="22" x2="40" y2="40" />
        <line x1="22" y1="58" x2="40" y2="40" />
      </g>
      <g filter={`url(#${uid}-soft)`}>
        <circle cx="54" cy="18" r="3.5" fill="#60A5FA" opacity={light ? '0.7' : '0.85'} />
        <circle cx="54" cy="62" r="3.5" fill="#60A5FA" opacity={light ? '0.7' : '0.85'} />
        <circle cx="18" cy="40" r="3.5" fill={light ? '#3B82F6' : '#22D3EE'} opacity={light ? '0.8' : '0.9'} />
        <circle cx="22" cy="22" r="2.8" fill="#60A5FA" opacity={light ? '0.55' : '0.65'} />
        <circle cx="22" cy="58" r="2.8" fill="#60A5FA" opacity={light ? '0.55' : '0.65'} />
      </g>
      <path d="M40 24 C40.7 31.5 41.3 33 46 35.5 C50.5 37.8 52 38.8 58 40 C52 41.2 50.5 42.2 46 44.5 C41.3 47 40.7 48.5 40 56 C39.3 48.5 38.7 47 34 44.5 C29.5 42.2 28 41.2 22 40 C28 38.8 29.5 37.8 34 35.5 C38.7 33 39.3 31.5 40 24Z" fill={`url(#${uid}-star)`} filter={`url(#${uid}-glow)`} />
      <path d="M40 29 C40.4 34.5 41 35.8 44.5 37.8 C47.8 39.6 49 40.2 54 40 C49 39.8 47.8 40.4 44.5 42.2 C41 44.2 40.4 45.5 40 51 C39.6 45.5 39 44.2 35.5 42.2 C32.2 40.4 31 39.8 26 40 C31 40.2 32.2 39.6 35.5 37.8 C39 35.8 39.6 34.5 40 29Z" fill={light ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'} />
      <circle cx="40" cy="40" r="2.5" fill={light ? 'white' : 'rgba(255,255,255,0.9)'} />

      {/* Text below */}
      <text x="40" y="106" textAnchor="middle" fontFamily="Inter, -apple-system, sans-serif" fontSize="18" fontWeight="600" letterSpacing="-0.3" fill={textColor}>
        Connect
      </text>
      <text x="40" y="128" textAnchor="middle" fontFamily="Inter, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="0.5" fill={aiColor}>
        AI
      </text>
    </svg>
  );
}
