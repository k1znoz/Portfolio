/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  darkMode: 'class',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: '#0e0e0e',
        surface: '#0e0e0e',
        'surface-variant': '#262626',
        'surface-container': '#191919',
        'surface-container-low': '#131313',
        'surface-container-high': '#1f1f1f',
        'surface-container-highest': '#262626',
        secondary: '#e2e2e2',
        primary: '#ff8f73',
        tertiary: '#9cff93',
        error: '#ff6e84',
        outline: '#757575',
        'outline-variant': '#484848',
        'on-surface': '#ffffff',
        'on-surface-variant': '#ababab',
        'on-primary': '#5e1100',
        'on-tertiary-container': '#005a10',
        'tertiary-container': '#00fc40',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
}