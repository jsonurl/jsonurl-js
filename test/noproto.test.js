/*
  MIT License

  Copyright (c) 2022 David MacCormack

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

import { setupToJsonURLText, toJsonURLText } from "../src/noproto.js";

function toJsonURLText_Array() {
  return "toJsonURLText_Array";
}
function toJsonURLText_Boolean() {
  return "toJsonURLText_Boolean";
}
function toJsonURLText_Number() {
  return "toJsonURLText_Number";
}
function toJsonURLText_Object() {
  return "toJsonURLText_Object";
}
function toJsonURLText_String() {
  return "toJsonURLText_String";
}

setupToJsonURLText({
  toJsonURLText_Array,
  toJsonURLText_Boolean,
  toJsonURLText_Number,
  toJsonURLText_Object,
  toJsonURLText_String,
});

test("toJsonURLText_Array", () => {
  expect(toJsonURLText(["stuff"])).toBe(toJsonURLText_Array());
});
test("toJsonURLText_Boolean", () => {
  expect(toJsonURLText(true)).toBe(toJsonURLText_Boolean());
});
test("toJsonURLText_Number", () => {
  expect(toJsonURLText(1)).toBe(toJsonURLText_Number());
});
test("toJsonURLText_Object", () => {
  expect(toJsonURLText({})).toBe(toJsonURLText_Object());
});
test("toJsonURLText_String", () => {
  expect(toJsonURLText("true")).toBe(toJsonURLText_String());
});
