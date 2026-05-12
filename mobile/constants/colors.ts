export const colors = {
  dark: {
    bg: '#0a0a0b',
    panel: '#131316',
    panel2: '#1a1a1f',
    border: '#2a2a30',
    borderBright: '#3a3a44',
    text: '#e8e8ec',
    muted: '#8a8a95',
    faint: '#555560',
    accent: '#f59e0b',
    accent2: '#fbbf24',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    topbarBg: 'rgba(10,10,11,0.97)',
  },
  light: {
    bg: '#f6f7f9',
    panel: '#ffffff',
    panel2: '#eef1f5',
    border: '#d8dde6',
    borderBright: '#b8c0cc',
    text: '#0f172a',
    muted: '#334155',
    faint: '#64748b',
    accent: '#d97706',
    accent2: '#f59e0b',
    success: '#047857',
    error: '#dc2626',
    warning: '#b45309',
    topbarBg: 'rgba(246,247,249,0.97)',
  },
} as const;

export type Theme = keyof typeof colors;
export type ThemeColors = typeof colors.dark;
