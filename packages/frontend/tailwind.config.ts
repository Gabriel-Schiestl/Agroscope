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
        lightGray: '#F0F4F8',
        mediumGray: '#BCBCBE',
        lightGreen: '#2E7D32',
        darkGray: '#424242',
      },
      fontSize: {
        h1: '2.25rem', // 36px
        h2: '1.875rem', // 30px
        h3: '1.5rem', // 24px
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
