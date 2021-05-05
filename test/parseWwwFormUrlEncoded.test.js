/* eslint-disable jest/no-identical-title */
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

function resetOptions(options, implied = true) {
  if (options.impliedArray) {
    options.impliedArray = implied ? [] : undefined;
  }
  if (options.impliedObject) {
    options.impliedObject = implied ? {} : undefined;
  }
}

//
// these cases should work for both implied and non-implied values.
//
test.each([
  ["1&2", { impliedArray: [] }, [1, 2]],
  ["1&2&3", { impliedArray: [] }, [1, 2, 3]],
  ["1&2&(3,4)", { impliedArray: [] }, [1, 2, [3, 4]]],
  ["1&2&(a:b)", { impliedArray: [] }, [1, 2, { a: "b" }]],
  ["1&2&(3,(4))", { impliedArray: [] }, [1, 2, [3, [4]]]],
  ["(1,(2))&3,4", { impliedArray: [] }, [[1, [2]], 3, 4]],
  ["a:b&c:d", { impliedObject: {} }, { a: "b", c: "d" }],
  ["a=b", { impliedObject: {} }, { a: "b" }],
  ["a=b&c=d", { impliedObject: {} }, { a: "b", c: "d" }],
  ["a:b&c=d&e:(f:g)", { impliedObject: {} }, { a: "b", c: "d", e: { f: "g" } }],
  [
    "a&c=d",
    {
      impliedObject: {},
      getMissingValue: (key) => {
        switch (key) {
          case "a":
            return true;
          default:
            return undefined;
        }
      },
    },
    { a: true, c: "d" },
  ],
  [
    "a=b&c",
    {
      impliedObject: {},
      getMissingValue: (key) => {
        switch (key) {
          case "c":
            return true;
          default:
            return undefined;
        }
      },
    },
    { a: "b", c: true },
  ],
])("JsonURL.parse(%p, %p)", (text, options, expected) => {
  const u = new JsonURL();

  //
  // options.wwwFormUrlEncoded = false, so these should all fail.
  //
  expect(() => {
    u.parse(text, options);
  }).toThrow(SyntaxError);

  //
  // options.wwwFormUrlEncoded = true, so this should succeed.
  //
  options.wwwFormUrlEncoded = true;
  resetOptions(options);
  expect(u.parse(text, options)).toEqual(expected);

  //
  // options.AQF = true
  //
  options.AQF = true;
  resetOptions(options);
  expect(u.parse(text, options)).toEqual(expected);

  //
  // options.wwwFormUrlEncoded = true still, just removing the
  // implied value.
  //
  options.AQF = undefined;
  resetOptions(options, false);
  if (options.getMissingValue === undefined) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(u.parse("(" + text + ")", options)).toEqual(expected);
  }
});

//
// these cases should work only for implied.
//
test.each([
  ["&a", { impliedArray: [] }, ["a"]],
  ["a&", { impliedArray: [] }, ["a"]],
  ["&1&2", { impliedArray: [] }, [1, 2]],
  ["1&()&", { impliedArray: [] }, [1, {}]],
  ["a&(1)&", { impliedArray: [] }, ["a", [1]]],
  ["1&&2", { impliedArray: [] }, [1, 2]],
  ["&a:true", { impliedObject: {} }, { a: true }],
  ["a:()&", { impliedObject: {} }, { a: {} }],
  ["a&(1,2)&", { impliedArray: [] }, ["a", [1, 2]]],
  ["a=b&&c:d", { impliedObject: {} }, { a: "b", c: "d" }],
  ["a&(a:b)&", { impliedArray: [] }, ["a", { a: "b" }]],
  [
    "a&&c=d",
    { impliedObject: {}, getMissingValue: (k) => (k === "a" && true) || false },
    { a: true, c: "d" },
  ],
])("JsonURL.parse(%p, %p)", (text, options, expected) => {
  const u = new JsonURL();

  //
  // options.wwwFormUrlEncoded = false, so these should all fail.
  //
  expect(() => {
    u.parse(text, options);
  }).toThrow(SyntaxError);

  options.wwwFormUrlEncoded = true;

  if (options.impliedArray) {
    options.impliedArray = [];
  }
  if (options.impliedObject) {
    options.impliedObject = {};
  }

  //
  // options.wwwFormUrlEncoded = true, so this should succeed.
  //
  expect(u.parse(text, options)).toEqual(expected);
});
