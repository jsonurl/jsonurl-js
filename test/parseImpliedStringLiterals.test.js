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
  ["()", u.emptyValue],
  [
    "(true:true,false:false,null:null,empty:(),single:(0),nested:((1)),many:(-1,2.0,3e1,4e-2,5e+0))",
    {
      true: "true",
      false: "false",
      null: "null",
      empty: {},
      single: ["0"],
      nested: [["1"]],
      many: ["-1", "2.0", "3e1", "4e-2", "5e 0"],
    },
  ],
  ["(1)", ["1"]],
  ["(1,(2))", ["1", ["2"]]],
  ["(1,(a:2),3)", ["1", { a: "2" }, "3"]],
  [
    "(age:64,name:(first:Fred))",
    {
      age: "64",
      name: { first: "Fred" },
    },
  ],
  ["(null,null)", ["null", "null"]],
  ["(a:b,c:d,e:f)", { a: "b", c: "d", e: "f" }],
  ["1e%2B1", "1e+1"],
  ["'Hello,+(World)!'", "'Hello, (World)!'"],
  ["Bob's+house", "Bob's house"],
  ["('Hello,+(World)!')", ["'Hello, (World)!'"]],
  ["('','')", ["''", "''"]],
  ["('qkey':g)", { "'qkey'": "g" }],
])("JsonURL.parse(%s)", (text, expected) => {
  expect(u.parse(text, { impliedStringLiterals: true })).toEqual(expected);

  //
  // verify that stringify returns the same content as the
  // original text.
  //
  // expect(JsonURL.stringify(expected)).toBe(
  //   text
  //     .replace("3e1", "30")
  //     .replace("2.0", "2")
  //     .replace("4e-2", "0.04")
  //     .replace("5e+0", "5")
  //     .replace("'qkey'", "qkey")
  // );
});
