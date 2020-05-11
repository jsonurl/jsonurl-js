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

import JsonURL from "./main.js";

//
// JsonURL.stringify tests
//
(function () {
  "use strict";

  const STRINGIFY_STRING_TESTS = {
    true: "'true'",
    false: "'false'",
    null: "'null'",
    a: "a",
    "1": "'1'",
    "2.3": "'2.3'",
    "2e1": "'2e1'",
    "-4": "'-4'",
    "5a": "5a",
  };

  test("JsonURL.stringify(null)", () => {
    expect(JsonURL.stringify(null)).toBe("null");
  });

  test("JsonURL.stringify(undefined)", () => {
    expect(JsonURL.stringify(undefined)).toBeUndefined();
  });

  for (let [key, value] of Object.entries(STRINGIFY_STRING_TESTS)) {
    test(`JsonURL.stringify(${key})`, () => {
      expect(JsonURL.stringify(key)).toBe(value);
    });
  }
})();

const PARSE_LITERAL_SIMPLE = [
  //
  // boolean
  //
  true,
  false,

  //
  // fixed point
  //
  0,
  1,
  -3,
  1e2,
  123456,
  -123456,
  12345678905432132,
  -12345678905432132,
  4e17,

  //
  // floating point
  //
  0.1,
  2.0,
  -3.14159,
  -1.1,
  1e-2,
  -2e-1,
  1.9e2,
  -2.8e1,
  156.9e-2,
  -276.8e-1,
  156.911e2,
  -276.833e4,

  //
  // string
  //,
  "hello",
  "a",
  "1a",
  "1e",
  "1.",
  "fals",
  "-",
  "-e",
  "-.",
  "1.2.3",
  "hello, world",
  "Bob's House",
  "Hello, World!",
  "World: Hello!",
  "Hello (world).",
];

const PARSE_LITERAL_COMPLEX = {
  //
  // fixed point
  //
  "-3e0": { value: -3, string: "-3e0" },
  "1e+2": { value: 1e2, string: "1e+2" },
  "-2e+1": { value: -2e1, string: "-2e+1" },

  //
  // floating point
  //
  "156.911e+2": { value: 156.911e2, string: "156.911e+2" },

  //
  // string
  //
  "'hello'": "hello",
  "hello%2Bworld": "hello+world",
  "y+%3D+mx+%2B+b": "y = mx + b",
  "a%3Db%26c%3Dd": "a=b&c=d",
  "hello%F0%9F%8D%95world": "hello\uD83C\uDF55world",
  "-e+": "-e ",
  "-e+1": "-e 1",
  "1e%2B1": "1e+1",
};

//
// PARSE_LITERAL_TESTS above is designed for the convenience of the author.
// Fix it to be ready for running test cases.
//
(function () {
  "use strict";
  for (let [key, testCase] of Object.entries(PARSE_LITERAL_COMPLEX)) {
    const newValue = {};

    if (testCase === undefined) {
      newValue.value = key;
      newValue.string = key;
    } else if (typeof testCase === "function") {
      let x = testCase(key);
      newValue.value = x;
      newValue.string = String(x);
    } else if (typeof testCase !== "object") {
      newValue.value = testCase;
      newValue.string = String(testCase);
    } else if ("string" in testCase) {
      //
      // testcase already good to go
      //
      continue;
    } else if ("value" in testCase) {
      //
      // construct "string"
      //
      newValue.value = testCase.value;
      newValue.string = String(testCase.value);
    } else {
      console.error("testCase is missing 'value': %s", key);
    }

    PARSE_LITERAL_COMPLEX[key] = newValue;
  }

  function encodedString(s) {
    return s
      .replace(/'/, "%27")
      .replace(/ /, "+")
      .replace(/\(/, "%28")
      .replace(/\)/, "%29")
      .replace(/,/, "%2C")
      .replace(/:/, "%3A");
  }

  PARSE_LITERAL_SIMPLE.forEach((x) => {
    if (typeof x === "number" || typeof x === "boolean") {
      let strval = String(x);

      const newValue = {
        value: x,
        string: strval,
      };
      PARSE_LITERAL_COMPLEX[strval] = newValue;
    } else if (typeof x === "string") {
      const newValue = {
        value: x,
        string: String(x),
      };
      PARSE_LITERAL_COMPLEX[encodedString(x)] = newValue;
    } else {
      console.error("testCase is missing 'value': %s", x);
    }
  });
})();

//
// JsonURL.parseLiteral tests
//
(function () {
  "use strict";

  const u = new JsonURL();

  test("JsonURL.parseLiteral(null)", () => {
    expect(u.parseLiteral("null")).toBe(u.nullValue);
  });

  for (let [key, testCase] of Object.entries(PARSE_LITERAL_COMPLEX)) {
    test(`JsonURL.parseLiteral('${key}')`, () => {
      expect(u.parseLiteral(key)).toBe(testCase.value);
      expect(u.parseLiteral(key, 0, key.length, true)).toBe(testCase.string);
    });
  }
})();

//
// JsonURL.parse tests
//
(function () {
  "use strict";

  test("JsonURL.parse()", () => {
    expect(u.parse("")).toBeUndefined();
  });

  const u = new JsonURL();

  const PARSE_TESTS = {
    "()": u.emptyValue,
    "(true:true,false:false,null:null,empty:(),single:(0),nested:((1)),many:(-1,2.0,3e1,4e-2,5e+0))": {
      true: true,
      false: false,
      null: null,
      empty: {},
      single: [0],
      nested: [[1]],
      many: [-1, 2.0, 3e1, 4e-2, 5],
    },
    "(1)": [1],
    "(1,(2))": [1, [2]],
    "(1,(a:2),3)": [1, { a: 2 }, 3],
    "(age:64,name:(first:Fred))": {
      age: 64,
      name: { first: "Fred" },
    },
    "(null,null)": [null, null],
    "(a:b,c:d,e:f)": { a: "b", c: "d", e: "f" },
    "1e%2B1": "1e+1",
  };

  for (let [key, testCase] of Object.entries(PARSE_LITERAL_COMPLEX)) {
    test(`JsonURL.parse('${key}')`, () => {
      expect(u.parse(key)).toBe(testCase.value);
    });
  }

  for (let [key, value] of Object.entries(PARSE_TESTS)) {
    test(`JsonURL.parse('${key}')`, () => {
      expect(u.parse(key)).toEqual(value);
      expect(JsonURL.stringify(value)).toBe(
        key
          .replace("3e1", "30")
          .replace("2.0", "2")
          .replace("4e-2", "0.04")
          .replace("5e+0", "5")
      );
    });
  }
})();

//
// JsonURL.stringify
//
(function () {
  "use strict";

  const STRINGIFY_TESTS = {
    "'1+2'": "%271%2B2'",
    "1e+1": "1e%2B1",
    "a b c": "a+b+c",
    "a,b": "'a,b'",
    "a,b c": "'a,b+c'",
    "Bob & Frank": "Bob+%26+Frank",
  };

  for (let [key, value] of Object.entries(STRINGIFY_TESTS)) {
    test(`JsonURL.parse('${key}')`, () => {
      expect(JsonURL.stringify(key)).toBe(value);
    });
  }
})();

//
// Errors
//
(function () {
  "use strict";

  const u = new JsonURL();

  const ERROR_TESTS = {
    ")": SyntaxError,
  };

  for (let [key, value] of Object.entries(ERROR_TESTS)) {
    test(`JsonURL.parse('${key}')`, () => {
      expect(() => {
        u.parse(key);
      }).toThrow(value);
    });
  }
})();
