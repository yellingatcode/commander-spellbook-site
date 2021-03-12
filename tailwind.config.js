module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#C18AFF",
        secondary: "#FF9595",
        dark: "#222222",
        danger: "#FF9595",
        warning: "#FFC580",
      },
    },
    fontSize: {
      // these are opt in breaking changes to be ready for Tailwind v2 when it releases
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["4rem", { lineHeight: "1" }],
    },
  },
  // ...
};
