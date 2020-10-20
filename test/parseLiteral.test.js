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

import JsonURL from "../src/JsonURL.js";

function encodedString(s) {
  return s
    .replace(/'/, "%27")
    .replace(/ /, "+")
    .replace(/\(/, "%28")
    .replace(/\)/, "%29")
    .replace(/,/, "%2C")
    .replace(/:/, "%3A");
}

function runTest(text, value, keyValue, strLitValue) {
  expect(u.parseLiteral(text)).toBe(value);
  expect(u.parseLiteral(text, 0, text.length, true)).toBe(keyValue);
  expect(
    u.parseLiteral(text, 0, text.length, true, { impliedStringLiterals: true })
  ).toBe(strLitValue);

  //
  // verify that parseLiteral() and parse() return the same thing (as
  // expected for literals).
  //
  expect(u.parse(text)).toBe(value);
}

//
// JsonURL.parseLiteral tests
//
const u = new JsonURL();

test.each([
  //
  // boolean
  //
  true,
  false,

  //
  // fixed point
  //
  0,
  1,
  -3,
  1e2,
  123456,
  -123456,
  12345678905432132,
  -12345678905432132,
  4e17,

  //
  // floating point
  //
  0.1,
  2.0,
  -3.14159,
  -1.1,
  1e-2,
  -2e-1,
  1.9e2,
  -2.8e1,
  156.9e-2,
  -276.8e-1,
  156.911e2,
  -276.833e4,

  //
  // string
  //,
  "hello",
  "a",
  "1a",
  "1e",
  "1.",
  "f",
  "fa",
  "fal",
  "fals",
  "n",
  "nu",
  "nul",
  "t",
  "tr",
  "tru",
  "-",
  "-e",
  "-.",
  "1.2.3",
  "hello, world",
  "Bob's House",
  "Hello, World!",
  "World: Hello!",
  "Hello (world).",
])("JsonURL.parseLiteral(%p)", (value) => {
  let keyValue = String(value);
  let text = typeof value === "string" ? encodedString(keyValue) : keyValue;
  runTest(text, value, keyValue, keyValue);
});

test.each([
  //
  // fixed point
  //
  ["-3e0", -3, "-3e0"],
  ["1e+2", 1e2, "1e 2"],
  ["-2e+1", -2e1, "-2e 1"],

  //
  // floating point
  //
  ["156.911e+2", 156.911e2, "156.911e 2"],

  //
  // string
  //
  ["'hello'", "hello", "'hello'", undefined],
  ["hello%2Bworld", "hello+world", undefined],
  ["y+%3D+mx+%2B+b", "y = mx + b", undefined],
  ["a%3Db%26c%3Dd", "a=b&c=d", undefined],
  ["hello%F0%9F%8D%95world", "hello\uD83C\uDF55world", undefined],
  ["-e+", "-e ", undefined],
  ["-e+1", "-e 1", undefined],
  ["1e%2B1", "1e+1", undefined],
])("JsonURL.parseLiteral(%p)", (text, value, strLitValue) => {
  let keyValue = typeof value === "string" ? value : text;
  if (strLitValue === undefined) {
    strLitValue = value;
  }
  runTest(text, value, keyValue, strLitValue);
});

test("JsonURL.parseLiteral('null')", () => {
  expect(u.parseLiteral("null")).toBe(u.nullValue);
});

test("JsonURL.parseLiteral('null', true)", () => {
  expect(u.parseLiteral("null", 0, 4, true)).toBe("null");
});
