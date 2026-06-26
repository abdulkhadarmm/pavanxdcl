export const theme = {
  colors: {
    bgDark: '#0d0a08', // pitch dark
    bgCard: '#121111', // dark card background from screenshots

    border: 'rgba(255, 255, 255, 0.05)', // subtle borders
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    primaryOrange: '#f97316', // Rich orange brand accent
    
    // Accents for cards and tags
    blue: '#3b82f6',
    emerald: '#10b981',
    royal: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#f43f5e',

    // States
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
    info: '#3b82f6'
  },
  gradients: {
    hero: 'linear-gradient(135deg, #f97316 0%, #ff7a00 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    emerald: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    royal: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    rose: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    text: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
  },
  shadows: {
    premium: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    glowBlue: '0 0 15px -3px rgba(59, 130, 246, 0.3)',
    glowEmerald: '0 0 15px -3px rgba(16, 185, 129, 0.3)',
    glowRoyal: '0 0 15px -3px rgba(139, 92, 246, 0.3)',
  },
  transitions: {
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

export default theme;

