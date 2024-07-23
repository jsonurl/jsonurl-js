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

export function setupToJsonURLText({
  toJsonURLText_Array,
  toJsonURLText_Boolean,
  toJsonURLText_Number,
  toJsonURLText_Object,
  toJsonURLText_String,
}) {
  Object.defineProperty(Array.prototype, "toJsonURLText", {
    value: toJsonURLText_Array,
    configurable: true
  });
  Object.defineProperty(Boolean.prototype, "toJsonURLText", {
    value: toJsonURLText_Boolean,
    configurable: true
  });
  Object.defineProperty(Number.prototype, "toJsonURLText", {
    value: toJsonURLText_Number,
    configurable: true
  });
  Object.defineProperty(Object.prototype, "toJsonURLText", {
    value: toJsonURLText_Object,
    configurable: true
  });
  Object.defineProperty(String.prototype, "toJsonURLText", {
    value: toJsonURLText_String,
    configurable: true
  });
}

//
// This function is used by JsonURL.js, and it will be called when the code
// is run in the development enviornment (e.g. jest). However, each call to
// this function will be removed by rollup during the build and replated with
// a direct call to `target`. Eslint will see that this function is never
// called and flag it as an error.
//
export function toJsonURLText(target, ...args) {
  return target.toJsonURLText.apply(target, args);
}
