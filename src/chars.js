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
 * Bit for characters that are safe inside a non-quoted string as-is.
 */
export const IS_NSTRSAFE = 1 << 1;

/**
 * Bit for characters that are safe inside a quoted string as-is.
 */
export const IS_QSTRSAFE = 1 << 2;

/**
 * Bit for quote character
 */
export const IS_QUOTE = 1 << 3;

/**
 * Bit for structural characters
 */
export const IS_STRUCT = 1 << 4;

/**
 * Bit for structural characters
 */
export const IS_WFU = 1 << 5;

/**
 * IS_QSTRSAFE | IS_NSTRSAFE
 */
export const IS_ANY_STRSAFE = IS_QSTRSAFE | IS_NSTRSAFE;

/**
 * bits for US-ASCII characters.
 */
const CHARBITS_BASE = [
  // ASCII 0 - 15
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,

  // ASCII 16 - 31
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,

  //
  // ASCII 32 (space)
  //
  0,

  // ASCII 33 (!)
  IS_ANY_STRSAFE,

  // ASCII 34 (")
  0,

  // ASCII 35 (#)
  0,

  // ASCII 36 ($)
  IS_ANY_STRSAFE,

  // ASCII 37 (%)
  IS_ANY_STRSAFE,

  // ASCII 38 (&)
  IS_STRUCT | IS_WFU,

  // ASCII 39 (')
  IS_NSTRSAFE | IS_QUOTE,

  // ASCII 40 (lparen)
  IS_QSTRSAFE | IS_STRUCT,

  // ASCII 41 (rparen)
  IS_QSTRSAFE | IS_STRUCT,

  // ASCII 42 (*)
  IS_ANY_STRSAFE,

  // ASCII 43 (+)
  IS_ANY_STRSAFE,

  // ASCII 44 (,)
  IS_QSTRSAFE | IS_STRUCT,

  // ASCII 45 (-)
  IS_ANY_STRSAFE,

  // ASCII 46 (.)
  IS_ANY_STRSAFE,

  // ASCII 47 (/)
  IS_ANY_STRSAFE,

  // ASCII 48 (0)
  IS_ANY_STRSAFE,

  // ASCII 49 (1)
  IS_ANY_STRSAFE,

  // ASCII 50 (2)
  IS_ANY_STRSAFE,

  // ASCII 51 (3)
  IS_ANY_STRSAFE,

  // ASCII 52 (4)
  IS_ANY_STRSAFE,

  // ASCII 53 (5)
  IS_ANY_STRSAFE,

  // ASCII 54 (6)
  IS_ANY_STRSAFE,

  // ASCII 55 (7)
  IS_ANY_STRSAFE,

  // ASCII 56 (8)
  IS_ANY_STRSAFE,

  // ASCII 57 (9)
  IS_ANY_STRSAFE,

  // ASCII 58 (:)
  IS_QSTRSAFE | IS_STRUCT,

  // ASCII 59 (;)
  IS_ANY_STRSAFE,

  // ASCII 60 (<)
  0,

  // ASCII 61 (=)
  IS_STRUCT | IS_WFU,

  // ASCII 62 (>)
  0,

  // ASCII 63 (?)
  IS_ANY_STRSAFE,

  // ASCII 64 (@)
  IS_ANY_STRSAFE,

  // ASCII 65 (A)
  IS_ANY_STRSAFE,

  // ASCII 66 (B)
  IS_ANY_STRSAFE,

  // ASCII 67 (C)
  IS_ANY_STRSAFE,

  // ASCII 68 (D)
  IS_ANY_STRSAFE,

  // ASCII 69 (E)
  IS_ANY_STRSAFE,

  // ASCII 70 (F)
  IS_ANY_STRSAFE,

  // ASCII 71 (G)
  IS_ANY_STRSAFE,

  // ASCII 72 (H)
  IS_ANY_STRSAFE,

  // ASCII 73 (I)
  IS_ANY_STRSAFE,

  // ASCII 74 (J)
  IS_ANY_STRSAFE,

  // ASCII 75 (K)
  IS_ANY_STRSAFE,

  // ASCII 76 (L)
  IS_ANY_STRSAFE,

  // ASCII 77 (M)
  IS_ANY_STRSAFE,

  // ASCII 78 (N)
  IS_ANY_STRSAFE,

  // ASCII 79 (O)
  IS_ANY_STRSAFE,

  // ASCII 80 (P)
  IS_ANY_STRSAFE,

  // ASCII 81 (Q)
  IS_ANY_STRSAFE,

  // ASCII 82 (R)
  IS_ANY_STRSAFE,

  // ASCII 83 (S)
  IS_ANY_STRSAFE,

  // ASCII 84 (T)
  IS_ANY_STRSAFE,

  // ASCII 85 (U)
  IS_ANY_STRSAFE,

  // ASCII 86 (V)
  IS_ANY_STRSAFE,

  // ASCII 87 (W)
  IS_ANY_STRSAFE,

  // ASCII 88 (X)
  IS_ANY_STRSAFE,

  // ASCII 89 (Y)
  IS_ANY_STRSAFE,

  // ASCII 90 (Z)
  IS_ANY_STRSAFE,

  // ASCII 91 ([)
  0,

  // ASCII 92 (backslash)
  0,

  // ASCII 93 (])
  0,

  // ASCII 94 (^)
  0,

  // ASCII 95 (_)
  IS_ANY_STRSAFE,

  // ASCII 96 (`)
  0,

  // ASCII 97 (a)
  IS_ANY_STRSAFE,

  // ASCII 98 (b)
  IS_ANY_STRSAFE,

  // ASCII 99 (c)
  IS_ANY_STRSAFE,

  // ASCII 100 (d)
  IS_ANY_STRSAFE,

  // ASCII 101 (e)
  IS_ANY_STRSAFE,

  // ASCII 102 (f)
  IS_ANY_STRSAFE,

  // ASCII 103 (g)
  IS_ANY_STRSAFE,

  // ASCII 104 (h)
  IS_ANY_STRSAFE,

  // ASCII 105 (i)
  IS_ANY_STRSAFE,

  // ASCII 106 (j)
  IS_ANY_STRSAFE,

  // ASCII 107 (k)
  IS_ANY_STRSAFE,

  // ASCII 108 (l)
  IS_ANY_STRSAFE,

  // ASCII 109 (m)
  IS_ANY_STRSAFE,

  // ASCII 110 (n)
  IS_ANY_STRSAFE,

  // ASCII 111 (o)
  IS_ANY_STRSAFE,

  // ASCII 112 (p)
  IS_ANY_STRSAFE,

  // ASCII 113 (q)
  IS_ANY_STRSAFE,

  // ASCII 114 (r)
  IS_ANY_STRSAFE,

  // ASCII 115 (s)
  IS_ANY_STRSAFE,

  // ASCII 116 (t)
  IS_ANY_STRSAFE,

  // ASCII 117 (u)
  IS_ANY_STRSAFE,

  // ASCII 118 (v)
  IS_ANY_STRSAFE,

  // ASCII 119 (w)
  IS_ANY_STRSAFE,

  // ASCII 120 (x)
  IS_ANY_STRSAFE,

  // ASCII 121 (y)
  IS_ANY_STRSAFE,

  // ASCII 122 (z)
  IS_ANY_STRSAFE,

  // ASCII 123 ({)
  0,

  // ASCII 124 (|)
  0,

  // ASCII 125 (})
  0,

  // ASCII 126 (~)
  IS_ANY_STRSAFE,

  // ASCII 127
  0,
];

export function lookup(c) {
  return c > 127 ? 0 : CHARBITS_BASE[c];
}
