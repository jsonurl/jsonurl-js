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

import JsonURL from "./JsonURL.js";

//
// Test Errors
//
const u = new JsonURL({
  maxParseChars: 10,
  maxParseValues: 5,
  maxParseDepth: 3,
});

test.each(["(", ")", "{", "}", ",", ":", "(1", "(1,", "(a:", "{a:}"])(
  "JsonURL.parse(%p)",
  (text) => {
    expect(() => {
      u.parse(text);
    }).toThrow(SyntaxError);
  }
);

test.each(["((((1))))", "(1,2,3,4,5)"])("JsonURL.parse(%p)", (text) => {
  expect(() => {
    u.parse(text);
  }).toThrow(Error);

  expect(() => {
    u.parse(text);
  }).toThrow(/ exceeded(\s+at\s+position\s+\d+)?$/);
});
