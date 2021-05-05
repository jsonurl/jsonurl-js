# JSON&#x2192;URL
[![License: MIT](https://img.shields.io/github/license/jsonurl/jsonurl-js.svg?label=License)][license]
[![NPM version](https://img.shields.io/npm/v/@jsonurl/jsonurl.svg)](https://www.npmjs.com/package/@jsonurl/jsonurl)
[![CI](https://github.com/jsonurl/jsonurl-js/workflows/ci/badge.svg?branch=main)](https://github.com/jsonurl/jsonurl-js/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=jsonurl-js&metric=alert_status)](https://sonarcloud.io/dashboard?id=jsonurl-js)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jsonurl-js&metric=coverage)](https://sonarcloud.io/dashboard?id=jsonurl-js)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=jsonurl-js&metric=ncloc)](https://sonarcloud.io/dashboard?id=jsonurl-js)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jsonurl-js&metric=security_rating)](https://sonarcloud.io/dashboard?id=jsonurl-js)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=jsonurl-js&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=jsonurl-js)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jsonurl-js&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=jsonurl-js)
[![Known Vulnerabilities](https://snyk.io/test/github/jsonurl/jsonurl-js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jsonurl/jsonurl-js?targetFile=package.json)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjsonurl%2Fjsonurl-js.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjsonurl%2Fjsonurl-js?ref=badge_shield)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-green)](CONTRIBUTING.md)
[![project chat](https://img.shields.io/badge/zulip-join_chat-brightgreen.svg)](https://jsonurl.zulipchat.com/)

## About
[RFC8259][RFC8259] describes the JSON data model and interchange format, which is widely
used in application-level protocols including RESTful APIs. It is common for
applications to request resources via the HTTP POST method, with JSON entities.
However, POST is suboptimal for requests which do not modify a resource's
state. JSON&#x2192;URL defines a text format for the JSON data model suitable
for use within a [URL][RFC1738]/[URI][RFC3986].

## Usage
JSON&#x2192;URL is available as a commonjs module (suitable for use in Node), ES6
module, or a script that may be used directly in a browser.

### NPM install
```sh
npm install @jsonurl/jsonurl --save
```

### CJS
```js
const JsonURL = require("@jsonurl/jsonurl");
```
### ES6 (Node + Babel)
```js
import JsonURL from "@jsonurl/jsonurl";
```
### Browser script tag
```html
<script
    src="https://cdn.jsdelivr.net/npm/@jsonurl/jsonurl@1.1.4"
    integrity="sha384-cAoahJrz7ddx7/ssU1HF42WDaFsYMPIq+INgCzl/qgMHuLWQU+jLtnWzTvJPOcpe"
    crossorigin="anonymous"></script>
```

### The JavaScript API
Once included, the API is the same for all three.
```js
let value = JsonURL.parse( "(Hello:World!)" );
let string = JsonURL.stringify( value );
```
There are options available, but that's all you need to get started.

JSON&#x2192;URL has no runtime dependencies.

## Security
The parser is designed to parse untrusted input. It supports limits on
the number of parsed values and depth of nested arrays or objects.
When the limit is exceeded an Error is thrown, and sane limit values are
set by default.

[RFC8259]: https://tools.ietf.org/html/rfc8259
[RFC3986]: https://tools.ietf.org/html/rfc3986
[RFC1738]: https://tools.ietf.org/html/rfc1738
[license]: https://opensource.org/licenses/MIT


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjsonurl%2Fjsonurl-js.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjsonurl%2Fjsonurl-js?ref=badge_large)
