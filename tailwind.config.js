/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // indigo-600
          dark: '#4338ca', // indigo-700
        },
        accent: {
          DEFAULT: '#38bdf8', // sky-400
        },
        success: {
          DEFAULT: '#10b981', // emerald-500
        },
        warning: {
          DEFAULT: '#f59e42', // amber-400
        },
        error: {
          DEFAULT: '#f43f5e', // rose-500
        },
        background: {
          DEFAULT: '#f9fafb', // gray-50
          surface: '#f3f4f6', // gray-100
        },
        text: {
          primary: '#111827', // gray-900
          secondary: '#4b5563', // gray-600
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem', // rounded-lg
      },
      boxShadow: {
        DEFAULT: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)', // shadow-md
      },
    },
  },
  plugins: [],
};
