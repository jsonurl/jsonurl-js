/*
  MIT License

  Copyright (c) 2022 Leonard Crestez, David MacCormack

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

test.each([
  ["e,!e", { AQF: true, impliedArray: [] }, ["e", ""]],
  ["e,false", { AQF: true, impliedArray: [] }, ["e", false]],
  ["!e,e", { AQF: true, impliedArray: [] }, ["", "e"]],
  ["e:!e", { AQF: true, impliedObject: {} }, { e: "" }],
  ["e:false", { AQF: true, impliedObject: {} }, { e: false }],
  ["!e:e", { AQF: true, impliedObject: {} }, { "": "e" }],
  ["e:!e,a:b", { AQF: true, impliedObject: {} }, { e: "", a: "b" }],
  ["(e,!e)", { AQF: true }, ["e", ""]],
  ["(e,false)", { AQF: true }, ["e", false]],
  ["(e:!e)", { AQF: true }, { e: "" }],
  ["(e:false)", { AQF: true }, { e: false }],
])("JsonURL.parse(%p, %p)", (text, options, expected) => {
  expect(JsonURL.parse(text, options)).toStrictEqual(expected);
});
