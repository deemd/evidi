/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        "background": "var(--background)",
        "foreground": "var(--foreground)",
        "border": "var(--border)",
        "destructive": "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",

        "primary": "var(--primary)",
        "secondary": "var(--secondary)",
        "ternary": "var(--ternary)",
        "link": "var(--link)",

        "button-background": "var(--button-background)",
        "button-border": "var(--button-border)",
        "button-hover": "var(--button-hover)",
        "button-text": "var(--button-text)",

        "button-secondary-background": "var(--button-secondary-background)",
        "button-secondary-border": "var(--button-secondary-border)",
        "button-secondary-hover": "var(--button-secondary-hover)",
        "button-secondary-text": "var(--button-secondary-text)",

        "checkbox-background": "var(--checkbox-background)",
        "checkbox-foreground": "var(--checkbox-foreground)",
        "checkbox-border": "var(--checkbox-border)",
        "checkbox-checkmark": "var(--checkbox-checkmark)",
        
        "toggle-background": "var(--toggle-background)",
        "toggle-background-unchecked": "var(--toggle-background-unchecked)",
        "toggle-foreground": "var(--toggle-foreground)",  

        "tabs-background": "var(--tabs-background)",
        "tabs-foreground": "var(--tabs-foreground)",
        "tabs-text": "var(--tabs-text)",

        "card-background": "var(--card-background)",
        "card-foreground": "var(--card-foreground)",
        "card-border": "var(--card-border)",
        "card-text": "var(--card-text)",
        "card-bar": "var(--card-bar)",
        "card-bar-background": "var(--card-bar-background)",
        "card-badge": "var(--card-badge)",
        "card-badge-highlight": "var(--card-badge-highlight)",
        
        "input-background": "var(--input-background)",
        "input-text": "var(--input-text)",
        "input-border": "var(--input-border)",

        // background: "var(--background)",
        // foreground: "var(--foreground)",
        // muted: "var(--muted))",
        // "muted-foreground": "var(--muted-foreground)",
        // popover: "var(--popover)",
        // "popover-foreground": "var(--popover-foreground)",
        // card: "var(--card)",
        // "card-foreground": "var(--card-foreground)",
        // border: "var(--border)",
        // input: "var(--input)",
        // ring: "var(--ring)",
        // primary: "var(--primary)",
        // "primary-foreground": "var(--primary-foreground)",
        // secondary: "var(--secondary)",
        // "secondary-foreground": "var(--secondary-foreground)",
        // accent: "var(--accent)",
        // "accent-foreground": "var(--accent-foreground)",
        // destructive: "var(--destructive)",
        // "destructive-foreground": "var(--destructive-foreground)",
      },
    },
  },
  plugins: [],
};