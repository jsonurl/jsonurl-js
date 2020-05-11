# JSON->URL
[![License: MIT](https://img.shields.io/github/license/jsonurl/jsonurl-js.svg?label=License)](https://opensource.org/licenses/MIT)

## About
RFC8259 describes the JSON data model and interchange format, which is widely
used in application-level protocols including RESTful APIs. It is common for
applications to request resources via the HTTP POST method, with JSON entities,
however, POST is suboptimal for requests which do not modify a resource's
state. JSON->URL defines a text format for the JSON data model suitable for use
within a URL/URI (as described by RFC3986).

## The JavaScript API
JSON->URL is available as a commonjs module (suitable for use in Node), ES6
module, or a script that may be used directly in a browser. The API is the
same for all three.
```js
let p = new JsonURL();
let value = p.parse( "(Hello:World!)" );
```
There are options available, but that's all you need to get started.