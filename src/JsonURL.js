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

const rx_decode_space = /\+/g;
const rx_encode_pctspace = /%20/g;
const rx_encode_space = / /g;

//
// patterns for use with regex.test().
// DO NOT PUT //g ON THESE!!!
//
const rx_encode_string_safe = /^[-A-Za-z0-9._~!$*;=@?/ ][-A-Za-z0-9._~!$*;=@?/' ]*$/;
const rx_encode_string_qsafe = /^[-A-Za-z0-9._~!$*,;=@?/(),: ]+$/;
const rx_encode_quoted_literal = /^(?:true|false|null|(?:[-]?[0-9]+(?:[.][0-9]+)?(?:[eE][-+]?[0-9]+)?))$/;

const CHAR_BANG = 0x21;
const CHAR_DOLAR = 0x24;
const CHAR_PERCENT = 0x25;
const CHAR_QUOTE = 0x27;
const CHAR_PAREN_OPEN = 0x28;
const CHAR_PAREN_CLOSE = 0x29;
const CHAR_STAR = 0x2a;
const CHAR_PLUS = 0x2b;
const CHAR_COMMA = 0x2c;
const CHAR_DASH = 0x2d;
const CHAR_DOT = 0x2e;
const CHAR_SOLIDUS = 0x2f;
const CHAR_COLON = 0x3a;
const CHAR_SEMICOLON = 0x3b;
const CHAR_QUESTION = 0x3f;
const CHAR_AT = 0x40;
const CHAR_UNDERSCORE = 0x5f;
const CHAR_TILDE = 0x7e;

const CHAR_0 = 0x30;
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

const ERR_MSG_EXPECT_STRUCTCHAR =
  "JSON->URL: expected comma, open paren, or close paren";
const ERR_MSG_EXPECT_VALUE = "JSON->URL: expected value";
const ERR_MSG_EXPECT_LITERAL = "JSON->URL: expected literal value";
const ERR_MSG_EXPECT_OBJVALUE = "JSON->URL: expected object value";
const ERR_MSG_BADCHAR = "JSON->URL: unexpected character";
const ERR_MSG_INTERNAL = "JSON->URL: internal error";
const ERR_MSG_STILLOPEN = "JSON->URL: unexpected end of text inside composite";
const ERR_MSG_EXTRACHARS = "JSON->URL: unexpected text after composite";
const ERR_MSG_LIMIT_MAXCHARS = "JSON->URL: MaxParseChars exceeded";
const ERR_MSG_LIMIT_MAXDEPTH = "JSON->URL: MaxParseDepth exceeded";
const ERR_MSG_LIMIT_MAXVALUES = "JSON->URL: MaxParseValues exceeded";

function parseDigitsLength(text, i, len) {
  var ret = 0;

  for (; i < len; i++) {
    switch (text.charCodeAt(i)) {
      case 0x30:
      case 0x31:
      case 0x32:
      case 0x33:
      case 0x34:
      case 0x35:
      case 0x36:
      case 0x37:
      case 0x38:
      case 0x39:
        ret++;
        continue;
      default:
        return ret;
    }
  }
  return ret;
}

function parseExponentLength(text, i, len) {
  var ret = 0;

  switch (text.charCodeAt(i)) {
    case CHAR_E:
    case CHAR_e:
      i++;
      ret++;
      break;
    default:
      return 0;
  }

  switch (text.charCodeAt(i)) {
    case CHAR_PLUS:
    case CHAR_DASH:
      i++;
      ret++;
      break;
    default:
      break;
  }

  let dlen = parseDigitsLength(text, i, len);

  //
  // this is subtle and worth an explanation.
  //
  // dlen === 0 iff we find [eE][-+]? but no digits following it.
  // That's not a valid number literal, so we return 0.
  //
  return dlen === 0 ? 0 : ret + dlen;
}

function parseFractionLength(text, i, len) {
  var c = text.charCodeAt(i);
  if (c !== CHAR_DOT) {
    return 0;
  }

  let dlen = parseDigitsLength(text, i + 1, len);

  //
  // this is subtle and worth an explanation.
  //
  // dlen === 0 iff there is a decimal point but no digits following it.
  // That's not a valid number literal, so we return 0.
  //
  return dlen === 0 ? 0 : 1 + dlen;
}

function parseIntegerLength(text, i, len) {
  var c = text.charCodeAt(i);
  if (c === CHAR_0) {
    return 1;
  }

  return parseDigitsLength(text, i, len);
}

function newEmptyValue(p) {
  if (typeof p.emptyValue === "function") {
    return new p.emptyValue();
  }
  return p.emptyValue;
}

function errorMessage(msg, pos) {
  if (pos === undefined) {
    return msg;
  }

  return msg + " at position " + pos;
}

function parseLiteralLength(text, i, len, errmsg) {
  var isQuote = false;
  var start = i;

  if (i === len) {
    throw new SyntaxError(errorMessage(errmsg, i));
  }
  if (text.charCodeAt(i) === CHAR_QUOTE) {
    isQuote = true;
    i++;
  }
  for (; i < len; i++) {
    var c = text.charCodeAt(i);
    if (c >= 0x41 && c <= 0x5a) {
      // A-Z
      continue;
    }
    if (c >= 0x61 && c <= 0x7a) {
      // a-z
      continue;
    }
    if (c >= 0x30 && c <= 0x39) {
      // 0-9
      continue;
    }
    switch (c) {
      case CHAR_QUOTE:
        if (isQuote) {
          return i + 1;
        }
      // fallthrough
      case CHAR_DASH:
      case CHAR_DOT:
      case CHAR_UNDERSCORE:
      case CHAR_TILDE:
      case CHAR_PERCENT:
      case CHAR_BANG:
      case CHAR_DOLAR:
      case CHAR_STAR:
      case CHAR_PLUS:
      case CHAR_SEMICOLON:
      case CHAR_SOLIDUS:
      case CHAR_QUESTION:
      case CHAR_AT:
        continue;
      case CHAR_COMMA:
      case CHAR_COLON:
      case CHAR_PAREN_OPEN:
      case CHAR_PAREN_CLOSE:
        if (!isQuote) {
          if (i === start) {
            throw new SyntaxError(errorMessage(errmsg, start));
          }
          return i;
        }
        continue;
      default:
        throw new SyntaxError(errorMessage(ERR_MSG_BADCHAR, i));
    }
  }

  return len;
}

function toJsonURLText_Boolean() {
  return this === true ? "true" : "false";
}
function toJsonURLText_Number() {
  return String(this);
}
function toJsonURLText_String(isKey) {
  if (this.length === 0) {
    return "''";
  }

  if (rx_encode_quoted_literal.test(this)) {
    //
    // if this string looks like a Boolean, Number, or ``null'' literal
    // then it must be quoted
    //
    if (isKey === true) {
      return this;
    }
    if (this.indexOf("+") == -1) {
      return "'" + this + "'";
    }

    //
    // if the string needs to be encoded then it no longer looks like a
    // literal and does not needs to be quoted.
    //
    return encodeURIComponent(this);
    // return "'" + encodeURIComponent(this) + "'";
  }
  if (rx_encode_string_safe.test(this)) {
    //
    // safe to use as long as I encode spaces
    //
    if (this.indexOf(" ") == -1) {
      return this;
    }
    return this.replace(rx_encode_space, "+");
  }
  if (rx_encode_string_qsafe.test(this)) {
    //
    // safe to use as long as I quote it and encode spaces
    //
    if (this.indexOf(" ") == -1) {
      return "'" + this + "'";
    }
    return "'" + this.replace(rx_encode_space, "+") + "'";
  }

  let ret = encodeURIComponent(this);
  ret = ret.replace(rx_encode_pctspace, "+");

  if (ret.charCodeAt(0) == CHAR_QUOTE) {
    //
    // I need to encode the leading quote
    //
    return "%27" + ret.substring(1);
  }

  return ret;
}

function toJsonURLText_Array() {
  var ret = undefined;

  this.forEach(function (e) {
    while (typeof e === "function") {
      e = e();
    }

    if (e === undefined || e === null) {
      if (ret === undefined) {
        ret = "null";
      } else {
        ret += ",null";
      }
      return;
    }

    if (ret === undefined) {
      ret = e.toJsonURLText();
    } else {
      ret += "," + e.toJsonURLText();
    }
  });

  return ret === undefined ? "()" : "(" + ret + ")";
}

function toJsonURLText_Object() {
  var ret = undefined;
  var keys = Object.keys(this);
  var obj = this;

  keys.forEach(function (k) {
    if (k === undefined || k === null) {
      return;
    }

    var v = obj[k];
    while (typeof v === "function") {
      v = v();
    }

    var jk = k.toJsonURLText(true);
    var jv = v === undefined || v === null ? "null" : v.toJsonURLText();

    if (ret === undefined) {
      ret = jk + ":" + jv;
    } else {
      ret += "," + jk + ":" + jv;
    }
  });

  return ret === undefined ? "()" : "(" + ret + ")";
}

Object.defineProperty(Array.prototype, "toJsonURLText", {
  value: toJsonURLText_Array,
});
Object.defineProperty(Boolean.prototype, "toJsonURLText", {
  value: toJsonURLText_Boolean,
});
Object.defineProperty(Number.prototype, "toJsonURLText", {
  value: toJsonURLText_Number,
});
Object.defineProperty(Object.prototype, "toJsonURLText", {
  value: toJsonURLText_Object,
});
Object.defineProperty(String.prototype, "toJsonURLText", {
  value: toJsonURLText_String,
});

/**
 * A class for managing values during parse
 */
class StateStack extends Array {
  constructor(parser) {
    super();
    this.parser = parser;
    this._depth = 0;
  }

  /**
   * Replace the current state with R and push state P.
   * @param s replacement state
   * @param p state to push
   */
  replaceAndPush(pos, r, p) {
    this[this._depth] = r;

    if (++this._depth >= this.parser.maxParseDepth) {
      throw new Error(errorMessage(ERR_MSG_LIMIT_MAXDEPTH, pos));
    }

    this.push(p);
  }

  /**
   * Replace the current state with R.
   * @param r replacement state
   */
  replace(r) {
    this[this._depth] = r;
  }

  /**
   * Get current depth, optionally popping the top of the stack.
   */
  depth(pop = false) {
    if (pop) {
      this._depth--;
      this.pop();
    }
    return this._depth;
  }
}

/**
 * A class for managing values during parse
 */
class ValueStack extends Array {
  constructor(parser) {
    super();
    this.parser = parser;
    this.numValues = 0;
  }

  /**
   * Pop an object key/value off the stack and assign the value in a target.
   * @returns the target
   */
  popObjectValue(value) {
    value = value || this.pop();
    let key = this.pop();
    let target = this[this.length - 1];

    target[key] = value;

    return target;
  }

  /**
   * Pop a value off the stack and append it to a target.
   * @returns the target
   */
  popArrayValue(value) {
    value = value || this.pop();
    let target = this[this.length - 1];

    target.push(value);

    return target;
  }

  /**
   * Check the currect value count against the configured maximum
   * @param {number} pos the position of the value in the text
   * @param {number} count the increment value
   */
  checkValueLimit(pos, count = 1) {
    this.numValues += count;

    if (this.numValues > this.parser.maxParseValues + 1) {
      throw new Error(errorMessage(ERR_MSG_LIMIT_MAXVALUES, pos));
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

/**
 * A class for parsing JSON->URL text.
 */
class JsonURL {
  /**
   * Construct a new JsonURL class.
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
   * @param {string} text The text to parse.
   * @param {number} pos The position in *text* to parse.
   * @param {number} end The poistion in *text* to stop parsing.
   * @param {boolean} forceString True if the resulting literal should be
   * a string, such as in the case of an object key.
   */
  parseLiteral(text, pos = 0, end = text.length, forceString = false) {
    let c1, c2, c3, c4, c5;

    switch (end - pos) {
      case 4:
        c1 = text.charCodeAt(pos);
        c2 = text.charCodeAt(pos + 1);
        c3 = text.charCodeAt(pos + 2);
        c4 = text.charCodeAt(pos + 3);
        if (c1 === CHAR_t && c2 === CHAR_r && c3 === CHAR_u && c4 === CHAR_e)
          return forceString ? "true" : true;
        if (c1 === CHAR_n && c2 === CHAR_u && c3 === CHAR_l && c4 === CHAR_l)
          return forceString ? "null" : this.nullValue;
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
        )
          return forceString ? "false" : false;
        break;
      default:
        break;
    }

    var isQuotedString = false;
    var isNumIndex = pos;

    var c = text.charCodeAt(pos);
    switch (c) {
      case CHAR_DASH:
        isNumIndex++;
        break;
      case CHAR_QUOTE:
        isQuotedString = true;
        break;
      default:
        break;
    }

    if (!isQuotedString) {
      let numIntLen = parseIntegerLength(text, isNumIndex, end);

      if (numIntLen > 0) {
        isNumIndex += numIntLen;
        isNumIndex += parseFractionLength(text, isNumIndex, end);
        isNumIndex += parseExponentLength(text, isNumIndex, end);

        if (isNumIndex === end) {
          //
          // this literal is a number
          //
          var s = text.substring(pos, end);
          return forceString ? s : Number(s);
        }
      }
    }

    //
    // this is a string
    //
    var ret;

    if (isQuotedString) {
      ret = text.substring(pos + 1, end - 1);
    } else {
      ret = text.substring(pos, end);
    }

    ret = ret.replace(rx_decode_space, " ");
    ret = decodeURIComponent(ret);

    return ret;
  }

  /**
   * Parse JSON->URL text.
   * @param {string} text The text to parse.
   * @throws SyntaxError if there is a syntax error in the given text
   * @throws Error if a limit given in the constructor (or its default)
   * is exceeded.
   */
  parse(text, options = {}) {
    text = String(text);

    let end = text.length;

    if (end === 0) {
      return undefined;
    }

    if (end > this.maxParseChars) {
      throw new Error(ERR_MSG_LIMIT_MAXCHARS);
    }

    let valueStack = new ValueStack(this);
    let stateStack = new StateStack(this);
    let pos = 0;

    if (options.impliedObject) {
      valueStack.push(options.impliedObject);
      stateStack.push(STATE_IN_OBJECT);
    } else if (options.impliedArray) {
      valueStack.push(options.impliedArray);
      stateStack.push(STATE_IN_ARRAY);
    } else if (text.charCodeAt(0) !== CHAR_PAREN_OPEN) {
      //
      // not composite; parse as a single literal value
      //
      // Note, I could remove the call to parseLiteralLength() and
      // just assume the whole text is a literal. The consequence is
      // that there would be values which are valid top-level literals
      // (specifically, non-quoted strings could include non-encoded
      // structural characters) but not valid when inside a composite.
      // I don't think I want that.
      //
      let lvpos = parseLiteralLength(text, 0, end, ERR_MSG_EXPECT_LITERAL);
      if (lvpos !== end) {
        throw new SyntaxError(errorMessage(ERR_MSG_EXPECT_LITERAL, 0));
      }

      return this.parseLiteral(text, 0, end, false);
    } else {
      stateStack.push(STATE_PAREN);
      pos = 1;
    }

    for (;;) {
      if (pos === end) {
        throw new SyntaxError(errorMessage(ERR_MSG_STILLOPEN, pos));
      }

      let c = text.charCodeAt(pos);

      //
      // literal value and literal value position
      //
      let lv, lvpos;

      switch (stateStack[stateStack.depth()]) {
        case STATE_PAREN:
          switch (c) {
            case CHAR_PAREN_OPEN:
              //
              // obviously not a key name; this must be an array.
              // I set the current state and value and also push
              // the "new" state on to the state stack.
              //
              valueStack.appendArrayValue(pos, []);

              stateStack.replaceAndPush(
                pos,
                STATE_ARRAY_AFTER_ELEMENT,
                STATE_PAREN
              );

              pos++;
              continue;

            case CHAR_PAREN_CLOSE:
              if (stateStack.depth(true) === -1) {
                if (pos + 1 != end) {
                  throw new SyntaxError(errorMessage(ERR_MSG_EXTRACHARS, pos));
                }
                if (valueStack.length === 0) {
                  return newEmptyValue(this);
                }
                return valueStack[0];
              }

              valueStack.appendArrayValue(pos, newEmptyValue(this));
              pos++;
              continue;

            default:
              break;
          }

          //
          // paren followed by a literal.  I need to lookahead
          // one token to see if this is an object or array.
          //
          lvpos = parseLiteralLength(text, pos, end, ERR_MSG_EXPECT_VALUE);
          if (lvpos === end) {
            throw new SyntaxError(errorMessage(ERR_MSG_STILLOPEN, end));
          }

          //
          // run the limit check before parsing the literal
          //
          valueStack.checkValueLimit(pos);

          c = text.charCodeAt(lvpos);
          lv = this.parseLiteral(text, pos, lvpos, c === CHAR_COLON);
          pos = lvpos;

          switch (c) {
            case CHAR_COMMA:
              //
              // multi-element array
              //
              stateStack.replace(STATE_ARRAY_AFTER_ELEMENT);
              valueStack.appendArrayValue(pos, []);
              valueStack.push(lv);
              continue;

            case CHAR_PAREN_CLOSE:
              //
              // single element array
              //
              valueStack.appendArrayValue(pos, [lv]);

              if (stateStack.depth(true) === -1) {
                if (pos + 1 === end) {
                  return valueStack[0];
                }
                throw new SyntaxError(errorMessage(ERR_MSG_EXTRACHARS, pos));
              }

              pos++;
              continue;

            case CHAR_COLON:
              //
              // key name for object
              //
              stateStack.replace(STATE_OBJECT_HAVE_KEY);
              valueStack.push({}, lv);
              pos++;
              continue;

            default:
              throw new SyntaxError(errorMessage(ERR_MSG_EXPECT_LITERAL, pos));
          }

        case STATE_IN_ARRAY:
          if (c === CHAR_PAREN_OPEN) {
            stateStack.replaceAndPush(
              pos,
              STATE_ARRAY_AFTER_ELEMENT,
              STATE_PAREN
            );
            pos++;
            continue;
          }

          lvpos = parseLiteralLength(text, pos, end, ERR_MSG_EXPECT_VALUE);

          valueStack.checkValueLimit(pos);
          lv = this.parseLiteral(text, pos, lvpos, false);
          pos = lvpos;

          if (lvpos === end) {
            if (stateStack.depth() === 0 && options.impliedArray) {
              return valueStack.popArrayValue(lv);
            }
            throw new SyntaxError(errorMessage(ERR_MSG_STILLOPEN, end));
          }

          stateStack.replace(STATE_ARRAY_AFTER_ELEMENT);
          valueStack.push(lv);
          continue;

        case STATE_ARRAY_AFTER_ELEMENT:
          valueStack.popArrayValue();

          switch (c) {
            case CHAR_COMMA:
              stateStack.replace(STATE_IN_ARRAY);
              pos++;
              continue;

            case CHAR_PAREN_CLOSE:
              switch (stateStack.depth(true)) {
                case -1:
                  //
                  // end of a "real" composite
                  //
                  if (pos + 1 == end) {
                    return valueStack[0];
                  }
                  throw new SyntaxError(errorMessage(ERR_MSG_EXTRACHARS, pos));

                case 0:
                  //
                  // end of an implied composite
                  //
                  if (pos + 1 == end) {
                    if (options.impliedArray) {
                      return valueStack.popArrayValue();
                    }
                    if (options.impliedObject) {
                      return valueStack.popObjectValue();
                    }
                  }
                  break;
              }

              pos++;
              continue;
          }
          throw new SyntaxError(errorMessage(ERR_MSG_EXPECT_STRUCTCHAR, pos));

        case STATE_OBJECT_HAVE_KEY:
          if (c === CHAR_PAREN_OPEN) {
            stateStack.replaceAndPush(
              pos,
              STATE_OBJECT_AFTER_ELEMENT,
              STATE_PAREN
            );
            pos++;
            continue;
          }

          lvpos = parseLiteralLength(text, pos, end, ERR_MSG_EXPECT_VALUE);

          valueStack.checkValueLimit(pos);
          lv = this.parseLiteral(text, pos, lvpos, false);
          pos = lvpos;

          if (lvpos === end) {
            if (stateStack.depth() === 0 && options.impliedObject) {
              return valueStack.popObjectValue(lv);
            }
            throw new SyntaxError(errorMessage(ERR_MSG_STILLOPEN, end));
          }

          stateStack.replace(STATE_OBJECT_AFTER_ELEMENT);
          valueStack.push(lv);
          continue;

        case STATE_OBJECT_AFTER_ELEMENT:
          valueStack.popObjectValue();

          switch (c) {
            case CHAR_COMMA:
              stateStack.replace(STATE_IN_OBJECT);
              pos++;
              continue;

            case CHAR_PAREN_CLOSE:
              switch (stateStack.depth(true)) {
                case -1:
                  if (pos + 1 === end) {
                    //
                    // end of a "real" object
                    //
                    return valueStack[0];
                  }
                  throw new SyntaxError(errorMessage(ERR_MSG_EXTRACHARS, pos));
                case 0:
                  //
                  // end of an implied composite
                  //
                  if (pos + 1 == end) {
                    if (options.impliedArray) {
                      return valueStack.popArrayValue();
                    }
                    if (options.impliedObject) {
                      return valueStack.popObjectValue();
                    }
                  }
                  break;
              }

              pos++;
              continue;
          }
          throw new SyntaxError(errorMessage(ERR_MSG_EXPECT_STRUCTCHAR, pos));

        case STATE_IN_OBJECT:
          lvpos = parseLiteralLength(text, pos, end, ERR_MSG_EXPECT_LITERAL);
          if (lvpos === end) {
            throw new SyntaxError(errorMessage(ERR_MSG_STILLOPEN, end));
          }

          c = text.charCodeAt(lvpos);
          if (c !== CHAR_COLON) {
            throw new SyntaxError((ERR_MSG_EXPECT_OBJVALUE, lvpos));
          }

          lv = this.parseLiteral(text, pos, lvpos, true);
          pos = lvpos + 1;

          stateStack.replace(STATE_OBJECT_HAVE_KEY);
          valueStack.push(lv);
          continue;

        default:
          throw new SyntaxError(errorMessage(ERR_MSG_INTERNAL, pos));
      }
    }
  }

  /**
   * A static method for coverting a JavaScript value to JSON->URL text.
   * @param {*} value Any value
   * @returns {string} JSON->URL text, or undefined if the given value
   * is undefined.
   */
  static stringify(value) {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return "null";
    }
    return value.toJsonURLText();
  }
}

export { JsonURL as default };
