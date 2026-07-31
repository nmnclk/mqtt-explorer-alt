/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#111318',
          panel: '#181b22',
          raised: '#20242e',
          border: '#2a2f3a'
        },
        accent: {
          DEFAULT: '#5b8def',
          soft: '#3a4a6b'
        },
        state: {
          connected: '#3fb950',
          connecting: '#d29922',
          error: '#f85149',
          idle: '#6e7681'
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'Menlo', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
