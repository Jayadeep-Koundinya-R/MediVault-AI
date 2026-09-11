/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FA',
          100: '#DFEDF4',
          200: '#BED9E8',
          300: '#94BFD7',
          400: '#64A1C3',
          500: '#3D82AC',
          600: '#2A668D',
          700: '#1F4F70',
          800: '#163C55',
          900: '#0F2D3C', // Deep Marine Teal (Primary)
          950: '#081B26',
        },
        trust: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#6366F1',
          600: '#4F46E5', // DPDP & Cryptographic Trust Indigo
          700: '#4338CA',
        },
        clinical: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          subtle: '#F1F5F9',
          muted: '#64748B',
          dark: '#0B192C',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'clinical-sm': '0 1px 3px 0 rgba(15, 45, 60, 0.04), 0 1px 2px -1px rgba(15, 45, 60, 0.02)',
        'clinical': '0 4px 6px -1px rgba(15, 45, 60, 0.07), 0 2px 4px -2px rgba(15, 45, 60, 0.04)',
        'clinical-lg': '0 10px 15px -3px rgba(15, 45, 60, 0.08), 0 4px 6px -4px rgba(15, 45, 60, 0.04)',
        'clinical-modal': '0 20px 25px -5px rgba(15, 45, 60, 0.12), 0 8px 10px -6px rgba(15, 45, 60, 0.08)',
      }
    },
  },
  plugins: [],
}
