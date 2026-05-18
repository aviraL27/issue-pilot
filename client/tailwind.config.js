export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      colors: {
        ink: '#0D1117',
        muted: '#57606A',
        line: '#E5E7EB',
        available: '#2DA44E',
        warning: '#D97706',
        danger: '#CF222E'
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        github: '6px',
        badge: '4px',
        input: '2px'
      },
      keyframes: {
        cursor: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        },
        typefade: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '15%, 85%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-4px)' }
        }
      },
      animation: {
        cursor: 'cursor 1s step-end infinite',
        typefade: 'typefade 7s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
