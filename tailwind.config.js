/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'rgb(var(--bg-base) / <alpha-value>)',
          panel: 'rgb(var(--bg-panel) / <alpha-value>)',
          raised: 'rgb(var(--bg-raised) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)'
        },
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          muted: 'rgb(var(--accent-muted) / <alpha-value>)'
        },
        state: {
          connected: 'rgb(var(--state-connected) / <alpha-value>)',
          connecting: 'rgb(var(--state-connecting) / <alpha-value>)',
          error: 'rgb(var(--state-error) / <alpha-value>)',
          idle: 'rgb(var(--state-idle) / <alpha-value>)'
        },
        overlay: 'rgb(var(--overlay) / <alpha-value>)',
        syntax: {
          key: 'rgb(var(--syntax-key) / <alpha-value>)',
          string: 'rgb(var(--syntax-string) / <alpha-value>)',
          number: 'rgb(var(--syntax-number) / <alpha-value>)',
          bool: 'rgb(var(--syntax-bool) / <alpha-value>)',
          null: 'rgb(var(--syntax-null) / <alpha-value>)'
        },
        warn: {
          bg: 'rgb(var(--warn-bg) / <alpha-value>)',
          fg: 'rgb(var(--warn-fg) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
