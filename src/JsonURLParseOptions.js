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

import * as Err from "./error.js";
import { JsonURLOptions } from "./JsonURLOptions.js";

/**
 * JsonURL.parse() options.
 * @public
 * @property {Array} impliedArray An implied array.
 * The parse() method implements a parser for the grammar oulined in
 * section 2.7 of the JSON->URL specification. The given parse text
 * is assumed to be an array, and the leading and trailing parens must
 * not be present. The given prop.impliedArray value will be populated
 * and returned.
 * @property {Object} impliedObject An implied object.
 * The parse() method implements a parser for the grammar oulined in
 * section 2.8 of the JSON->URL specification. The given parse text
 * is assumed to be an object, and the leading and trailing parens must
 * not be present. The given prop.impliedObject value will be populated
 * and returned.
 * @property {boolean} wwwFormUrlEncoded Enable support for
 * x-www-form-urlencoded content.
 * The parse() method implements a parser for the grammar oulined in
 * section 2.9 of the JSON->URL specification. The given parse text
 * is may use ampersand and equal characters as the value and member
 * separator characters, respetively, at the top-level. This may be
 * combined with prop.impliedArray or prop.impliedObject.
 * @property {boolean} impliedStringLiterals Assume all
 * literals are strings.
 * @property {boolean} allowEmptyUnquotedValues Allow the
 * empty string as a value to be represented as a zero legnth string rather
 * than back-to-back single quotes.
 * @property {boolean} allowEmptyUnquotedKeys Allow the
 * empty string as a key to be represented as a zero legnth string rather
 * than back-to-back single quotes.
 * @property {boolean} coerceNullToEmptyString Replace
 * instances of the null value with an empty string.
 * @property {boolean} noEmptyComposite Distinguish
 * between empty array and empty object. Empty array is back-to-back parens,
 * e.g. (). Empty object is two parens with a single colon inside, e.g. (:).
 * Note that this prevents the parser from recognizing (:) as an object
 * with a single member whose key and value is the unquoted empty string.
 * @property {boolean} AQF Enable the Address Bar Query String Friendly
 * syntax.
 * @property {function} getMissingValue Provides a value for a
 * missing, top-level value.
 * @property {number} maxParseDepth Maximum parse depth.
 * The parse() method will throw an Error if the depth
 * of the input exceeds this value. The default is 32.
 * @property {number} maxParseValues Maximum number of values to parse.
 * The parse() method will throw an Error if it parses more than this
 * number of values. The default is 4096.
 * @property {number} maxParseChars Maximum number of characters to parse.
 * The parse() method will throw an Error if it parses more than this
 * number of characters. The default is 32K.
 * @property {*} emptyValue The value which represents the empty composite.
 * This may be any type. If it is a function then it will be called
 * until it resolves to something that is not a function. The default
 * is an empty Object.
 * @property {*} nullValue The value which represents the null value.
 * This may be any type. If it is a function then it will be called
 * until it resolves to something that is not a function. The default
 * is null.
 */
export class JsonURLParseOptions extends JsonURLOptions {
  /**
   * Construct a new instance.
   * @param {?Object} src initial set of options
   * @param {?Object} limits this parameter is deprecated but included for
   * compatibility. `maxParseChars`, `maxParseDepth`, and/or
   * `maxParseValues` may be included here rather than `src`.
   */
  constructor(src, limits) {
    super(src);
    this.setOrDefault(src, "emptyValue");
    this.setOrDefault(limits, "emptyValue", {});
    this.setOverride(src, "getMissingValue");
    this.setOrDefaultInt(src, "maxParseChars");
    this.setOrDefaultInt(limits, "maxParseChars", 1 << 15);
    this.setOrDefaultInt(src, "maxParseDepth");
    this.setOrDefaultInt(limits, "maxParseDepth", 1 << 5);
    this.setOrDefaultInt(src, "maxParseValues");
    this.setOrDefaultInt(limits, "maxParseValues", 1 << 12);
    this.setOrDefault(src, "nullValue");
    this.setOrDefault(limits, "nullValue", null);
  }

  /**
   * Get the value for the given key/name.
   * @param {string} key property key/name
   * @param {number} pos position in the JSON->URL text. This is helpful
   * if you want to throw a SyntaxError.
   */
  getMissingValue(key, pos) {
    throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_OBJVALUE, pos));
  }
}
