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

export const MSG_EXPECT_STRUCTCHAR =
  "JSON->URL: expected comma, open paren, or close paren";
export const MSG_EXPECT_MOREARRAY = "JSON->URL: expected comma or close paren";
export const MSG_EXPECT_VALUE = "JSON->URL: expected value";
export const MSG_EXPECT_LITERAL = "JSON->URL: expected literal value";
export const MSG_BADCHAR = "JSON->URL: unexpected character";
export const MSG_INTERNAL = "JSON->URL: internal error";
export const MSG_STILLOPEN =
  "JSON->URL: unexpected end of text inside composite";
export const MSG_EXTRACHARS = "JSON->URL: unexpected text after composite";
export const MSG_LIMIT_MAXCHARS = "JSON->URL: MaxParseChars exceeded";
export const MSG_LIMIT_MAXDEPTH = "JSON->URL: MaxParseDepth exceeded";
export const MSG_LIMIT_MAXVALUES = "JSON->URL: MaxParseValues exceeded";
export const MSG_EXPECT_QUOTE = "JSON->URL: quoted string still open";
export const MSG_IMPLIED_STRING_NULL =
  "JSON->URL: can not represent null with implied strings";
export const MSG_IMPLIED_STRING_EMPTY =
  "JSON->URL: the empty string is not allowed";
export const MSG_BAD_ESCAPE = "JSON->URL: invalid escape sequence";
export const MSG_BAD_PCTENC = "JSON->URL: invalid percent-encoded sequence";
export const MSG_EXPECT_OBJVALUE = "JSON->URL: expected object value";

export function fmt(msg, pos) {
  return pos === undefined ? msg : msg + " at position " + pos;
}
