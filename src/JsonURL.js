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
import * as Chars from "./chars.js";
import { JsonURLParseOptions } from "./JsonURLParseOptions.js";
import { JsonURLStringifyOptions } from "./JsonURLStringifyOptions.js";
import { setupToJsonURLText, toJsonURLText } from "./proto.js";

const RX_DECODE_SPACE = /\+/g;
const RX_ENCODE_SPACE = / /g;
const RX_AQF_DECODE = /(![\s\S]?)/g;

//
// patterns for use with RegEx.test().
// DO NOT PUT //g ON THESE!!!
//
const RX_ENCODE_STRING_SAFE =
  /^[-A-Za-z0-9._~!$*;@?/ ][-A-Za-z0-9._~!$*;@?/' ]*$/;
const RX_ENCODE_STRING_QSAFE = /^[-A-Za-z0-9._~!$*,;@?/(): ]+$/;
const RX_ENCODE_NUMBER = /^-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/;

const RX_ENCODE_BASE = /[(),:]|%2[04]|%3B/gi;
const RX_ENCODE_BASE_MAP = {
  "%20": "+",
  "%24": "$",
  "(": "%28",
  ")": "%29",
  ",": "%2C",
  ":": "%3A",
  "%3B": ";",
};

const RX_ENCODE_AQF = /[!(),:]|%2[01489C]|%3[AB]/gi;
const RX_ENCODE_AQF_MAP = {
  "%20": "+",
  "%21": "!!",
  "!": "!!",
  "%24": "$",
  "%28": "!(",
  "(": "!(",
  "%29": "!)",
  ")": "!)",
  "+": "!+",
  "%2C": "!,",
  ",": "!,",
  "%3A": "!:",
  ":": "!:",
  "%3B": ";",
};

const CHAR_BANG = 0x21;
const CHAR_PERCENT = 0x25;
const CHAR_QUOTE = 0x27;
const CHAR_PAREN_OPEN = 0x28;
const CHAR_PAREN_CLOSE = 0x29;
const CHAR_PLUS = 0x2b;
const CHAR_COMMA = 0x2c;
const CHAR_DASH = 0x2d;
const CHAR_DOT = 0x2e;
const CHAR_COLON = 0x3a;
const CHAR_EQUALS = 0x3d;
const CHAR_AMP = 0x26;

const CHAR_0 = 0x30;
const CHAR_A = 0x41;
const CHAR_E = 0x45;
const CHAR_a = 0x61;
const CHAR_e = 0x65;
const CHAR_f = 0x66;
const CHAR_l = 0x6c;
const CHAR_n = 0x6e;
const CHAR_r = 0x72;
const CHAR_s = 0x73;
const CHAR_t = 0x74;
const CHAR_u = 0x75;

const STATE_PAREN = 1;
const STATE_IN_ARRAY = 2;
const STATE_ARRAY_AFTER_ELEMENT = 3;
const STATE_OBJECT_HAVE_KEY = 4;
const STATE_OBJECT_AFTER_ELEMENT = 5;
const STATE_IN_OBJECT = 6;

const UNESCAPE = new Array(111);
UNESCAPE[CHAR_BANG] = "!";
UNESCAPE[CHAR_PAREN_OPEN] = "(";
UNESCAPE[CHAR_PAREN_CLOSE] = ")";
UNESCAPE[CHAR_PLUS] = "+";
UNESCAPE[CHAR_COMMA] = ",";
UNESCAPE[CHAR_DASH] = ",";
UNESCAPE[CHAR_0] = "0";
UNESCAPE[CHAR_0 + 1] = "1";
UNESCAPE[CHAR_0 + 2] = "2";
UNESCAPE[CHAR_0 + 3] = "3";
UNESCAPE[CHAR_0 + 4] = "4";
UNESCAPE[CHAR_0 + 5] = "5";
UNESCAPE[CHAR_0 + 6] = "6";
UNESCAPE[CHAR_0 + 7] = "7";
UNESCAPE[CHAR_0 + 8] = "8";
UNESCAPE[CHAR_0 + 9] = "9";
UNESCAPE[CHAR_COLON] = ":";
UNESCAPE[CHAR_t] = "t";
UNESCAPE[CHAR_f] = "f";
UNESCAPE[CHAR_n] = "n";

const EMPTY_STRING = "";
const EMPTY_STRING_AQF = "!e";
const SPACE = " ";

function newEmptyString(pos, emptyOK) {
  if (emptyOK) {
    return EMPTY_STRING;
  }
  throw new SyntaxError(Err.fmt(Err.MSG_IMPLIED_STRING_EMPTY, pos));
}

function encodeStringLiteral(text, aqf) {
  const re = aqf ? RX_ENCODE_AQF : RX_ENCODE_BASE;
  const map = aqf ? RX_ENCODE_AQF_MAP : RX_ENCODE_BASE_MAP;

  return encodeURIComponent(text).replace(re, function name(match) {
    const ret = map[match];
    return ret === undefined ? match : ret;
  });
}

function hexDecodeOctet(text, pos, end) {
  if (end <= pos + 1) {
    throw new SyntaxError(Err.fmt(Err.MSG_BAD_PCTENC, pos));
  }

  const high = hexDecode(pos, text.charCodeAt(pos));
  const low = hexDecode(pos, text.charCodeAt(pos + 1));
  return (high << 4) | low;
}

function hexDecode(pos, c) {
  switch (c) {
    case CHAR_0:
      return 0;
    case CHAR_0 + 1:
      return 1;
    case CHAR_0 + 2:
      return 2;
    case CHAR_0 + 3:
      return 3;
    case CHAR_0 + 4:
      return 4;
    case CHAR_0 + 5:
      return 5;
    case CHAR_0 + 6:
      return 6;
    case CHAR_0 + 7:
      return 7;
    case CHAR_0 + 8:
      return 8;
    case CHAR_0 + 9:
      return 9;

    case CHAR_A:
    case CHAR_a:
      return 10;
    case CHAR_A + 1:
    case CHAR_a + 1:
      return 11;
    case CHAR_A + 2:
    case CHAR_a + 2:
      return 12;
    case CHAR_A + 3:
    case CHAR_a + 3:
      return 13;
    case CHAR_A + 4:
    case CHAR_a + 4:
      return 14;
    case CHAR_A + 5:
    case CHAR_a + 5:
      return 15;
    default:
      throw new SyntaxError(Err.fmt(Err.MSG_BAD_PCTENC, pos));
  }
}

function isBoolNullNumber(s) {
  if (s === "true" || s === "false" || s === "null") {
    return true;
  }
  return RX_ENCODE_NUMBER.test(s);
}

function toJsonURLText_Null(options) {
  if (options.coerceNullToEmptyString) {
    return toJsonURLText_EmptyString(options, false);
  }
  if (options.impliedStringLiterals) {
    throw new SyntaxError(Err.MSG_IMPLIED_STRING_NULL);
  }

  return "null";
}

function toJsonURLText_EmptyString(options, isKey) {
  const emptyOK = isKey
    ? options.allowEmptyUnquotedKeys
    : options.allowEmptyUnquotedValues;

  if (emptyOK) {
    return EMPTY_STRING;
  }

  if (options.AQF) {
    return EMPTY_STRING_AQF;
  }

  if (options.impliedStringLiterals) {
    throw new SyntaxError(Err.MSG_IMPLIED_STRING_EMPTY);
  }

  return "''";
}

function toJsonURLText_Boolean() {
  return this === true ? "true" : "false";
}

function toJsonURLText_Number(options) {
  const ret = String(this);

  if (options.impliedStringLiterals && ret.indexOf("+") !== -1) {
    //
    // I don't think this will happen, but just in case...
    //
    return encodeStringLiteral(ret, options);
  }

  return ret;
}

function toJsonURLText_String(options, depth, isKey) {
  if (this.length === 0) {
    return toJsonURLText_EmptyString(options, isKey);
  }

  if (options.impliedStringLiterals) {
    return encodeStringLiteral(this, options.AQF);
  }

  if (isBoolNullNumber(this)) {
    //
    // if this string looks like a Boolean, Number, or ``null'' literal
    // then it must be quoted
    //
    if (isKey === true) {
      return this;
    }
    if (options.AQF) {
      if (this.indexOf("+") == -1) {
        return "!" + this;
      }
      return this.replace("+", "!+");
    }
    if (this.indexOf("+") == -1) {
      return "'" + this + "'";
    }

    //
    // if the string needs to be encoded then it no longer looks like a
    // literal and does not need to be quoted.
    //
    return encodeURIComponent(this);
  }
  if (options.AQF) {
    return encodeStringLiteral(this, true);
  }
  if (RX_ENCODE_STRING_SAFE.test(this)) {
    //
    // safe to use as long as I encode spaces
    //
    if (this.indexOf(SPACE) == -1) {
      return this;
    }
    return this.replace(RX_ENCODE_SPACE, "+");
  }
  if (RX_ENCODE_STRING_QSAFE.test(this)) {
    //
    // safe to use as long as I quote it and encode spaces
    //
    if (this.indexOf(SPACE) == -1) {
      return "'" + this + "'";
    }
    return "'" + this.replace(RX_ENCODE_SPACE, "+") + "'";
  }

  let ret = encodeStringLiteral(this);

  if (ret.charCodeAt(0) == CHAR_QUOTE) {
    //
    // I need to encode the leading quote
    //
    return "%27" + ret.substring(1);
  }

  return ret;
}

function toJsonURLText_Array(options = {}, depth = 0) {
  let ret = undefined;

  this.forEach(function (e) {
    if (typeof e === "function") {
      if (!options.callFunctions) {
        return;
      }
      while (typeof e === "function") {
        e = e();
      }
    }

    if (e === undefined) {
      if (options.ignoreUndefinedArrayMembers) {
        return;
      }
      e = toJsonURLText_Null(options);
    } else if (e === null) {
      if (options.ignoreNullArrayMembers) {
        return;
      }
      e = toJsonURLText_Null(options);
    } else {
      e = toJsonURLText(e, options, depth + 1);
    }

    if (ret === undefined) {
      ret = e;
    } else if (!options.wwwFormUrlEncoded || depth > 0) {
      ret += "," + e;
    } else {
      ret += "&" + e;
    }
  });

  if (!options.isImplied || depth > 0) {
    return ret === undefined ? "()" : "(" + ret + ")";
  }

  return ret === undefined ? EMPTY_STRING : ret;
}

function toJsonURLText_Object(options = {}, depth = 0) {
  let ret = undefined;
  const keys = Object.keys(this);
  const obj = this;

  keys.forEach(function (k) {
    if (k === undefined || k === null) {
      //
      // I'm not sure this can actually happen. But, handling just in case.
      //
      return;
    }

    let v = obj[k];

    if (typeof v === "function") {
      if (!options.callFunctions) {
        return;
      }
      while (typeof v === "function") {
        v = v();
      }
    }

    if (v === undefined) {
      if (options.ignoreUndefinedObjectMembers) {
        return;
      }
      v = toJsonURLText_Null(options);
    } else if (v === null) {
      if (options.ignoreNullObjectMembers) {
        return;
      }
      v = toJsonURLText_Null(options);
    } else {
      v = toJsonURLText(v, options, depth + 1);
    }

    const jk = toJsonURLText(k, options, depth, true);

    if (ret === undefined) {
      if (!options.wwwFormUrlEncoded || depth > 0) {
        ret = jk + ":" + v;
      } else {
        ret = jk + "=" + v;
      }
    } else {
      if (!options.wwwFormUrlEncoded || depth > 0) {
        ret += "," + jk + ":" + v;
      } else {
        ret += "&" + jk + "=" + v;
      }
    }
  });

  if (!options.isImplied || depth > 0) {
    if (options.noEmptyComposite && ret === undefined) {
      ret = ":";
    }
    return ret === undefined ? "()" : "(" + ret + ")";
  }

  return ret === undefined ? EMPTY_STRING : ret;
}

setupToJsonURLText({
  toJsonURLText_Array,
  toJsonURLText_Boolean,
  toJsonURLText_Number,
  toJsonURLText_Object,
  toJsonURLText_String,
});

/**
 * Base syntax parser.
 * @private
 */
class Parser {
  /**
   * Construct a new instance.
   * @param {JsonURLParseOptions} options options provided by the user
   */
  constructor(text, pos, end, options) {
    this.text = text;
    this.pos = this.markPos = pos;
    this.end = end;
    this.options = options;
  }

  /**
   * Skip zero or more amperands.
   */
  skipAmps(leading = false) {
    const text = this.text;
    const end = this.end;
    let pos = this.pos;

    if (leading) {
      //
      // skip all leading amps and position `pos` at the first non-amp
      // character (or EOF)
      //
      while (pos < end && text.charCodeAt(pos) === CHAR_AMP) {
        pos++;
      }
    } else if (pos < end && text.charCodeAt(pos) === CHAR_AMP) {
      //
      // there is at least one amp
      //
      for (pos++; pos < end && text.charCodeAt(pos) === CHAR_AMP; pos++) {
        // skip all consecutive amps
      }
      if (pos !== end) {
        // one or more amps followed by additional text; caller
        // is looking to consume a value separator so go back one char.
        pos--;
      }
    }

    this.pos = pos;
  }

  /**
   * Read the next char code. If it is a structural character then the
   * current position will be advanced and the char will be returned.
   * Otherwise, the current position will remain unchanged and undefined
   * will be returned.
   */
  structChar(parenOnly = false) {
    if (this.options.wwwFormUrlEncoded) {
      const chr = this.text.charCodeAt(this.pos);

      switch (chr) {
        case CHAR_AMP:
        case CHAR_EQUALS:
          if (parenOnly) {
            return undefined;
          }
          this.pos++;
          return chr;
        default:
          break;
      }
    }

    const pos = this.pos;
    const c = this.ordinal();

    switch (c) {
      case CHAR_COMMA:
      case CHAR_COLON:
        if (parenOnly) {
          this.pos = pos;
          return undefined;
        }
      //fallthrough

      case CHAR_PAREN_OPEN:
      case CHAR_PAREN_CLOSE:
        return c;
      default:
        this.pos = pos;
        return undefined;
    }
  }

  /**
   * Read the next character code.
   *
   * If pos is undefined then the characther code will be read and returned,
   * and the current position marker will be advanced. Otherwise, the
   * character code at the given position will be read and returned by the
   * current position marker will remain unchanged.
   *
   * AQF will apply percent decoding if necessary.
   *
   * Note, this will *not* perform UTF-8 decoding. That isn't necessary for
   * the current use cases.
   * @param pos an optional position to read from
   */
  ordinal(pos) {
    if (pos !== undefined) {
      return this.text.charCodeAt(pos);
    }
    return this.text.charCodeAt(this.pos++);
  }

  /**
   * Read and accept a single character code.
   * @returns true if the expected character was accepted; false otherwise
   */
  accept(c) {
    const pos = this.pos;
    if (this.ordinal() === c) {
      return true;
    }
    this.pos = pos;
    return false;
  }

  /**
   * Effectively the same as this.accept(CHAR_PLUS) but allows CHAR_PLUS
   * to be handled differently for AQF.
   * @returns true if the expected character was accepted; false otherwise
   */
  acceptPlus() {
    //
    // Not calling ordinal() because that would decode '+' to a space.
    //
    if (this.text.charCodeAt(this.pos) == CHAR_PLUS) {
      this.pos++;
      return true;
    }
    return false;
  }

  /**
   * Test if all of the parse text has been consumed.
   */
  done() {
    return this.end <= this.pos;
  }

  validateLiteral(ret, mask) {
    const text = this.text;
    const end = this.end;

    for (; ret < end; ret++) {
      const c = text.charCodeAt(ret);
      const bits = Chars.lookup(c) & mask;

      switch (bits) {
        case 0:
          throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, ret));
        case Chars.IS_STRUCT:
          return ret;
        case Chars.IS_QUOTE:
          return ret + 1;
        default:
          continue;
      }
    }
  }

  /**
   * Find the end index of the next literal.
   */
  findLiteralEnd() {
    const text = this.text;
    const end = this.end;
    let ret = this.pos;

    const isQuote = text.charCodeAt(ret) === CHAR_QUOTE;

    if (isQuote) {
      ret++;
    }

    const mask = isQuote
      ? Chars.IS_QSTRSAFE | Chars.IS_STRUCT | Chars.IS_QUOTE
      : Chars.IS_NSTRSAFE | Chars.IS_STRUCT;

    ret = this.validateLiteral(ret, mask);

    if (ret !== undefined) {
      return ret;
    }

    if (isQuote) {
      throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_QUOTE, ret));
    }

    return end;
  }

  /**
   * Test if the next character sequence represents the empty object.
   */
  isEmptyObject() {
    if (this.options.noEmptyComposite) {
      const start = this.pos;

      if (!this.accept(CHAR_COLON)) {
        return false;
      }

      const pos = this.pos;
      const ret = this.accept(CHAR_PAREN_CLOSE);

      //
      // this is non-obvious and deserves an explanation.
      //
      // If I do not match the empty object sequence then I effectively leave
      // the current position the same as it was when I entered the function.
      // If I do match the empty object sequence then I set the current
      // position at the paren that closes it. This allows the caller to
      // handle the case with just a small bit of additional logic.
      //
      this.pos = ret ? pos : start;

      return ret;
    }
    return false;
  }

  /**
   * Parse a single literal value.
   */
  parseLiteral(isKey) {
    const pos = this.pos;
    const options = this.options;
    const litend = this.findLiteralEnd();

    if (isKey === undefined) {
      isKey = this.ordinal(litend) == CHAR_COLON;
    }

    if (litend <= pos) {
      const emptyOK = isKey
        ? this.options.allowEmptyUnquotedKeys
        : this.options.allowEmptyUnquotedValues;

      return newEmptyString(pos, emptyOK);
    }

    //
    // I will consume up to this point
    //
    if (options.impliedStringLiterals === true) {
      return this.parseStringLiteral(litend, true);
    }

    const tfn = this.parseTrueFalseNull(litend, isKey);
    if (tfn !== undefined) {
      return tfn;
    }

    const numval = this.parseNumberLiteral(litend, isKey);
    if (numval !== undefined) {
      return numval;
    }

    return this.parseStringLiteral(litend, false);
  }

  parseDigits(litend) {
    let ret = false;
    let pos;

    while (this.pos < litend) {
      switch (this.ordinal()) {
        case CHAR_0:
        case CHAR_0 + 1:
        case CHAR_0 + 2:
        case CHAR_0 + 3:
        case CHAR_0 + 4:
        case CHAR_0 + 5:
        case CHAR_0 + 6:
        case CHAR_0 + 7:
        case CHAR_0 + 8:
        case CHAR_0 + 9:
          pos = this.pos;
          ret = true;
          continue;
        default:
          this.pos = pos;
          return ret;
      }
    }
    this.pos = pos;
    return ret;
  }

  parseExponentValue(litend) {
    const pos = this.pos;

    if (litend <= pos) {
      return false;
    }

    //
    // consume plus or minus
    //
    this.acceptPlus() || this.accept(CHAR_DASH);

    return this.parseDigits(litend);
  }

  parseExponent(litend) {
    const pos = this.pos;

    switch (this.ordinal()) {
      case CHAR_E:
      case CHAR_e:
        if (this.parseExponentValue(litend)) {
          return true;
        }
        break;
      default:
        break;
    }

    this.pos = pos;
    return false;
  }

  parseFraction(litend) {
    const pos = this.pos;

    if (litend <= pos) {
      return false;
    }

    if (this.accept(CHAR_DOT) && this.parseDigits(litend)) {
      return true;
    }

    this.pos = pos;
    return false;
  }

  parseInteger(litend) {
    const pos = this.pos;
    if (litend <= pos) {
      return false;
    }

    if (this.accept(CHAR_0)) {
      return true;
    }

    return this.parseDigits(litend);
  }

  parseNumberLiteral(litend, forceString) {
    const text = this.text;
    const pos = this.pos;

    this.accept(CHAR_DASH);

    if (this.parseInteger(litend)) {
      this.parseFraction(litend);
      this.parseExponent(litend);

      if (this.pos === litend) {
        //
        // this literal is a number
        //
        const s = decodeURIComponent(text.substring(pos, litend));
        return forceString ? s : Number(s);
      }
    }

    this.pos = pos;
    return undefined;
  }

  parseStringLiteral(litend, impliedString) {
    const text = this.text;
    const pos = this.pos;

    let ret =
      impliedString || text.charCodeAt(pos) !== CHAR_QUOTE
        ? text.substring(pos, litend)
        : text.substring(pos + 1, litend - 1);

    ret = decodeURIComponent(ret.replace(RX_DECODE_SPACE, SPACE));
    this.pos = litend;

    return ret;
  }

  parseTrueFalseNull(litend, forceString) {
    const text = this.text;
    const pos = this.pos;

    let c1, c2, c3, c4, c5;

    switch (litend - pos) {
      case 4:
        c1 = text.charCodeAt(pos);
        c2 = text.charCodeAt(pos + 1);
        c3 = text.charCodeAt(pos + 2);
        c4 = text.charCodeAt(pos + 3);
        if (c1 === CHAR_t && c2 === CHAR_r && c3 === CHAR_u && c4 === CHAR_e) {
          this.pos = litend;
          return forceString ? "true" : true;
        }
        if (c1 === CHAR_n && c2 === CHAR_u && c3 === CHAR_l && c4 === CHAR_l) {
          this.pos = litend;
          return forceString ? "null" : this.newNullValue();
        }
        break;
      case 5:
        c1 = text.charCodeAt(pos);
        c2 = text.charCodeAt(pos + 1);
        c3 = text.charCodeAt(pos + 2);
        c4 = text.charCodeAt(pos + 3);
        c5 = text.charCodeAt(pos + 4);
        if (
          c1 === CHAR_f &&
          c2 === CHAR_a &&
          c3 === CHAR_l &&
          c4 === CHAR_s &&
          c5 === CHAR_e
        ) {
          this.pos = litend;
          return forceString ? "false" : false;
        }
        break;
      default:
        break;
    }

    return undefined;
  }

  newEmptyValue() {
    const options = this.options;

    if (options.noEmptyComposite) {
      return [];
    }

    const emptyValue = options.emptyValue;

    if (typeof emptyValue === "function") {
      return emptyValue();
    }

    return emptyValue;
  }

  newNullValue() {
    const options = this.options;
    let ret = options.nullValue;

    if (typeof ret === "function") {
      ret = ret();
    }

    if (ret == null && options.coerceNullToEmptyString) {
      ret = EMPTY_STRING;
    }

    return ret;
  }
}

/**
 * Parser for Address Bar Query String Friendly (AQF) syntax.
 * @private
 */
class ParserAQF extends Parser {
  /**
   * Construct a new instance.
   * @param {JsonURLParseOptions} options options provided by the user
   */
  constructor(text, pos, end, options) {
    super(text, pos, end, options);
  }

  ordinal(pos) {
    //
    // decode position - use what's given; default to current position.
    //
    const dpos = pos || this.pos;

    const c = this.text.charCodeAt(dpos);

    let ret, cnt;

    if (c === CHAR_PERCENT) {
      ret = hexDecodeOctet(this.text, dpos + 1, this.end);
      cnt = 3;
    } else {
      ret = c;
      cnt = 1;
    }

    if (pos === undefined) {
      this.pos += cnt;
    }

    return ret;
  }

  acceptPlus() {
    return this.accept(CHAR_PLUS);
  }

  findLiteralEnd() {
    const end = this.end;
    const pos = this.pos;
    const text = this.text;
    let ret = pos;

    const mask = Chars.IS_NSTRSAFE | Chars.IS_STRUCT | Chars.IS_WFU;

    for (;;) {
      if (end <= this.pos) {
        this.pos = pos;
        return end;
      }

      const c = text.charCodeAt(this.pos);
      const bits = Chars.lookup(c) & mask;

      //
      // validate the potentially encoded character
      //
      switch (bits) {
        case Chars.IS_STRUCT | Chars.IS_WFU:
          if (this.options.wwwFormUrlEncoded) {
            ret = this.pos;
            this.pos = pos;
            return ret;
          }
        // fallthrough
        case 0:
          throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, ret));
        default:
          break;
      }

      //
      // decode
      //
      switch (this.ordinal()) {
        case CHAR_PAREN_OPEN:
        case CHAR_PAREN_CLOSE:
        case CHAR_COLON:
        case CHAR_COMMA:
          this.pos = pos;
          return ret;

        case CHAR_BANG:
          if (this.pos === end) {
            throw new SyntaxError(Err.fmt(Err.MSG_BAD_ESCAPE, ret));
          }
          this.ordinal();
          ret = this.pos;
          break;

        default:
          ret = this.pos;
          break;
      }
    }
  }

  parseStringLiteral(litend) {
    const text = this.text;
    const pos = this.pos;
    const ret = decodeURIComponent(
      text.substring(pos, litend).replace(RX_DECODE_SPACE, SPACE)
    );

    this.pos = litend;

    if (ret === "!e") {
      return EMPTY_STRING;
    }

    return ret.replace(RX_AQF_DECODE, function name(match, _p, offset) {
      if (match.length === 2) {
        const c = match.charCodeAt(1);
        const uc = UNESCAPE[c];
        if (uc !== undefined) {
          return uc;
        }
      }
      throw new SyntaxError(Err.fmt(Err.MSG_BAD_ESCAPE, pos + offset));
    });
  }
}

/**
 * A class for managing values during parse
 * @private
 */
class StateStack extends Array {
  constructor(limits) {
    super();
    this.limits = limits;
    this.parseDepth = 0;
  }

  /**
   * Replace the current state with R and push state P.
   * @param pos current text position
   * @param s replacement state
   * @param p state to push
   */
  replaceAndPush(pos, r, p) {
    this[this.parseDepth] = r;

    if (++this.parseDepth >= this.limits.maxParseDepth) {
      throw new Error(Err.fmt(Err.MSG_LIMIT_MAXDEPTH, pos));
    }

    this.push(p);
  }

  /**
   * Replace the current state with R.
   * @param r replacement state
   */
  replace(r) {
    this[this.parseDepth] = r;
  }

  /**
   * Get current depth, optionally popping the top of the stack.
   */
  depth(pop = false) {
    if (pop) {
      this.parseDepth--;
      this.pop();
    }
    return this.parseDepth;
  }
}

/**
 * A class for managing values during parse
 * @private
 */
class ValueStack extends Array {
  constructor(limits) {
    super();
    this.limits = limits;
    this.numValues = 0;
  }

  /**
   * Pop an object key/value off the stack and assign the value in a target.
   * @returns the target
   */
  popObjectValue(options) {
    let value = this.pop();
    let key = this.pop();
    let target = this[this.length - 1];

    if (
      value !== null ||
      !options.isPresentAndTrue("ignoreNullObjectMembers")
    ) {
      target[key] = value;
    }

    return target;
  }

  /**
   * Pop a value off the stack and append it to a target.
   * @returns the target
   */
  popArrayValue(options) {
    let value = this.pop();
    let target = this[this.length - 1];

    if (value !== null || !options.isPresentAndTrue("ignoreNullArrayMembers")) {
      target.push(value);
    }

    return target;
  }

  /**
   * Check the currect value count against the configured maximum
   * @param {number} pos the position of the value in the text
   * @param {number} count the increment value
   */
  checkValueLimit(pos, count = 1) {
    this.numValues += count;

    if (this.numValues > this.limits.maxParseValues + 1) {
      throw new Error(Err.fmt(Err.MSG_LIMIT_MAXVALUES, pos));
    }
  }

  /**
   * Append an array value, checking the current value count against the maximum.
   * @param {number} pos the position of the value in the text
   * @param {*} value the value to append
   * @param {number} count number of new values to check against the maximum
   */
  appendArrayValue(pos, value, count = 1) {
    this.checkValueLimit(pos, count);
    this.push(value);
  }
}

function resolveFunction(value) {
  while (typeof value === "function") {
    value = value();
  }
  return value;
}

function getJsonURLParseOptions(offsetOrOpt, endOrOpt, options, limits) {
  //
  // find the "real" options object/function
  //
  if (typeof offsetOrOpt === "number") {
    if (typeof endOrOpt !== "number") {
      options = endOrOpt;
    }
  } else {
    options = offsetOrOpt;
  }

  options = resolveFunction(options);

  if (!(options instanceof JsonURLParseOptions)) {
    options = new JsonURLParseOptions(options, limits);
  }

  return options;
}

/**
 * Allocate a new Parser.
 */
function newParser(text, start, end, options) {
  return options.AQF
    ? new ParserAQF(text, start, end, options)
    : new Parser(text, start, end, options);
}

function getNumber(value, def) {
  return typeof value == "number" ? value : def;
}

/**
 * Main parse function.
 */
function parse(text, offsetOrOpt, endOrOpt, options, limits) {
  if (text === undefined) {
    return undefined;
  }

  options = getJsonURLParseOptions(offsetOrOpt, endOrOpt, options, limits);

  text = String(text);

  const start = getNumber(offsetOrOpt, 0);
  const end = getNumber(endOrOpt, text.length);

  if (end <= start) {
    if (options.impliedArray !== undefined) {
      return options.impliedArray;
    }
    if (options.impliedObject !== undefined) {
      return options.impliedObject;
    }
    throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_VALUE, 0));
  }

  if (end > options.maxParseChars) {
    throw new Error(Err.MSG_LIMIT_MAXCHARS);
  }

  //
  // when I'm effectively a replacement for URLSearchParams then I need to
  // accept and skip extra ampersands.
  //
  const skipAmps =
    options.wwwFormUrlEncoded &&
    (options.impliedObject || options.impliedArray);

  const valueStack = new ValueStack(options);
  const stateStack = new StateStack(options);

  //
  // A parser abstracts syntax-specific behavior.
  //
  const chars = newParser(text, start, end, options);

  if (options.impliedObject !== undefined) {
    valueStack.push(options.impliedObject);
    stateStack.push(STATE_IN_OBJECT);
  } else if (options.impliedArray !== undefined) {
    valueStack.push(options.impliedArray);
    stateStack.push(STATE_IN_ARRAY);
  } else if (chars.structChar(true) !== CHAR_PAREN_OPEN) {
    //
    // not composite; parse as a single literal value
    //
    const ret = chars.parseLiteral(false);
    if (chars.done()) {
      //
      // entire input consumed
      //
      return ret;
    }

    throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_LITERAL, 0));
  } else {
    stateStack.push(STATE_PAREN);
  }

  if (skipAmps) {
    //
    // ignore "extra" amps at the beginning of the string
    //
    chars.skipAmps(true);
  }

  for (;;) {
    if (chars.done()) {
      throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, chars.pos));
    }

    //
    // literal value
    // empty object bool
    // position for error reporting
    //
    let lv, isEmptyObject, errpos;

    switch (stateStack[stateStack.depth()]) {
      case STATE_PAREN:
        switch (chars.structChar(true)) {
          case CHAR_PAREN_OPEN:
            //
            // obviously not a key name; this must be an array.
            // I set the current state and value and also push
            // the "new" state on to the state stack.
            //
            valueStack.appendArrayValue(chars.pos, []);

            stateStack.replaceAndPush(
              chars.pos,
              STATE_ARRAY_AFTER_ELEMENT,
              STATE_PAREN
            );

            continue;

          case CHAR_PAREN_CLOSE:
            if (stateStack.depth(true) === -1) {
              if (chars.done()) {
                return chars.newEmptyValue();
              }
              throw new SyntaxError(Err.fmt(Err.MSG_EXTRACHARS, chars.pos));
            }

            valueStack.appendArrayValue(chars.pos, chars.newEmptyValue());

            if (stateStack.depth() === 0) {
              if (skipAmps) {
                chars.skipAmps();
              }
              if (chars.done()) {
                if (options.impliedArray) {
                  return valueStack.popArrayValue(options);
                }
                if (options.impliedObject) {
                  return valueStack.popObjectValue(options);
                }
                throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, chars.pos));
              }
            }
            continue;

          default:
            break;
        }

        //
        // run the limit check
        //
        valueStack.checkValueLimit(chars.pos);

        isEmptyObject = chars.isEmptyObject();
        if (isEmptyObject) {
          lv = {};
        } else {
          lv = chars.parseLiteral();
        }

        //
        // paren followed by a literal.  I need to lookahead
        // one token to see if this is an object or array.
        //
        errpos = chars.pos;

        switch (chars.structChar()) {
          case CHAR_AMP:
            if (!options.wwwFormUrlEncoded || stateStack.depth() > 0) {
              throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, errpos));
            }
          //
          // not calling parseSkipAmps() here because I can't think of a
          // use case that makes it necessary.
          //
          // fall through

          case CHAR_COMMA:
            //
            // multi-element array
            //
            //stateStack.replace(STATE_ARRAY_AFTER_ELEMENT);
            stateStack.replace(STATE_IN_ARRAY);
            valueStack.appendArrayValue(errpos, []);
            valueStack.push(lv);
            valueStack.popArrayValue(options);
            continue;

          case CHAR_PAREN_CLOSE:
            if (isEmptyObject) {
              valueStack.push({});
            } else {
              //
              // single element array
              //
              valueStack.appendArrayValue(errpos, [lv]);
            }

            switch (stateStack.depth(true)) {
              case -1:
                if (chars.pos === end) {
                  return valueStack[0];
                }
                throw new SyntaxError(Err.fmt(Err.MSG_EXTRACHARS, errpos));

              case 0:
                if (skipAmps) {
                  chars.skipAmps();
                }
                if (chars.done()) {
                  if (options.impliedArray) {
                    return valueStack.popArrayValue(options);
                  }
                  if (options.impliedObject) {
                    return valueStack.popObjectValue(options);
                  }
                  throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, errpos));
                }
                break;

              default:
                break;
            }

            continue;

          case CHAR_EQUALS:
            if (!options.wwwFormUrlEncoded || stateStack.depth() > 0) {
              throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, errpos));
            }
          // fall through

          case CHAR_COLON:
            //
            // key name for object
            //
            stateStack.replace(STATE_OBJECT_HAVE_KEY);
            valueStack.push({}, lv);
            continue;

          default:
            throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_LITERAL, errpos));
        }

      case STATE_IN_ARRAY:
        if (chars.accept(CHAR_PAREN_OPEN)) {
          stateStack.replaceAndPush(
            chars.pos,
            STATE_ARRAY_AFTER_ELEMENT,
            STATE_PAREN
          );
          continue;
        }

        valueStack.checkValueLimit(chars.pos);
        lv = chars.parseLiteral(false);

        if (skipAmps) {
          chars.skipAmps();
        }
        if (chars.done()) {
          if (stateStack.depth() === 0 && options.impliedArray) {
            valueStack.push(lv);
            return valueStack.popArrayValue(options);
          }
          throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, end));
        }

        stateStack.replace(STATE_ARRAY_AFTER_ELEMENT);
        valueStack.push(lv);
        continue;

      case STATE_ARRAY_AFTER_ELEMENT:
        valueStack.popArrayValue(options);

        switch (chars.structChar()) {
          case CHAR_AMP:
            if (!options.wwwFormUrlEncoded || stateStack.depth() > 0) {
              throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, chars.pos));
            }
          // fall through

          case CHAR_COMMA:
            stateStack.replace(STATE_IN_ARRAY);
            continue;

          case CHAR_PAREN_CLOSE:
            switch (stateStack.depth(true)) {
              case -1:
                //
                // end of a "real" composite
                //
                if (chars.done() && !options.impliedArray) {
                  return valueStack[0];
                }
                throw new SyntaxError(Err.fmt(Err.MSG_EXTRACHARS, chars.pos));

              case 0:
                if (skipAmps) {
                  chars.skipAmps();
                }
                //
                // end of an implied composite
                //
                if (chars.done()) {
                  if (options.impliedArray) {
                    return valueStack.popArrayValue(options);
                  }
                  if (options.impliedObject) {
                    return valueStack.popObjectValue(options);
                  }
                  throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, chars.pos));
                }
                break;
            }

            continue;
        }
        throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_MOREARRAY, chars.pos));

      case STATE_OBJECT_HAVE_KEY:
        if (chars.accept(CHAR_PAREN_OPEN)) {
          stateStack.replaceAndPush(
            chars.pos,
            STATE_OBJECT_AFTER_ELEMENT,
            STATE_PAREN
          );
          continue;
        }

        valueStack.checkValueLimit(chars.pos);
        lv = chars.parseLiteral(false);

        if (skipAmps) {
          chars.skipAmps();
        }
        if (chars.done()) {
          if (stateStack.depth() === 0 && options.impliedObject) {
            valueStack.push(lv);
            return valueStack.popObjectValue(options);
          }
          throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, end));
        }

        stateStack.replace(STATE_OBJECT_AFTER_ELEMENT);
        valueStack.push(lv);
        continue;

      case STATE_OBJECT_AFTER_ELEMENT:
        valueStack.popObjectValue(options);

        errpos = chars.pos;

        switch (chars.structChar()) {
          case CHAR_AMP:
            if (!options.wwwFormUrlEncoded || stateStack.depth() > 0) {
              throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, errpos));
            }
          // fall through

          case CHAR_COMMA:
            stateStack.replace(STATE_IN_OBJECT);
            continue;

          case CHAR_PAREN_CLOSE:
            switch (stateStack.depth(true)) {
              case -1:
                if (chars.done() && !options.impliedObject) {
                  //
                  // end of a "real" object
                  //
                  return valueStack[0];
                }
                throw new SyntaxError(Err.fmt(Err.MSG_EXTRACHARS, chars.pos));

              case 0:
                if (skipAmps) {
                  chars.skipAmps();
                }
                //
                // end of an implied composite
                //
                if (chars.done()) {
                  if (options.impliedArray) {
                    return valueStack.popArrayValue(options);
                  }
                  if (options.impliedObject) {
                    return valueStack.popObjectValue(options);
                  }
                  throw new SyntaxError(Err.fmt(Err.MSG_EXTRACHARS, chars.pos));
                }
                break;

              default:
                break;
            }

            continue;
        }
        throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_STRUCTCHAR, chars.pos));

      case STATE_IN_OBJECT:
        lv = chars.parseLiteral(true);

        if (skipAmps) {
          chars.skipAmps();
        }

        if (chars.done()) {
          if (options.impliedObject && stateStack.depth() == 0) {
            valueStack.push(lv, options.getMissingValue(lv));
            return valueStack.popObjectValue(options);
          }
          //
          // I don't know that this is actually possible -- I haven't
          // found a test case yet. But, if it is possible, it's an Err.
          //
          throw new SyntaxError(Err.fmt(Err.MSG_STILLOPEN, end));
        }

        switch (chars.structChar()) {
          case CHAR_EQUALS:
            if (!options.wwwFormUrlEncoded || stateStack.depth() > 0) {
              throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, chars.pos));
            }
          // fall through

          case CHAR_COLON:
            break;

          case CHAR_AMP:
            if (!options.wwwFormUrlEncoded || stateStack.depth() > 0) {
              throw new SyntaxError(Err.fmt(Err.MSG_BADCHAR, chars.pos));
            }
          // fall through
          case CHAR_COMMA:
            //
            // a key that's missing a value.
            //
            if (options.impliedObject && stateStack.depth() == 0) {
              // leave the current state in place
              // stateStack.replace(STATE_IN_OBJECT)
              valueStack.push(lv, options.getMissingValue(lv));
              valueStack.popObjectValue(options);
              continue;
            }
          // fall through

          default:
            throw new SyntaxError(Err.fmt(Err.MSG_EXPECT_OBJVALUE, chars.pos));
        }

        stateStack.replace(STATE_OBJECT_HAVE_KEY);
        valueStack.push(lv);
        continue;

      default:
        //
        // this shouldn't be possible, but handle it just in case
        //
        throw new SyntaxError(Err.fmt(Err.MSG_INTERNAL, chars.pos));
    }
  }
}

/**
 * A class for parsing JSON->URL text.
 * @public
 */
export class JsonURL {
  /**
   * Construct a new JsonURL class.
   *
   * Each instance of this class contains a number of properties that manage
   * the behavior of the parser and the values it returns; these are documented
   * below. The class instance does not manage parse state -- that is local to
   * the parse() function itself. As long as you don't need different
   * properties (e.g. limits, null value, etc) you may re-use the same Parser
   * instance, even by multiple Workers.
   * @param {Object} prop Initialization properties.
   * You may provide zero more more of the following. Reasonable defaults
   * are assumed.
   * @param {number} prop.maxParseDepth Maximum parse depth.
   * The parse() method will throw an Error if the depth
   * of the input exceeds this value. The default is 32.
   * @param {number} prop.maxParseValues Maximum number of values to parse.
   * The parse() method will throw an Error if it parses more than this
   * number of values. The default is 4096.
   * @param {number} prop.maxParseChars Maximum number of characters to parse.
   * The parse() method will throw an Error if it parses more than this
   * number of characters. The default is 32K.
   * @param {*} prop.emptyValue The value which represents the empty composite.
   * This may be any type. If it is a function then it will be called
   * until it resolves to something that is not a function. The default
   * is an empty Object.
   * @param {*} prop.nullValue The value which represents the null value.
   * This may be any type. If it is a function then it will be called
   * until it resolves to something that is not a function. The default
   * is null.
   * @deprecated this constructior will be removed and the JsonURL class
   * will simply have two static functions (mirroring the interface
   * of the JSON Object). These properties may be sent as options to
   * parse() and stringify().
   */
  constructor(prop) {
    while (typeof prop === "function") {
      prop = prop();
    }
    if (prop === undefined) {
      prop = {};
    }

    this.maxParseDepth =
      typeof prop.maxParseDepth === "number"
        ? parseInt(prop.maxParseDepth)
        : 1 << 5;

    this.maxParseValues =
      typeof prop.maxParseValues === "number"
        ? parseInt(prop.maxParseValues)
        : 1 << 12;

    this.maxParseChars =
      typeof prop.maxParseChars === "number"
        ? parseInt(prop.maxParseChars)
        : 1 << 15;

    this.emptyValue = prop.emptyValue === undefined ? {} : prop.emptyValue;

    this.nullValue = prop.nullValue === undefined ? null : prop.nullValue;
  }

  /**
   * Parse a literal value.
   * @deprecated This function will become private. Use parse()
   * instead.
   */
  parseLiteral(text, pos = 0, end = undefined, forceString = false, options) {
    if (text !== undefined) {
      text = String(text);
    }

    if (end === undefined) {
      end = text.length;
    }

    const p = newParser(text, pos, end, getJsonURLParseOptions(options));
    return p.parseLiteral(forceString);
  }

  /**
   * Parse JSON->URL text and return a JavaScript value.
   *
   * The `text` parameter must be provided as the first parameter. The
   * second parameter may be either the index into `text` where the
   * parse should start (a number) or an instance of
   * {@link JsonURLParseOptions}. If an offset is provided then the
   * third parameter may be either the index into `text` where the
   * parse should end (a number) or an instance of
   * {@link JsonURLParseOptions}. If the an end index is provided then
   * the forth parameter may be an instance of {@link JsonURLParseOptions}.
   *
   * @public
   * @param {string} text The text to parse.
   * @param {number|JsonURLParseOptions} offsetOrOpt index into `text` where parse
   * should start (a number) or JsonURLParseOptions.
   * @param {number|JsonURLParseOptions} endOrOpt index into `text` where parse
   * should end (a number) or JsonURLParseOptions.
   * @param {JsonURLParseOptions} options parse options.
   * @throws SyntaxError if there is a syntax error in the given text
   * @throws Error if a limit given in the constructor (or its default)
   * is exceeded.
   * @see JsonURLParseOptions
   */
  static parse(text, offsetOrOpt, endOrOpt, options) {
    return parse(text, offsetOrOpt, endOrOpt, options, undefined);
  }

  /**
   * Parse JSON->URL text.
   * @deprecated Use the static parse() function rather than this one.
   */
  parse(text, offsetOrOpt, endOrOpt, options) {
    return parse(text, offsetOrOpt, endOrOpt, options, this);
  }

  /**
   * A static method for coverting a JavaScript value to JSON->URL text.
   * @public
   * @param {*} value Any value
   * @param {JsonURLStringifyOptions} options stringify options.
   * @returns {string} JSON->URL text, or undefined if the given value
   * is undefined.
   * @see JsonURLStringifyOptions
   */
  static stringify(value, options) {
    if (value === undefined) {
      return undefined;
    }

    options = new JsonURLStringifyOptions(resolveFunction(options));

    if (value === null) {
      return toJsonURLText_Null(options);
    }

    return toJsonURLText(value, options, 0);
  }
}
