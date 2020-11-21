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

const u = new JsonURL();

test.each([
  ["()", { noEmptyComposite: true }, []],
  ["(:)", { noEmptyComposite: true }, {}],
  ["('':'')", { noEmptyComposite: true }, { "": "" }],
  [
    "('':)",
    { noEmptyComposite: true, allowEmptyUnquotedValues: true },
    { "": "" },
  ],
  [
    "(:'')",
    { noEmptyComposite: true, allowEmptyUnquotedKeys: true },
    { "": "" },
  ],
  [
    "(:)",
    {
      noEmptyComposite: true,
      allowEmptyUnquotedValues: true,
      allowEmptyUnquotedKeys: true,
    },
    {},
  ],
  [
    "(a:b,:)",
    {
      noEmptyComposite: true,
      allowEmptyUnquotedValues: true,
      allowEmptyUnquotedKeys: true,
    },
    { a: "b", "": "" },
  ],
  [
    "a:(:),b:()",
    { noEmptyComposite: true, impliedObject: {} },
    { a: {}, b: [] },
  ],
  ["(:)", { noEmptyComposite: true, impliedArray: [] }, [{}]],
  ["()", { noEmptyComposite: true, impliedArray: [] }, [[]]],
  ["(:),()", { noEmptyComposite: true, impliedArray: [] }, [{}, []]],
  ["(),(:)", { noEmptyComposite: true, impliedArray: [] }, [[], {}]],
])("JsonURL.parse(%s)", (text, options, expected) => {
  const parseOptions = JSON.parse(JSON.stringify(options));
  const actual = u.parse(text, parseOptions);
  expect(actual).toEqual(expected);

  let stringifyOptions = JSON.parse(JSON.stringify(options));
  if (options.impliedArray || options.impliedObject) {
    stringifyOptions.isImplied = true;
  }
  expect(JsonURL.stringify(actual, stringifyOptions)).toEqual(text);
});
