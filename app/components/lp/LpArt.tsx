import { useEffect, useState } from "react";

/**
 * Shared SVG pieces from the design (reference/source.html): gradients, the
 * cat-head projector (#dev) and the glowing mouse (#mouse). Rendered once per
 * page in a zero-size SVG, so every <use href="#dev"> on the page can reach it.
 * Not display:none: gradients inside a display:none SVG don't paint.
 */
export function LpDefs() {
  return (
    <svg className="lp-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hole" cx="50%" cy="55%" r="60%">
          <stop offset="0" stopColor="#0d0505" />
          <stop offset=".62" stopColor="#2a0709" />
          <stop offset=".8" stopColor="#ff2e43" />
          <stop offset="1" stopColor="#ff2e43" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="halo">
          <stop offset="0" stopColor="#ff3b4e" stopOpacity=".45" />
          <stop offset="1" stopColor="#ff3b4e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pool" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#ff3b4e" stopOpacity=".28" />
          <stop offset="1" stopColor="#ff3b4e" stopOpacity="0" />
        </radialGradient>
        <symbol id="dev" viewBox="-80 -110 160 190">
          <ellipse cx="0" cy="66" rx="58" ry="12" fill="#000" opacity=".45" />
          <path d="M-46 52h92l-8 14h-76z" fill="#26212a" />
          <ellipse cx="0" cy="52" rx="46" ry="9" fill="none" stroke="#ff3b4e" strokeWidth="4" />
          <path d="M-52-40l6-58 34 30zM52-40l-6-58-34 30z" fill="#2e2833" />
          <path
            d="M-44-48l4-38 20 18zM44-48l-4-38-20 18z"
            fill="none"
            stroke="#ff3b4e"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-6" r="60" fill="#2e2833" />
          <path d="M-50-38a60 60 0 0 1 60-28" fill="none" stroke="#5b5263" strokeWidth="5" strokeLinecap="round" />
          <rect x="-8" y="-72" width="16" height="9" rx="3" fill="#ff3b4e" />
          <circle cx="0" cy="-2" r="41" fill="#17131a" stroke="#ff3b4e" strokeWidth="4" />
          <g fill="#ff3b4e">
            <rect x="-26" y="-22" width="6" height="6" />
            <rect x="-20" y="-28" width="6" height="6" />
            <rect x="-14" y="-22" width="6" height="6" />
            <rect x="8" y="-22" width="6" height="6" />
            <rect x="14" y="-28" width="6" height="6" />
            <rect x="20" y="-22" width="6" height="6" />
          </g>
          <circle cx="0" cy="14" r="11" fill="#ff3b4e" />
          <circle cx="-3" cy="11" r="3.5" fill="#ffd0d4" />
        </symbol>
        <symbol id="mouse" viewBox="-30 -14 60 28" overflow="visible">
          <ellipse cx="0" cy="0" rx="30" ry="22" fill="url(#halo)" />
          <path d="M-12 0q-14-2-18-8" fill="none" stroke="#ff5a6a" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M-12 0c0-8 10-10 18-6 4 2 8 4 10 6-2 2-6 4-10 6-8 4-18 2-18-6z"
            fill="rgba(255,59,78,.3)"
            stroke="#ff5a6a"
            strokeWidth="2.5"
          />
          <circle cx="4" cy="-7" r="4" fill="none" stroke="#ff5a6a" strokeWidth="2.2" />
          <circle cx="4" cy="7" r="4" fill="none" stroke="#ff5a6a" strokeWidth="2.2" />
        </symbol>

        {/* Bundle picker (reference/bundle.html): small-size projector and mouse with heavier strokes. */}
        <radialGradient id="holeS" cx="50%" cy="55%" r="60%">
          <stop offset="0" stopColor="#0d0505" />
          <stop offset=".6" stopColor="#2a0709" />
          <stop offset=".82" stopColor="#ff2e43" />
          <stop offset="1" stopColor="#ff2e43" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="haloS">
          <stop offset="0" stopColor="#ff3b4e" stopOpacity=".5" />
          <stop offset="1" stopColor="#ff3b4e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="poolS" cx="50%" cy="60%" r="65%">
          <stop offset="0" stopColor="#ff3b4e" stopOpacity=".3" />
          <stop offset="1" stopColor="#ff3b4e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f1ee" />
          <stop offset="1" stopColor="#e3dad5" />
        </linearGradient>
        <pattern id="planksS" width="80" height="16" patternUnits="userSpaceOnUse">
          <rect width="80" height="16" fill="#2b1a11" />
          <rect width="49" height="7.5" fill="#46291b" />
          <rect x="50" width="30" height="7.5" fill="#3f2619" />
          <rect y="8" width="22" height="7.5" fill="#432819" />
          <rect x="23" y="8" width="57" height="7.5" fill="#4a2c1d" />
        </pattern>
        <symbol id="devS" viewBox="-80 -110 160 190">
          <ellipse cx="0" cy="68" rx="60" ry="11" fill="#000" opacity=".35" />
          <path d="M-46 52h92l-8 14h-76z" fill="#26212a" />
          <ellipse cx="0" cy="52" rx="46" ry="9" fill="none" stroke="#ff3b4e" strokeWidth="5" />
          <path d="M-52-40l6-58 34 30zM52-40l-6-58-34 30z" fill="#2e2833" />
          <path
            d="M-44-48l4-38 20 18zM44-48l-4-38-20 18z"
            fill="none"
            stroke="#ff3b4e"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-6" r="60" fill="#2e2833" />
          <circle cx="0" cy="-2" r="41" fill="#17131a" stroke="#ff3b4e" strokeWidth="5" />
          <g fill="#ff3b4e">
            <rect x="-26" y="-24" width="9" height="9" />
            <rect x="17" y="-24" width="9" height="9" />
          </g>
          <circle cx="0" cy="14" r="12" fill="#ff3b4e" />
        </symbol>
        <symbol id="mouseS" viewBox="-30 -14 60 28" overflow="visible">
          <ellipse rx="30" ry="22" fill="url(#haloS)" />
          <path d="M-12 0q-14-2-18-8" fill="none" stroke="#ff6b7a" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M-12 0c0-8 10-10 18-6 4 2 8 4 10 6-2 2-6 4-10 6-8 4-18 2-18-6z"
            fill="rgba(255,59,78,.35)"
            stroke="#ff6b7a"
            strokeWidth="3"
          />
          <circle cx="4" cy="-7" r="4" fill="none" stroke="#ff6b7a" strokeWidth="2.5" />
          <circle cx="4" cy="7" r="4" fill="none" stroke="#ff6b7a" strokeWidth="2.5" />
        </symbol>
      </defs>
    </svg>
  );
}

/** Seeded plank layout from the design's script; the same on server and client. */
const PLANKS = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tones = ["#45291b", "#3c2418", "#4a2d1d", "#40271a"];
  const planks: Array<{ x: string; y: number; width: string; fill: string }> = [];
  for (let y = 128; y < 420; y += 34) {
    let x = -rnd() * 200;
    while (x < 1200) {
      const w = 220 + rnd() * 180;
      planks.push({ x: x.toFixed(1), y, width: (w - 2).toFixed(1), fill: tones[Math.floor(rnd() * tones.length)] });
      x += w;
    }
  }
  return planks;
})();

const HOLES: Array<[number, number, number]> = [
  [480, 290, 34],
  [620, 362, 38],
  [700, 232, 28],
  [770, 238, 30],
  [560, 202, 24],
  [402, 366, 36],
];

const MICE = [
  { pos: "590,248", dur: "2.8s", begin: undefined, path: "M480 290Q560 220 700 232", keyTimes: "0;.12;.78;.9;1" },
  { pos: "720,340", dur: "3.4s", begin: "0.9s", path: "M620 362Q720 330 770 238", keyTimes: "0;.1;.8;.9;1" },
  { pos: "470,290", dur: "3s", begin: "1.6s", path: "M560 202Q470 240 402 366", keyTimes: "0;.12;.8;.9;1" },
];

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** The hero's night scene: projector, glowing holes, darting mice and a crouched cat. */
export function NightScene() {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 50 1200 370"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="A cat-shaped projector lights glowing mouse holes on a wooden floor at night while a cat crouches, ready to pounce"
    >
      <rect width="1200" height="130" fill="#241815" />
      <rect y="110" width="1200" height="18" fill="#1a110e" />
      <g>
        <rect y="128" width="1200" height="292" fill="#3f2719" />
        {PLANKS.map((plank, index) => (
          <rect key={index} x={plank.x} y={plank.y} width={plank.width} height="32" fill={plank.fill} />
        ))}
      </g>
      <rect y="128" width="1200" height="292" fill="#140b08" opacity=".35" />
      <ellipse cx="610" cy="290" rx="430" ry="130" fill="url(#pool)" />
      <path d="M330 282L470 200L470 380z" fill="#ff3b4e" opacity=".06" />
      <g>
        {HOLES.map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <ellipse cx={x} cy={y} rx={r * 1.9} ry={r * 0.75} fill="url(#halo)" />
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.36} fill="url(#hole)" />
          </g>
        ))}
      </g>
      <g>
        {MICE.map((mouse) =>
          reduced ? (
            <g key={mouse.path} transform={`translate(${mouse.pos})`}>
              <use href="#mouse" x="-30" y="-14" width="60" height="28" />
            </g>
          ) : (
            <g key={mouse.path} opacity="0">
              <use href="#mouse" x="-30" y="-14" width="60" height="28" />
              <animateMotion
                dur={mouse.dur}
                begin={mouse.begin}
                repeatCount="indefinite"
                rotate="auto"
                path={mouse.path}
              />
              <animate
                attributeName="opacity"
                dur={mouse.dur}
                begin={mouse.begin}
                repeatCount="indefinite"
                values="0;1;1;0;0"
                keyTimes={mouse.keyTimes}
              />
            </g>
          ),
        )}
      </g>
      <use href="#dev" x="250" y="165" width="160" height="190" />
      <g transform="translate(860 300)">
        <ellipse cx="10" cy="62" rx="120" ry="12" fill="#000" opacity=".4" />
        <path d="M70 40c60-10 80 20 60 40" fill="none" stroke="#1c1920" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="20" cy="30" rx="90" ry="34" fill="#1f1c24" />
        <circle cx="70" cy="34" r="34" fill="#1f1c24" />
        <circle cx="-70" cy="20" r="32" fill="#25212b" />
        <path d="M-92-2l-6-34 26 18zM-58-6l4-34 18 26z" fill="#25212b" />
        <path
          d="M-100 22a32 32 0 0 1 12-28M-68 60c-30 0-34-8-34-8"
          fill="none"
          stroke="#ff3b4e"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".55"
        />
        <path d="M-60 52h30M-6 58h34" stroke="#1f1c24" strokeWidth="14" strokeLinecap="round" />
        <ellipse cx="-82" cy="16" rx="5" ry="6" fill="#ffd36a" />
        <ellipse cx="-82" cy="16" rx="1.8" ry="5" fill="#140f0f" />
        <path d="M-100 30l-16-2M-100 34l-16 4" stroke="#5a5160" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** The design's logo mark (red cat head with two white eyes). */
export function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M5 30V9l7 6h10l7-6v21z" fill="#e3242b" />
      <rect x="11" y="19" width="4" height="4" fill="#fff" />
      <rect x="19" y="19" width="4" height="4" fill="#fff" />
    </svg>
  );
}
