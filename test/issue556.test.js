import { JsonURL } from "../src/JsonURL.js";

test("aqf implied array e empty", function () {
    expect(JsonURL.parse("e,!e", { AQF: true, impliedArray: [] })).toStrictEqual(
        ["e", ""])
})
test("aqf implied array empty e", function () {
    expect(JsonURL.parse("!e,e", { AQF: true, impliedArray: [] })).toStrictEqual(["", "e"]);
})
test("aqf explicit array e empty", function () {
    expect(JsonURL.parse("(e,!e)", { AQF: true })).toStrictEqual(
        ["e", ""]);
})

test("aqf implied dict e:empty", function () {
    expect(JsonURL.parse("e:!e", { AQF: true, impliedObject: {} })).toStrictEqual(
        { "e": "" });
})
test("aqf explicit dict e:empty", function () {
    expect(JsonURL.parse("(e:!e)", { AQF: true })).toStrictEqual(
        { "e": "" });
})
test("aqf implied dict empty:e", function () {
    expect(JsonURL.parse("!e:e", { AQF: true, impliedObject: {} })).toStrictEqual(
        { "": "e" })
})
test("aqf implied dict e:empty a:b", function () {
    expect(JsonURL.parse("e:!e,a:b", { AQF: true, impliedObject: {} })).toStrictEqual(
        { "e": "", "a": "b" });
})
