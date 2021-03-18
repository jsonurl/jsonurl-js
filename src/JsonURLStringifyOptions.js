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

/** @module JsonURL */
"use strict";

import { JsonURLOptions } from "./JsonURLOptions.js";

/**
 * JsonURL.stringify() options.
 * @public
 * @property {boolean} ignoreNullArrayMembers Ignore null array members.
 * This is false by default.
 * @property {boolean} ignoreNullObjectMembers Ignore null object members.
 * This is false by default.
 * @property {boolean} ignoreUndefinedArrayMembers Ignore undefined array members.
 * This is false by default. They will be stringified as null because
 * undefined is not a valid JSON value.
 * @property {boolean} ignoreUndefinedObjectMembers Ignore undefined object members.
 * This is true by default. They will be omitted from the stringified
 * output. This mimics the behavior JSON.stringify().
 * @property {boolean} wwwFormUrlEncoded Enable x-www-form-urlencoded
 * structural characters.
 * @property {boolean} isImplied Create JSON->URL text for an implied
 * array or object.
 * @property {boolean} impliedStringLiterals Assume all literals
 * are strings.
 * @property {boolean} allowEmptyUnquotedValues Allow the empty string
 * as a value to be represented as a zero legnth string rather than
 * bac-to-back single quotes.
 * @property {boolean} allowEmptyUnquotedKeys Allow the empty string
 * as a key to be represented as a zero legnth string rather than
 * bac-to-back single quotes.
 * @property {boolean} coerceNullToEmptyString Replace instances
 * of the null value with an empty string.
 * @property {boolean} noEmptyComposite Distinguish
 * between empty array and empty object. Empty array is back-to-back parens,
 * e.g. (). Empty object is two parens with a single colon inside, e.g. (:).
 * @property {boolean} callFunctions If object values are functions
 * then call them.
 */
export class JsonURLStringifyOptions extends JsonURLOptions {
  /**
   * Construct a new instance.
   * @param {?Object} src initial set of options
   */
  constructor(src) {
    super(src);

    const def =
      src !== undefined &&
      "impliedStringLiterals" in src &&
      src.impliedStringLiterals
        ? true
        : undefined;
    this.setOrDefault(src, "allowEmptyUnquotedValues", def);
    this.setOrDefault(src, "allowEmptyUnquotedKeys", def);
    this.setOrDefault(src, "callFunctions");
    this.setOrDefault(src, "isImplied");
    this.setOrDefault(src, "ignoreNullArrayMembers", def);
    this.setOrDefault(src, "ignoreNullObjectMembers", def);
    this.setOrDefault(src, "ignoreUndefinedArrayMembers", def);
    this.setOrDefault(src, "ignoreUndefinedObjectMembers", def);

    //
    // provide consistency with JsonURL.parse() option names even though
    // stringify doesn't care whether it's an object or array.
    //
    this.isImplied = this.isImplied || this.impliedArray || this.impliedObject;
  }
}
