/*
  MIT License

  Copyright (c) 2020 David MacCormack

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { eslint } from "rollup-plugin-eslint";
import pkg from "./package.json";

const banner =
  "/*!\n" +
  ` * jsonurl.js v${pkg.version}\n` +
  ` * (c) ${new Date().getFullYear()} David MacCormack\n` +
  " * Released under the MIT License.\n" +
  " */";

//
// https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
//
const babelBundle = {
  babelHelpers: "bundled",
};

export default [
  {
    input: "src/index.js",
    output: [
      {
        name: pkg.moduleName,
        file: "dist/jsonurl.js",
        format: "umd",
      },
    ],
    plugins: [eslint(), babel(babelBundle)],
  },
  {
    input: "src/index.js",
    output: [
      {
        name: pkg.moduleName,
        file: pkg.browser,
        format: "umd",
        banner: banner,
      },
    ],
    plugins: [eslint(), babel(babelBundle), terser()],
  },
  //
  // this covers both ESM and CJS
  // https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
  //
  {
    input: "src/index.js",
    output: [
      {
        name: pkg.moduleName,
        file: pkg.main,
        format: "cjs",
        exports: "default",
      },
    ],
    plugins: [eslint(), babel(babelBundle)],
  },
];
