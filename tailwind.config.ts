import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        game: {
          primary: "hsl(var(--game-primary))",
          secondary: "hsl(var(--game-secondary))",
          warning: "hsl(var(--game-warning))",
          success: "hsl(var(--game-success))",
          info: "hsl(var(--game-info))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Design system specific radii
        card: "16px",
        "card-lg": "20px",
        drawer: "24px",
        pill: "999px",
        button: "12px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "bounce-in": {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(200 85% 60% / 0.4)" },
          "50%": { boxShadow: "0 0 0 20px hsl(200 85% 60% / 0)" },
        },
        // Voice state animations
        "voice-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 hsl(var(--primary) / 0.4)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 0 8px hsl(var(--primary) / 0)",
          },
        },
        "voice-waveform": {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "25%": { transform: "scaleY(1)" },
          "50%": { transform: "scaleY(0.6)" },
          "75%": { transform: "scaleY(0.8)" },
        },
        // Micro-interactions
        "micro-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-value, 100%)" },
        },
        // Focus glow for dark mode
        "focus-glow": {
          "0%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.3)" },
          "100%": { boxShadow: "0 0 0 4px hsl(var(--primary) / 0.1)" },
        },
        // Custom keyframes for voice chat animations
        "cloud-float": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)",
          },
          "25%": {
            transform: "translateY(-8px) translateX(4px) rotate(0.5deg)",
          },
          "50%": {
            transform: "translateY(-4px) translateX(-2px) rotate(-0.3deg)",
          },
          "75%": {
            transform: "translateY(-12px) translateX(6px) rotate(0.8deg)",
          },
        },
        "dots-loading": {
          "0%, 80%, 100%": {
            opacity: "0.3",
            transform: "scale(1)",
          },
          "40%": {
            opacity: "1",
            transform: "scale(1.1)",
          },
        },
        "ui-transition-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px) scale(1)",
          },
        },
        "ui-transition-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0px) scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-10px) scale(0.98)",
          },
        },
        "disconnect-fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(15px) scale(0.96)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px) scale(1)",
          },
        },
        "disconnect-fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0px) scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-8px) scale(0.97)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s var(--animation-smooth)",
        "scale-in": "scale-in 0.3s var(--animation-bounce)",
        "bounce-in": "bounce-in 0.6s var(--animation-bounce)",
        "pulse-glow": "pulse-glow 2s infinite",
        // Voice state animations
        "voice-pulse": "voice-pulse 1.5s ease-in-out infinite",
        "voice-waveform": "voice-waveform 0.8s ease-in-out infinite",
        // Micro-interactions (150-250ms ease-out)
        "micro-bounce": "micro-bounce 200ms ease-out",
        "micro-scale": "micro-bounce 150ms ease-out",
        // Progress animations (500-700ms)
        "progress-fill": "progress-fill 600ms var(--animation-smooth)",
        "progress-slow": "progress-fill 700ms var(--animation-smooth)",
        // Focus states
        "focus-glow": "focus-glow 200ms ease-out forwards",
        // Custom animations for voice chat
        "cloud-float": "cloud-float 6s ease-in-out infinite",
        "dots-loading": "dots-loading 1.4s ease-in-out infinite",
        "ui-transition-in":
          "ui-transition-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "ui-transition-out":
          "ui-transition-out 0.4s cubic-bezier(0.7, 0, 0.84, 0)",
        "disconnect-fade-in":
          "disconnect-fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "disconnect-fade-out":
          "disconnect-fade-out 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)",
      },
      // Motion timing functions
      transitionTimingFunction: {
        micro: "cubic-bezier(0.4, 0, 0.2, 1)", // 150-250ms interactions
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)", // General smooth
        gentle: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Calming effect
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Playful bounce
      },
      transitionDuration: {
        micro: "150ms",
        "micro-lg": "200ms",
        "micro-xl": "250ms",
        progress: "600ms",
        "progress-slow": "700ms",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-card": "var(--gradient-card)",
        "gradient-playful": "var(--gradient-playful)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        soft: "var(--shadow-soft)",
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        heading: ["Manrope", "Inter", "system-ui", "sans-serif"],
        replay: ["Replay Pro", "Manrope", "Inter", "system-ui", "sans-serif"],
        "dm-sans": ["DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Typography scale following the design system
        caption: ["13px", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        "caption-lg": ["14px", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        "caption-night": [
          "15px",
          { lineHeight: "1.4", letterSpacing: "0.01em" },
        ], // Minimum 15px for night flows
        body: ["16px", { lineHeight: "1.5", letterSpacing: "0" }],
        h2: ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "h2-lg": ["22px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h1: ["24px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "h1-lg": ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
