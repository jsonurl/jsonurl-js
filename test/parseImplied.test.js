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

const u = new JsonURL();

function parseAQF(text, options) {
  const myOptions = JSON.parse(JSON.stringify(options));
  myOptions.AQF = true;
  return u.parse(text, myOptions);
}

test.each([
  ["", { impliedArray: [], _impliedOnly: false }, []],
  ["()", { impliedArray: [], _impliedOnly: false }, [{}]],
  ["(1)", { impliedArray: [], _impliedOnly: false }, [[1]]],
  ["", { impliedObject: {} }, {}],
  ["a:()", { impliedObject: {} }, { a: {} }],
  ["a:(1)", { impliedObject: {} }, { a: [1] }],
  ["1,2,3", { impliedArray: [] }, [1, 2, 3]],
  ["1,2,(3,4)", { impliedArray: [] }, [1, 2, [3, 4]]],
  ["1,2,(a:b)", { impliedArray: [] }, [1, 2, { a: "b" }]],
  ["1,2,(3,(4))", { impliedArray: [] }, [1, 2, [3, [4]]]],
  ["(1,(2)),3,4", { impliedArray: [] }, [[1, [2]], 3, 4]],
  ["a:b,c:d", { impliedObject: {} }, { a: "b", c: "d" }],
  ["a:(b:c)", { impliedObject: {} }, { a: { b: "c" } }],
  ["a:(1,2)", { impliedObject: {} }, { a: [1, 2] }],
  ["a:b,c:d,e:(f:g)", { impliedObject: {} }, { a: "b", c: "d", e: { f: "g" } }],
  [
    "a:(b:(c:(d))),e:f",
    { impliedObject: {} },
    { a: { b: { c: ["d"] } }, e: "f" },
  ],
])("JsonURL.parse(%p, %p)", (text, options, expected) => {
  if (options._impliedOnly !== false) {
    expect(() => {
      u.parse(text);
      u.parse(text, { AQF: true });
    }).toThrow(SyntaxError);
  }
  expect(parseAQF(text, options)).toEqual(expected);
});
