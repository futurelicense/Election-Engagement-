export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  bodyFont: string;
  displayFont: string;
  darkMode: boolean;
}

export const DEFAULT_THEME: Theme = {
  primary: '#10B981',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  danger: '#EF4444',
  bodyFont: 'Inter',
  displayFont: 'Poppins',
  darkMode: false,
};

export const THEME_PRESETS: Array<{ name: string; description: string; theme: Theme }> = [
  {
    name: 'Default',
    description: 'African green with blue',
    theme: DEFAULT_THEME,
  },
  {
    name: 'Nigeria',
    description: 'Nigerian national colors',
    theme: {
      primary: '#008751',
      secondary: '#235C3A',
      accent: '#F0C040',
      danger: '#EF4444',
      bodyFont: 'Inter',
      displayFont: 'Montserrat',
      darkMode: false,
    },
  },
  {
    name: 'Ocean',
    description: 'Cool blue tones',
    theme: {
      primary: '#0EA5E9',
      secondary: '#6366F1',
      accent: '#F59E0B',
      danger: '#EF4444',
      bodyFont: 'Inter',
      displayFont: 'Poppins',
      darkMode: false,
    },
  },
  {
    name: 'Sunset',
    description: 'Warm orange and red',
    theme: {
      primary: '#F97316',
      secondary: '#EF4444',
      accent: '#FCD34D',
      danger: '#DC2626',
      bodyFont: 'Roboto',
      displayFont: 'Raleway',
      darkMode: false,
    },
  },
  {
    name: 'Royal',
    description: 'Purple and violet',
    theme: {
      primary: '#7C3AED',
      secondary: '#2563EB',
      accent: '#EC4899',
      danger: '#EF4444',
      bodyFont: 'Inter',
      displayFont: 'Poppins',
      darkMode: false,
    },
  },
  {
    name: 'Dark Mode',
    description: 'Dark background variant',
    theme: {
      primary: '#10B981',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      danger: '#EF4444',
      bodyFont: 'Inter',
      displayFont: 'Poppins',
      darkMode: true,
    },
  },
];

export const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
];

/** Generates a CSS string that overrides the Tailwind african-* classes with the chosen colors */
export function generateThemeCSS(theme: Theme): string {
  const { primary, secondary, accent, danger, bodyFont, displayFont, darkMode } = theme;
  const lines: string[] = [];

  lines.push(`:root {`);
  lines.push(`  --color-primary: ${primary};`);
  lines.push(`  --color-secondary: ${secondary};`);
  lines.push(`  --color-accent: ${accent};`);
  lines.push(`  --color-danger: ${danger};`);
  lines.push(`  --font-body: '${bodyFont}', system-ui, sans-serif;`);
  lines.push(`  --font-display: '${displayFont}', system-ui, sans-serif;`);
  lines.push(`}`);

  // Primary (african-green)
  lines.push(`.bg-african-green { background-color: ${primary} !important; }`);
  lines.push(`.hover\\:bg-african-green:hover { background-color: ${primary} !important; }`);
  lines.push(`.text-african-green { color: ${primary} !important; }`);
  lines.push(`.border-african-green { border-color: ${primary} !important; }`);
  lines.push(`.border-b-2.border-african-green { border-bottom-color: ${primary} !important; }`);
  lines.push(`.focus\\:ring-african-green:focus { --tw-ring-color: ${primary} !important; }`);
  lines.push(`.from-african-green { --tw-gradient-from: ${primary} !important; }`);

  // Secondary (african-blue)
  lines.push(`.bg-african-blue { background-color: ${secondary} !important; }`);
  lines.push(`.hover\\:bg-african-blue:hover { background-color: ${secondary} !important; }`);
  lines.push(`.text-african-blue { color: ${secondary} !important; }`);
  lines.push(`.border-african-blue { border-color: ${secondary} !important; }`);
  lines.push(`.from-african-blue { --tw-gradient-from: ${secondary} !important; }`);

  // Accent (african-yellow)
  lines.push(`.bg-african-yellow { background-color: ${accent} !important; }`);
  lines.push(`.hover\\:bg-african-yellow:hover { background-color: ${accent} !important; }`);
  lines.push(`.text-african-yellow { color: ${accent} !important; }`);

  // Danger (african-red)
  lines.push(`.bg-african-red { background-color: ${danger} !important; }`);
  lines.push(`.hover\\:bg-african-red:hover { background-color: ${danger} !important; }`);
  lines.push(`.text-african-red { color: ${danger} !important; }`);

  // Fonts
  lines.push(`body { font-family: var(--font-body); }`);
  lines.push(`.font-display { font-family: var(--font-display) !important; }`);

  // Dark mode overrides
  if (darkMode) {
    lines.push(`body { background: #0f172a !important; color: #f1f5f9 !important; }`);
    lines.push(`.bg-white { background-color: #1e293b !important; }`);
    lines.push(`.bg-gray-50 { background-color: #0f172a !important; }`);
    lines.push(`.bg-gray-100 { background-color: #1e293b !important; }`);
    lines.push(`.bg-gray-200 { background-color: #334155 !important; }`);
    lines.push(`.hover\\:bg-gray-100:hover { background-color: #1e293b !important; }`);
    lines.push(`.hover\\:bg-gray-50:hover { background-color: #1e293b !important; }`);
    lines.push(`.text-gray-900 { color: #f1f5f9 !important; }`);
    lines.push(`.text-gray-800 { color: #e2e8f0 !important; }`);
    lines.push(`.text-gray-700 { color: #cbd5e1 !important; }`);
    lines.push(`.text-gray-600 { color: #94a3b8 !important; }`);
    lines.push(`.text-gray-500 { color: #64748b !important; }`);
    lines.push(`.border-gray-200 { border-color: #334155 !important; }`);
    lines.push(`.border-gray-100 { border-color: #1e293b !important; }`);
    lines.push(`.divide-gray-100 > * + * { border-color: #1e293b !important; }`);
    lines.push(`.bg-gradient-to-br { background: #0f172a !important; }`);
    lines.push(`input, select, textarea { background-color: #1e293b !important; color: #f1f5f9 !important; border-color: #334155 !important; }`);
  }

  return lines.join('\n');
}

export function applyThemeToDOM(theme: Theme): void {
  // Inject/replace override <style> tag
  let el = document.getElementById('theme-override');
  if (!el) {
    el = document.createElement('style');
    el.id = 'theme-override';
    document.head.appendChild(el);
  }
  el.textContent = generateThemeCSS(theme);

  // Load required Google Fonts dynamically
  const fontsNeeded = [...new Set([theme.bodyFont, theme.displayFont])].filter(
    (f) => !['system-ui', 'sans-serif'].includes(f)
  );
  if (fontsNeeded.length > 0) {
    let fontLink = document.getElementById('theme-fonts') as HTMLLinkElement | null;
    if (!fontLink) {
      fontLink = document.createElement('link') as HTMLLinkElement;
      fontLink.id = 'theme-fonts';
      fontLink.rel = 'stylesheet';
      document.head.appendChild(fontLink);
    }
    const families = fontsNeeded
      .map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`)
      .join('&');
    fontLink.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }
}
