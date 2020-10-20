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
  "'hello",
  "(a:)",
  "(:a)",
  "(a,,c)",
])("JsonURL.parse(%p)", (text) => {
  const u = new JsonURL();

  expect(() => {
    u.parse(text);
  }).toThrow(SyntaxError);
});

test.each([
  ["1,2)", { impliedArray: [] }],
  ["a:b)", { impliedObject: {} }],
  ["((a:b)", { impliedObject: {} }],
  ["(&b)", { wwwFormUrlEncoded: true }],
  ["'a&b'", { wwwFormUrlEncoded: true }],
])("JsonURL.parse(%p, %p)", (text, options) => {
  const u = new JsonURL();

  expect(() => {
    u.parse(text, options);
  }).toThrow(SyntaxError);
});

test.each(["((((1))))", "(1,2,3,4,5,6)", "(100000,100000,100000)"])(
  "JsonURL.parse(%p)",
  (text) => {
    //
    // Test Errors
    //
    const u = new JsonURL({
      maxParseChars: 15,
      maxParseValues: 5,
      maxParseDepth: 2,
    });

    expect(() => {
      u.parse(text);
    }).toThrow(Error);

    expect(() => {
      u.parse(text);
    }).toThrow(/ exceeded(\s+at\s+position\s+\d+)?$/);
  }
);
