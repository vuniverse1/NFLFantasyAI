// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/index.tsx"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '1.5rem',
        lg: '2rem'
      },
    },
    extend: {
      backgroundImage: {
        'custom-image': "url('/images/background.JPEG')",
      },
      colors: {
        'neon-green': '#39ff14',
        'black': '#000000',
      },
    },
  },
  plugins: [],
};

export default config;
