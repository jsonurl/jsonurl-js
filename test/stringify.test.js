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

//
// JsonURL.stringify tests
//

test("JsonURL.stringify(undefined)", () => {
  expect(JsonURL.stringify(undefined)).toBeUndefined();
});

test("JsonURL.stringify(null, impliedStringLiterals)", () => {
  expect(() => {
    JsonURL.stringify(null, { impliedStringLiterals: true });
  }).toThrow(SyntaxError);
});

test("JsonURL.stringify(null, AQF)", () => {
  expect(JsonURL.stringify(null, { AQF: true })).toBe("null");
});

test("JsonURL.stringify(empty string, AQF)", () => {
  expect(JsonURL.stringify("", { AQF: true })).toBe("!e");
});

test("JsonURL.stringify(null, coerce+impliedString)", () => {
  expect(
    JsonURL.stringify(null, {
      coerceNullToEmptyString: true,
      impliedStringLiterals: true,
    })
  ).toBe("");
});

test("JsonURL.stringify('', impliedStringLiterals)", () => {
  expect(() => {
    JsonURL.stringify("", {
      impliedStringLiterals: true,
      allowEmptyUnquotedValues: false,
    });
  }).toThrow(SyntaxError);
});

test.each([
  [true, "true", undefined, undefined],
  [false, "false", undefined, undefined],
  [{}, "()", undefined, undefined],
  [[], "()", undefined, undefined],
  ["true", "'true'", "true", "!true"],
  ["false", "'false'", "false", "!false"],
  ["null", "'null'", "null", "!null"],
  ["()", "'()'", "%28%29", "!(!)"],
  ["{}", "%7B%7D", undefined, undefined],
  [0, "0", undefined, undefined],
  [1.1, "1.1", undefined, undefined],
  ["a", undefined, undefined, undefined],
  ["1", "'1'", "1", "!1"],
  ["2.3", "'2.3'", "2.3", "!2.3"],
  ["2e1", "'2e1'", "2e1", "!2e1"],
  ["-4", "'-4'", "-4", "!-4"],
  ["5a", undefined, undefined, undefined],
  ["'1+2'", "%271%2B2'", "'1%2B2'", undefined],
  ["1e+1", "1e%2B1", undefined, "1e!+1"],
  ["a b c", "a+b+c", undefined, undefined],
  ["a,b", "'a,b'", "a%2Cb", "a!,b"],
  ["a,b c", "'a,b+c'", "a%2Cb+c", "a!,b+c"],
  ["a,b,c", "'a,b,c'", "a%2Cb%2Cc", "a!,b!,c"],
  ["a:b:c", "'a:b:c'", "a%3Ab%3Ac", "a!:b!:c"],
  ["((()))", "'((()))'", "%28%28%28%29%29%29", "!(!(!(!)!)!)"],
  [":::", "':::'", "%3A%3A%3A", "!:!:!:"],
  [",,,", "',,,'", "%2C%2C%2C", "!,!,!,"],
  ["   ", "+++", undefined, undefined],
  ["Bob & Frank", "Bob+%26+Frank", undefined, undefined],
  ["'hello", "%27hello", "'hello", undefined],
  [1e5, "100000", undefined, undefined],
])("JsonURL.stringify(%p)", (value, expected, expectedISL, expectedAQF) => {
  expected = expected || value;
  expectedISL = expectedISL || expected;
  expectedAQF = expectedAQF || expectedISL;

  expect(JsonURL.stringify(value)).toBe(expected);

  expect(JsonURL.stringify(value, { impliedStringLiterals: true })).toBe(
    expectedISL
  );

  expect(JsonURL.stringify(value, { AQF: true })).toBe(expectedAQF);
});

test.each([
  [[undefined], {}, "null"],
  [[undefined], { ignoreUndefinedArrayMembers: true }, ""],
  [[null], { ignoreNullArrayMembers: true }, ""],
  [[1, 2, 3, [4, 5]], { wwwFormUrlEncoded: true }, "1&2&3&(4,5)"],
  [{ a: undefined }, { ignoreUndefinedObjectMembers: true }, ""],
  [{ a: undefined, b: 1 }, { ignoreUndefinedObjectMembers: true }, "b:1"],
  [{ a: null, b: 1 }, { ignoreNullObjectMembers: true }, "b:1"],
  [
    { a: undefined, b: 1 },
    { ignoreUndefinedObjectMembers: false },
    "a:null,b:1",
  ],
  [{ "": "a", b: 1 }, { allowEmptyUnquotedKeys: true }, ":a,b:1"],
  [{ a: "", b: 1 }, { allowEmptyUnquotedValues: true }, "a:,b:1"],
  [["a", "", "b"], { allowEmptyUnquotedValues: true }, "a,,b"],
  [
    { a: "", "": "d", e: "f" },
    { allowEmptyUnquotedKeys: true, allowEmptyUnquotedValues: true },
    "a:,:d,e:f",
  ],
  [
    { a: "", b: "1", c: "false", d: "true" },
    { impliedStringLiterals: true },
    "a:,b:1,c:false,d:true",
  ],
  [["a", "", "b"], { impliedStringLiterals: true }, "a,,b"],
  [
    { a: 1, b: 2, c: { d: 4, e: 5 } },
    { wwwFormUrlEncoded: true },
    "a=1&b=2&c=(d:4,e:5)",
  ],
  [["a", null, "b"], { coerceNullToEmptyString: true }, "a,'',b"],
  [
    ["a", null, "b"],
    { coerceNullToEmptyString: true, allowEmptyUnquotedValues: true },
    "a,,b",
  ],
])("JsonURL.stringify(%p, %p)", (value, options, expected) => {
  expect(JsonURL.stringify(value, options)).toBe("(" + expected + ")");

  options.isImplied = true;
  expect(JsonURL.stringify(value, options)).toBe(expected);
});

const nestedHelloWorldFunc = function () {
  return function () {
    return "Hello, World!";
  };
};

test("JsonURL.stringify(array with function)", () => {
  expect(JsonURL.stringify([nestedHelloWorldFunc])).toBe("()");

  expect(
    JsonURL.stringify([nestedHelloWorldFunc], { callFunctions: true })
  ).toBe("('Hello,+World!')");
});

test("JsonURL.stringify(object with function)", () => {
  expect(JsonURL.stringify({ fun: nestedHelloWorldFunc })).toBe("()");

  expect(
    JsonURL.stringify({ fun: nestedHelloWorldFunc }, { callFunctions: true })
  ).toBe("(fun:'Hello,+World!')");
});
