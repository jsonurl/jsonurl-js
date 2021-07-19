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

/**
 * Base class for parse() and stringify() options.
 */
export class JsonURLOptions {
  /**
   * Construct a new instance. Make a copy of the given source options
   * and apply defaults.
   * @param {?Object} src initial set of options
   */
  constructor(src) {
    this.setOrDefault(src, "allowEmptyUnquotedValues");
    this.setOrDefault(src, "allowEmptyUnquotedKeys");
    this.setOrDefault(src, "AQF");
    this.setOrDefault(src, "coerceNullToEmptyString");
    this.setOrDefault(src, "ignoreNullArrayMembers");
    this.setOrDefault(src, "ignoreNullObjectMembers");
    this.setOrDefault(src, "impliedArray");
    this.setOrDefault(src, "impliedObject");
    this.setOrDefault(src, "impliedStringLiterals");
    this.setOrDefault(src, "noEmptyComposite");
    this.setOrDefault(src, "wwwFormUrlEncoded");
  }

  /**
   * Set a named value from a source object or set its default (if given).
   * @protected
   */
  setOrDefault(src, key, defValue) {
    if (src === undefined || !(key in src)) {
      if (defValue !== undefined && !(key in this)) {
        this[key] = defValue;
      }
    } else if (!(key in this)) {
      this[key] = src[key];
    }
  }

  /**
   * Override the given function.
   * @protected
   */
  setOverride(src, key) {
    if (src !== undefined && key in src) {
      this[key] = src[key];
    }
  }

  /**
   * Set a named value from a source object or set its default (if given).
   * @protected
   */
  setOrDefaultInt(src, key, defValue) {
    this.setOrDefault(
      src,
      key,
      defValue === undefined ? defValue : parseInt(defValue)
    );
  }

  /**
   * Evaluates to true if the given `ignore` option is present and truthy.
   */
  isPresentAndTrue(key) {
    return key in this && this[key];
  }
}
