export interface BadgeOptions {
  overallScore: number;
  targetName: string;
  theme: 'obsidian' | 'emerald' | 'minimal';
}

export function generateCertificationSvg(options: BadgeOptions): string {
  const { overallScore, targetName, theme } = options;
  const grade = overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : 'C';
  const gradeColor = overallScore >= 80 ? '#10b981' : overallScore >= 70 ? '#06b6d4' : '#f59e0b';
  const safeTarget = (targetName || 'Production Site').slice(0, 24);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 76" width="340" height="76" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05070B" />
      <stop offset="100%" stop-color="#0E1626" />
    </linearGradient>
    <linearGradient id="glowBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.6" />
    </linearGradient>
  </defs>

  <!-- Container Box -->
  <rect x="1" y="1" width="338" height="74" rx="12" fill="url(#bgGrad)" stroke="url(#glowBorder)" stroke-width="1.5" />

  <!-- Shield Icon -->
  <g transform="translate(14, 18)">
    <path d="M18 36s14-7 14-18V7L18 2 4 7v11c0 11 14 18 14 18z" fill="#05070B" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m13 18 3.5 3.5 7-7" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Typography -->
  <text x="64" y="28" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" letter-spacing="1.2" fill="#06b6d4" text-transform="uppercase">
    AUDITED &amp; SHIELDED BY
  </text>
  <text x="64" y="46" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" letter-spacing="0.4" fill="#FFFFFF">
    LYAXIS AEGIS
  </text>
  <text x="64" y="60" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94A3B8">
    ${safeTarget} · VERIFIED
  </text>

  <!-- Score Pill -->
  <rect x="262" y="16" width="62" height="44" rx="8" fill="#05070B" stroke="${gradeColor}" stroke-width="1.2" />
  <text x="293" y="34" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" fill="${gradeColor}" text-anchor="middle">
    ${overallScore}/100
  </text>
  <text x="293" y="49" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700" fill="#94A3B8" text-anchor="middle">
    GRADE ${grade}
  </text>
</svg>`;
}

export function generateCertificationHtml(options: BadgeOptions): string {
  const svg = generateCertificationSvg(options);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return `<!-- LYAXIS AEGIS Verified Badge -->
<a href="https://lyaxis.com/aegis" target="_blank" rel="noopener noreferrer" title="Audited &amp; Shielded by LYAXIS Aegis" style="display:inline-block; text-decoration:none;">
  <img src="${dataUri}" alt="Audited &amp; Shielded by LYAXIS Aegis - Score ${options.overallScore}/100" width="340" height="76" style="max-width:100%; height:auto;" />
</a>`;
}

export function generateCertificationMarkdown(options: BadgeOptions): string {
  const svg = generateCertificationSvg(options);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return `[![Audited & Shielded by LYAXIS Aegis](${dataUri})](https://lyaxis.com/aegis)`;
}
