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

const fs = require("fs");
const pkg = require("./package.json");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const expected = "(hello:world)";

function assert(actual) {
  if (actual !== expected) {
    console.log(
      pkg.description,
      ": expected '" + expected + "' but received '" + actual + "'"
    );

    process.exit(1);
  }
}

function run(script) {
  const jsonurlScript =
    "<script>" + fs.readFileSync("../../dist/jsonurl.min.js") + "</script>";

  const testScript =
    "<script>\n" +
    "const expected = '" +
    expected +
    "';\n" +
    "const result = " +
    script +
    "document.body.querySelector('p').innerHTML=result;\n" +
    "</script>\n";

  const html =
    "<!DOCTYPE html><body>" +
    "<p>Placeholder</p>" +
    jsonurlScript +
    testScript +
    "</body>";

  const dom = new JSDOM(html, {
    url: "https://jsonurl.org/",
    referrer: "https://jsonurl.org/",
    contentType: "text/html",
    includeNodeLocations: true,
    runScripts: "dangerously",
  });

  assert(dom.window.document.body.querySelector("p").textContent);
}

run("JsonURL.stringify(new JsonURL().parse(expected));\n");
run("JsonURL.stringify(JsonURL.parse(expected));\n");
