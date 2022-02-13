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

let JsonURLStringify;

export function setupToJsonURLText(c) {
  JsonURLStringify = c;
}

export function toJsonURLText(target, ...args) {
  if (typeof target === "boolean" || target instanceof Boolean) {
    return JsonURLStringify.toJsonURLText_Boolean.apply(target, args);
  }
  if (typeof target === "number" || target instanceof Number) {
    return JsonURLStringify.toJsonURLText_Number.apply(target, args);
  }
  if (typeof target === "string" || target instanceof String) {
    return JsonURLStringify.toJsonURLText_String.apply(target, args);
  }
  if (Array.isArray(target)) {
    return JsonURLStringify.toJsonURLText_Array.apply(target, args);
  }
  return JsonURLStringify.toJsonURLText_Object.apply(target, args);
}
