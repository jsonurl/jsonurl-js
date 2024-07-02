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
import { JsonURLParseOptions } from "../src/JsonURLParseOptions.js";

test.each([
  "(",
  ")",
  "{",
  "}",
  ",",
  ":",
  "(1",
  "(1,",
  "(a:",
  "(a:b",
  "1,",
  "()a",
  "(1)a",
  "(|",
  "((1)",
  "(1(",
  "((1,2,)",
  "(1,1",
  "(1,a,()",
  "(((1,1(",
  "(((1))",
  "((a:b)",
  "(a:b,'')",
  "((a:b(",
  "(a:b,c)",
  "(a:b,c:)",
  "(a:b,c:,)",
  "(a&b)",
  "(a=b)",
  "'a=b'",
  "'a&b'",
  "(a:)",
  "(:a)",
  "(a,,c)",
])("JsonURL.parse(%p)", (text) => {
  const u = new JsonURL();

  expect(() => {
    u.parse(text);
  }).toThrow(SyntaxError);

  expect(() => {
    JsonURL.parse(text);
  }).toThrow(SyntaxError);

  expect(() => {
    JsonURL.parse(text, { AQF: true });
  }).toThrow(SyntaxError);
});

test.each(["%", "%2", "%2X"])("JsonURL.parse(%p)", (text) => {
  const u = new JsonURL();

  expect(() => {
    u.parse(text);
  }).toThrow(URIError);

  expect(() => {
    JsonURL.parse(text);
  }).toThrow(URIError);
});

test.each([
  ["1,2)", { impliedArray: [] }],
  ["a:b)", { impliedObject: {} }],
  ["((a:b)", { impliedObject: {} }],
  ["(,b)", undefined],
  ["'a&b'", { wwwFormUrlEncoded: true }],
  [
    "a&c=d",
    {
      impliedObject: {},
      wwwFormUrlEncoded: true,
    },
  ],
  ["1%", { AQF: true }],
  ["%4", { AQF: true }],
  ["%4G", { AQF: true }],
  ["!", { AQF: true }],
  ["!.", { AQF: true }],
  ["'hello", undefined],
  ["(a=(b:2&c:3))", { wwwFormUrlEncoded: true }],
  ["(((1&2)))", { wwwFormUrlEncoded: true }],
  ["(((1=2)))", { wwwFormUrlEncoded: true }],
  ["(((1,2,3&4)))", { wwwFormUrlEncoded: true }],
  ["(((a:b,c=d)))", { wwwFormUrlEncoded: true }],
  ["(((a:b,c&d)))", { wwwFormUrlEncoded: true }],
  ["(&b)", { wwwFormUrlEncoded: true }],
])("JsonURL.parse(%p, %p)", (text, options) => {
  const u = new JsonURL();

  expect(() => {
    u.parse(text, options);
  }).toThrow(SyntaxError);
});

test.each(["((((1))))", "(1,2,3,4,5,6)", "(100000,100000,100000)"])(
  "JsonURL.parse(%p, with limits)",
  (text) => {
    //
    // Test Errors
    //
    const options = new JsonURLParseOptions({
      maxParseChars: 15,
      maxParseValues: 5,
      maxParseDepth: 2,
    });

    expect(() => {
      new JsonURL().parse(text, options);
    }).toThrow(Error);

    expect(() => {
      new JsonURL(options).parse(text);
    }).toThrow(Error);

    expect(() => {
      JsonURL.parse(text, options);
    }).toThrow(/ exceeded(\s+at\s+position\s+\d+)?$/);
  }
);

test("JsonURL.parse(string) with raw pizza", () => {
  expect(() => {
    JsonURL.parse("hello\uD83C\uDF55world");
  }).toThrow(/unexpected character/);

  expect(() => {
    JsonURL.parse("hello\uD83C\uDF55world", {
      AQF: true,
    });
  }).toThrow(/unexpected character/);
});
