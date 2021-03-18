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

function parseAQF(text, options) {
  const myOptions = JSON.parse(JSON.stringify(options));
  myOptions.AQF = true;
  return u.parse(text, myOptions);
}

//
// these work with both the base and AQF syntax
//
test.each([
  ["()", u.emptyValue],
  [
    "(true:true,false:false,null:null,empty:(),single:(0),nested:((1)),many:(-1,2.0,3e1,4e-2,5e0))",
    {
      true: true,
      false: false,
      null: null,
      empty: {},
      single: [0],
      nested: [[1]],
      many: [-1, 2.0, 3e1, 4e-2, 5],
    },
  ],
  ["(1)", [1]],
  ["(1,(2))", [1, [2]]],
  ["(1,(a:2),3)", [1, { a: 2 }, 3]],
  [
    "(age:64,name:(first:Fred))",
    {
      age: 64,
      name: { first: "Fred" },
    },
  ],
  ["(null,null)", [null, null]],
  ["(a:b,c:d,e:f)", { a: "b", c: "d", e: "f" }],
  ["Bob's+house", "Bob's house"],
])("JsonURL.parse(%s)", (text, expected) => {
  expect(u.parse(text)).toEqual(expected);
  expect(JsonURL.parse(text)).toEqual(expected);
  expect(JsonURL.parse(text, 0)).toEqual(expected);
  expect(JsonURL.parse(text, 0, text.length)).toEqual(expected);

  expect(u.parse(text, { AQF: true })).toEqual(expected);
  expect(JsonURL.parse(text, { AQF: true })).toEqual(expected);

  //
  // verify that stringify returns the same content as the
  // original text.
  //
  expect(JsonURL.stringify(expected)).toBe(
    text
      .replace("3e1", "30")
      .replace("2.0", "2")
      .replace("4e-2", "0.04")
      .replace("5e0", "5")
      .replace("'qkey'", "qkey")
  );
});

//
// these tests are specific to the base syntax
//
test.each([
  ["'Hello,+(World)!'", "Hello, (World)!"],
  ["('Hello,+(World)!')", ["Hello, (World)!"]],
  ["('','')", ["", ""]],
  ["('qkey':g)", { qkey: "g" }],
  ["1e%2B1", "1e+1"],
])("JsonURL.parse(%s)", (text, expected) => {
  expect(u.parse(text)).toEqual(expected);
  expect(JsonURL.parse(text)).toEqual(expected);

  //
  // verify that stringify returns the same content as the
  // original text.
  //
  expect(JsonURL.stringify(expected)).toBe(text.replace("'qkey'", "qkey"));
});

//
// these tests are specific to the AQF syntax
//
test.each([
  ["'Hello!,+!(World!)!!'", "'Hello, (World)!'"],
  ["('Hello!,+!(World!)!!')", ["'Hello, (World)!'"]],
  ["(!e,!e)", ["", ""]],
  ["(!e:g)", { "": "g" }],
  ["1e%2B1", 10],
  ["%48%45%4C%4C%4F%21,+%57%4F%52%4C%44!!", "HELLO, WORLD!"],
  ["%28%61%3A%62%2C%63%3A%64%29", { a: "b", c: "d" }],
  ["%28%61%2C%62%2C%63%2c%64%29", ["a", "b", "c", "d"]],
])("JsonURL.parse(%s)", (text, expected) => {
  expect(u.parse(text, { AQF: true })).toEqual(expected);
  expect(JsonURL.parse(text, { AQF: true })).toEqual(expected);
});

//
// parse with options
//
test.each([
  ["(a,,c)", { allowEmptyUnquotedValues: true }, ["a", "", "c"]],
  ["(a,null,c)", { coerceNullToEmptyString: true }, ["a", "", "c"]],
  [
    "(a:,:d,e:f)",
    { allowEmptyUnquotedKeys: true, allowEmptyUnquotedValues: true },
    { a: "", "": "d", e: "f" },
  ],
  [
    "(a:null,null:d,e:f)",
    { coerceNullToEmptyString: true },
    { a: "", null: "d", e: "f" },
  ],
])("JsonURL.parse(%s)", (text, options, expected) => {
  expect(u.parse(text, options)).toEqual(expected);
  expect(parseAQF(text, options)).toEqual(expected);
});

test.each([undefined])("JsonURL.parse(%p)", (text) => {
  expect(u.parse(text)).toBeUndefined();
  expect(JsonURL.parse(text)).toBeUndefined();

  expect(u.parse(text, { AQF: true })).toBeUndefined();
  expect(JsonURL.parse(text, { AQF: true })).toBeUndefined();
});

test.each(["null", null])("JsonURL.parse(%p)", (text) => {
  expect(u.parse(text)).toBeNull();
  expect(JsonURL.parse(text)).toBeNull();
  expect(u.parse(text, { AQF: true })).toBeNull();
  expect(JsonURL.parse(text, { AQF: true })).toBeNull();
});

test.each([
  ["%40%41%42%43%44%45%46%47%48%49%4A%4B%4C%4D%4E%4F", "@ABCDEFGHIJKLMNO"],
])("JsonURL.parse(%p)", (text, expected) => {
  expect(u.parse(text)).toBe(expected);
  expect(JsonURL.parse(text)).toBe(expected);
  expect(u.parse(text, { AQF: true })).toBe(expected);
  expect(JsonURL.parse(text, { AQF: true })).toBe(expected);
});

test("JsonURL.parse('()') with prop.emptyValue function", () => {
  //
  // test that prop.emptyValue can be a function
  //
  const f = function () {
    return { empty: true };
  };

  const jup = new JsonURL({ emptyValue: f });

  expect(jup.parse("()")).toEqual({ empty: true });
  expect(JsonURL.parse("()", { emptyValue: f })).toEqual({ empty: true });

  expect(jup.parse("()", { AQF: true })).toEqual({ empty: true });
  expect(JsonURL.parse("()", { AQF: true, emptyValue: f })).toEqual({
    empty: true,
  });
});

test("JsonURL.parse(null) with nullValue function", () => {
  //
  // test that prop.nullValue can be a function
  //
  const makeNull = function () {
    return { null: true };
  };

  const jup = new JsonURL({ nullValue: makeNull });

  expect(jup.parse("null")).toEqual(makeNull());
  expect(JsonURL.parse("null", { nullValue: makeNull })).toEqual(makeNull());

  expect(jup.parse("null", { AQF: true })).toEqual(makeNull());
  expect(JsonURL.parse("null", { AQF: true, nullValue: makeNull })).toEqual(
    makeNull()
  );
});

test("JsonURL.parse(null) with custom null value", () => {
  const NullValue = "NullValue";
  const options = () => {
    return {
      nullValue: NullValue,
    };
  };

  const jup = new JsonURL(options);

  //
  // test that prop can be a function
  //
  expect(jup.parse("null")).toBe(NullValue);
  expect(JsonURL.parse("null", options)).toBe(NullValue);

  expect(jup.parse("null", { AQF: true })).toBe(NullValue);
  expect(JsonURL.parse("null", { AQF: true, nullValue: NullValue })).toBe(
    NullValue
  );
});
