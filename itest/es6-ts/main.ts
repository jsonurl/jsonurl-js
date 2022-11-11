
import JsonURL from "@jsonurl/jsonurl";
import { readFileSync } from "fs";
const pkg = JSON.parse(String(readFileSync("package.json")));
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

assert(JsonURL.stringify(JsonURL.parse(expected)));

