import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: "src/screenplayTools.js", // Aggregation file as the entry point
  // Bundle fast-xml-parser into both outputs, so neither needs it installed or loaded separately.
  plugins: [nodeResolve({ browser: true })],
  output: [
    {
      file: "dist/screenplayTools.js",
      format: "esm", // ES Module format
      sourcemap: true,
    },
    {
      file: "dist/screenplayTools.min.js",
      format: "iife",
      name: "ScreenplayTools",
      plugins: [terser()],
      sourcemap: true,
    },
  ],
};
