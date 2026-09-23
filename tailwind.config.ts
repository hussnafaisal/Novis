import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { velvet:"#000000", panel:"#121212", gold:"#F59E0B" },
    fontFamily: { luxury:["Georgia","Cambria","Times New Roman","serif"], finance:["ui-monospace","SFMono-Regular","Menlo","Monaco","Consolas","monospace"] }
  }},
  plugins: []
} satisfies Config;
