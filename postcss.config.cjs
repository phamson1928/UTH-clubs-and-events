module.exports = {
  plugins: [
    // resolve CSS imports before Tailwind runs
    require("postcss-import"),
    require("tailwindcss"),
    require("autoprefixer"),
  ],
};
