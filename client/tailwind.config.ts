import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  daisyui: {
      themes: [
        {
          mytheme: {
			 "primary": "#c72138",
			 "secondary": "#e06236",
			 "accent": "#d7a64b",
			 "neutral": "#304c7a",
			 "base-100": "#f4f5f7",
			 "info": "#3abff8",
			 "success": "#36d399",
			 "warning": "#fbbd23",
			 "error": "#f87272",
          },
        },
      ],
    },
  plugins: [require("daisyui")],
}
export default config
