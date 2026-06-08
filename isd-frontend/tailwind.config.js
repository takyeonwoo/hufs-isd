/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#7C3AED",
        "accent-soft": "#EDE9FE",
        "border-soft": "#EDEEF1",
        "fg-inverse": "#FFFFFF",
        "fg-muted": "#888888",
        "fg-primary": "#1A1A1A",
        "fg-secondary": "#666666",
        "status-available": "#22A06B",
        "status-falling": "#8A8A8A",
        "status-hot": "#FF3D3D",
        "status-low": "#F5A524",
        "status-rising": "#7C3AED",
        "status-soldout": "#9CA3AF",
        "surface-inverse": "#0A0A0A",
        "surface-primary": "#FFFFFF",
        "surface-secondary": "#F7F8FA",
        "surface-warm": "#F5F1FF",
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Funnel Sans"', 'Inter', 'sans-serif'],
        data: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
      },
      maxWidth: {
        canvas: "1440px",
      },
    },
  },
  plugins: [],
};
