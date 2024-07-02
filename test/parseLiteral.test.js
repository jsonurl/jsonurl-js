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

import { JsonURL } from "../src/JsonURL.js";

function encodedString(s) {
  return s
    .replace(/'/, "%27")
    .replace(/ /, "+")
    .replace(/\(/, "%28")
    .replace(/\)/, "%29")
    .replace(/,/, "%2C")
    .replace(/:/, "%3A");
}

function escapeStringAQF(s) {
  return s
    .replace(/ /, "+")
    .replace(/!/, "!!")
    .replace(/\(/, "!(")
    .replace(/\)/, "!)")
    .replace(/,/, "!,")
    .replace(/:/, "!:");
}

function runTest(text, value, keyValue, impliedStrValue) {
  expect(u.parseLiteral(text)).toBe(value);
  expect(u.parseLiteral(text, 0, text.length, true)).toBe(keyValue);
  expect(
    u.parseLiteral(text, 0, text.length, true, { impliedStringLiterals: true })
  ).toBe(impliedStrValue);

  //
  // verify that parseLiteral() and parse() return the same thing (as
  // expected for literals).
  //
  expect(u.parse(text)).toBe(value);
  expect(JsonURL.parse(text)).toBe(value);
}

function runTestAQF(text, value, impliedStrValue) {
  expect(u.parse(text, { AQF: true })).toBe(value);
  expect(u.parse(text, { AQF: true, impliedStringLiterals: true })).toBe(
    impliedStrValue
  );
}

//
// instance used for JsonURL.parseLiteral tests
//
const u = new JsonURL();

// eslint-disable-next-line jest/expect-expect
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
  "Hello (world).",
  "Bob's House",
  "Hello, World!",
  "World: Hello!",
])("JsonURL.parseLiteral(%p)", (value) => {
  let keyValue = String(value);
  let text = typeof value === "string" ? encodedString(keyValue) : keyValue;
  runTest(text, value, keyValue, keyValue);

  let textAQF =
    typeof value === "string" ? escapeStringAQF(keyValue) : keyValue;
  runTestAQF(textAQF, value, keyValue);
});

test.each([
  //
  // fixed point
  //
  ["-3e0", -3, undefined, "-3e0"],
  ["1e+2", 1e2, undefined, "1e 2"],
  ["-2e+1", -2e1, undefined, "-2e 1"],
  ["1e-2", 1e-2, undefined, "1e-2"],
  ["1e+2", 1e2, undefined, "1e 2"],

  //
  // floating point
  //
  ["156.911e+2", 156.911e2, undefined, "156.911e 2"],

  //
  // string
  //
  ["'hello'", "hello", "'hello'", "'hello'"],
  ["hello%2Bworld", "hello+world", undefined, undefined],
  ["y+%3D+mx+%2B+b", "y = mx + b", undefined, undefined],
  ["a%3Db%26c%3Dd", "a=b&c=d", undefined, undefined],
  ["hello%F0%9F%8D%95world", "hello\uD83C\uDF55world", undefined, undefined],
  ["-e+", "-e ", undefined, undefined],
  ["-e+1", "-e 1", undefined, undefined],
  ["1e%2B1", "1e+1", "1e+1", "1e+1"],
  ["%26true", "&true", undefined, undefined],
  ["%3Dtrue", "=true", undefined, undefined],
])("JsonURL.parseLiteral(%p)", (text, value, aqfValue, impliedStrValue) => {
  let keyValue = typeof value === "string" ? value : text;
  if (aqfValue === undefined) {
    aqfValue = value;
  }

  runTest(
    text,
    value,
    keyValue,
    impliedStrValue === undefined ? keyValue : impliedStrValue
  );

  expect(u.parse(text, { AQF: true })).toBe(aqfValue);
  expect(u.parse(text, { AQF: true, impliedStringLiterals: true })).toBe(
    impliedStrValue === undefined ? aqfValue : impliedStrValue
  );
});

test("JsonURL.parseLiteral('null')", () => {
  expect(u.parseLiteral("null")).toBe(u.nullValue);
});

test("JsonURL.parseLiteral('null', true)", () => {
  expect(u.parseLiteral("null", 0, 4, true)).toBe("null");
});
