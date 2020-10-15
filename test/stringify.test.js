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

//
// JsonURL.stringify tests
//

test("JsonURL.stringify(undefined)", () => {
  expect(JsonURL.stringify(undefined)).toBeUndefined();
});

test.each([
  [true, "true", "true"],
  [false, "false", "false"],
  [null, "null", "null"],
  ["true", "'true'", "true"],
  ["false", "'false'", "false"],
  ["null", "'null'", "null"],
  ["()", "'()'", "%x28%x29"],
  ["{}", "%7B%7D", "%7B%7D"],
  [0, "0", "0"],
  [1.1, "1.1", "1.1"],
  ["a", "a", "a"],
  ["1", "'1'", "1"],
  ["2.3", "'2.3'", "2.3"],
  ["2e1", "'2e1'", "2e1"],
  ["-4", "'-4'", "-4"],
  ["5a", "5a", "5a"],
  ["'1+2'", "%271%2B2'", "'1%2B2'"],
  ["1e+1", "1e%2B1", "1e%2B1"],
  ["a b c", "a+b+c", "a+b+c"],
  ["a,b", "'a,b'", "a%2Cb"],
  ["a,b c", "'a,b+c'", "a%2Cb+c"],
  ["a,b,c", "'a,b,c'", "a%2Cb%2Cc"],
  ["a:b:c", "'a:b:c'", "a%3Ab%3Ac"],
  ["((()))", "'((()))'", "%x28%x28%x28%x29%x29%x29"],
  [":::", "':::'", "%3A%3A%3A"],
  [",,,", "',,,'", "%2C%2C%2C"],
  ["   ", "+++", "+++"],
  ["Bob & Frank", "Bob+%26+Frank", "Bob+%26+Frank"],
  ["'hello", "%27hello", "'hello"],
])("JsonURL.stringify(%p)", (value, expected, expectedISL) => {
  expect(JsonURL.stringify(value)).toBe(expected);

  expect(JsonURL.stringify(value, { impliedStringLiterals: true })).toBe(
    expectedISL
  );
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
  [
    { a: 1, b: 2, c: { d: 4, e: 5 } },
    { wwwFormUrlEncoded: true },
    "a=1&b=2&c=(d:4,e:5)",
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
