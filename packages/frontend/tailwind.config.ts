import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryGreen: '#4CAF50',
        secondaryGreen: '#66BB6A',
        lightGray: '#F4F4F4',
        darkText: '#2E2E2E',
        accentOrange: '#FFB74D',
        accentBlue: '#4FC3F7',
      }
    },
  },
  plugins: [],
};
export default config;
