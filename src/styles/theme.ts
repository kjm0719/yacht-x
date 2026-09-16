/**
 * Nexon / AAA Esports Game Design Tokens
 * Centralized design system for Yacht Dice x ARAM Augments
 */

export const THEME_COLORS = {
  // Teal / Cyan (Primary Game Theme - Hextech / Nexon Cyber)
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#0AC8B9', // Main Brand Cyan
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    glow: 'rgba(10, 200, 185, 0.45)',
  },
  // Amber / Gold (Prestige, Yacht, High Score)
  gold: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F3BA2F', // Main Gold
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    glow: 'rgba(243, 186, 47, 0.45)',
  },
  // Purple / Prismatic (Mythic, Prismatic Augments)
  prismatic: {
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    glow: 'rgba(192, 132, 252, 0.45)',
  },
  // Dark Game Client Surfaces
  dark: {
    bg: '#040814',
    surface: '#07101E',
    card: '#0C1A30',
    panel: '#0F223D',
    cardHover: '#132847',
    border: '#1E3860',
    borderGlow: 'rgba(30, 56, 96, 0.6)',
  },
};

export const THEME_FONTS = {
  body: "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
  display: "Orbitron, Pretendard, sans-serif",
  mono: "Rajdhani, ui-monospace, monospace",
};

export const THEME_CLASSES = {
  panel: 'game-panel',
  panelGold: 'game-panel-gold',
  btnTeal: 'btn-nexon-teal',
  btnGold: 'btn-nexon-gold',
  btnDark: 'btn-nexon-dark',
  badgeLive: 'badge-nexon-live',
};
