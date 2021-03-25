interface JsonURLOptions {
    // These are defined as protected in the comments
    // setOrDefault(src, key, defValue);
    // setOverride(src, key);
    // setOrDefaultInt(src, key, defValue);
}

export interface JsonURLParseOptions extends JsonURLOptions {
    //See https://github.com/jsonurl/jsonurl-js/blob/master/src/JsonURLParseOptions.js

    //public properties
    maxParseDepth?: number; //default 1 << 5 === 32
    maxParseValues?: number; //default 1 << 12 === 4096
    maxParseChars?: number; //default 1 << 15 === 32K
    emptyValue?: any; //default is {}
    nullValue?: any; //default is null

    //These feel like they are intended to be protected
    // impliedArray?: any[];
    // impliedObject?: Record<string, any>;
    // wwwFormUrlEncoded?: boolean;
    // impliedStringLiterals?: boolean;
    // allowEmptyUnquotedValues?: boolean;
    // allowEmptyUnquotedKeys?: boolean;
    // coerceNullToEmptyString?: boolean;
    // noEmptyComposite?: boolean;
    // AQF?: boolean;
    // getMissingValue?: (key, pos) => any; //default throws an error
}

declare class JsonURL {
    //Source comments suggest this is deprecated:
    //* But in tests it is used.
    //* It is necessary to parse()
    constructor(prop?: JsonURLParseOptions);

    //Source comments suggests static parse() is available,
    //* But in browser I don't see it on JsonURL object
    //  when using @jsonurl/jsonurl/dist/jsonurl.min.js
    //* As well, no tests use this static method
    // static parse(
    //     text: string,
    //     offsetOrOpt?: number | JsonURLParseOptions,
    //     endOrOpt?: number | JsonURLParseOptions,
    //     options?: JsonURLParseOptions
    // ): any; //returns JSON

    static stringify(
        value: any,
        options?: JsonURLParseOptions
    ): string;

    //Note: Source comments suggest this is deprecated. But this seems to be wrong.
    //* Examples/tests use the instance's parse() method
    //* static parse() is not available in browser (see comment above)
    parse(
        text: string,
        offsetOrOpt?: number | JsonURLParseOptions,
        endOrOpt?: number | JsonURLParseOptions,
        options?: JsonURLParseOptions
    ): any; //returns JSON
}

export default JsonURL;
