
/**
 * GetMissingValue function signature
 */
type GetMissingValue = {
  (key: string): any;
};

/**
 * Options for the JsonURL.stringify function.
 *
 * @see https://github.com/jsonurl/specification#291-implied-arrays
 * @see https://github.com/jsonurl/specification#292-implied-objects
 * @see https://github.com/jsonurl/specification#293-x-www-form-urlencoded-arrays-and-objects
 * @see https://github.com/jsonurl/specification#295-empty-objects-and-arrays
 * @see https://github.com/jsonurl/specification#296-address-bar-query-string-friendly
 */
type JsonURLStringifyOptions = {
      /**
       * @type {boolean} [allowEmptyUnquotedKeys] Normally an empty string
       * value is represented as `''` (two single quotes). If this
       * is true the stringifier will omit a value rather than writing an
       * empty string.
       */
    allowEmptyUnquotedValues?: boolean,
    /**
     * @type {boolean} [allowEmptyUnquotedKeys] Normally a key whose value is
     * the empty string is represented as `''` (two single quotes). If this
     * is true the stringifier will omit a value rather than writing an
     * empty string.
     */
    allowEmptyUnquotedKeys?: boolean,
    /**
     * @type {boolean} [AQF] Enable the address bar query string friendly
     * (AQF) syntax option, and emit a string as oulined in section
     * 2.9.6 of the JSON&#x2192;URL specification.
     */
    AQF?: boolean,
    /**
     * @type {boolean} [coerceNullToEmptyString] Normally the stringifier will
     * emit a `null` value as a literal `null`. If this is true `null`
     * values will be coerced to the empty string.
     */
    coerceNullToEmptyString?: boolean,
    /**
     * @type {Array<any>} [impliedArray] Emit an implied array
     * as oulined in section 2.9.1 of the JSON&#x2192;URL specification.
     */
    impliedArray?: boolean,
    /**
     * @type {Object} [impliedObject] Emit an implied object
     * as oulined in section 2.9.1 of the JSON&#x2192;URL specification.
     */
    impliedObject?: boolean,
    /**
     * @type {boolean} [impliedStringLiterals] If true the stringifier will
     * emit JSON&#x2192;URL text that assumes all literals are
     * strings.
     */
    impliedStringLiterals?: boolean,
    /**
     * @type {boolean} [noEmptyComposite] Emit JSON&#x2192;URL text as
     * oulined in section 2.9.4 of the JSON&#x2192;URL specification.
     */
    noEmptyComposite?: boolean,
    /**
     * @type {boolean} [wwwFormUrlEncoded] Emit x-www-form-urlencoded content
     * as oulined in section 2.9.3 of the JSON&#x2192;URL specification.
     */
    wwwFormUrlEncoded?: boolean,
    /**
     * @type {boolean} [callFunctions] The stringifier will inspect each
     * value to see if it's a function.
     * If `callFunctions` is true then functions will be called to resolve
     * the value; otherwise, they will be omitted.
     */
    callFunctions?: boolean,
    /**
     * @deprecated
     * @type {boolean} [isImplied] Emit an implied object or array. For
     * consistency with parse() use `impliedArray` or `impliedObject`.
     */
    isImplied?: boolean,
    /**
     * @type {boolean} [ignoreNullArrayMembers=false] Ignore null array members.
     * This is `true` by default if impliedStringLiterals is true,
     * and `false` by default otherwise.
     */
    ignoreNullArrayMembers?: boolean,
    /**
     * @type {boolean} [ignoreNullObjectMembers=false] Ignore null object
     * members. This is `true` by default if impliedStringLiterals is true,
     * and `false` by default otherwise.
     */
    ignoreNullObjectMembers?: boolean,
    /**
     * @type {boolean} [ignoreUndefinedArrayMembers] Ignore undefined array
     * members. This is `true` by default if impliedStringLiterals is true,
     * and `false` by default otherwise. Undefined values will be stringified
     * as `null` because `undefined` is not a valid JSON value.
     */
    ignoreUndefinedArrayMembers?: boolean,
    /**
     * @type {boolean} [ignoreUndefinedObjectMembers] Ignore undefined object
     * members. This is `true` by default if impliedStringLiterals is true,
     * and `false` by default otherwise. Undefined values will be stringified
     * as `null` because `undefined` is not a valid JSON value.
     */
    ignoreUndefinedObjectMembers?: boolean,
  }
  
  /**
   * Options for the JsonURL.parse function.
   *
   * @see https://github.com/jsonurl/specification#291-implied-arrays
   * @see https://github.com/jsonurl/specification#292-implied-objects
   * @see https://github.com/jsonurl/specification#293-x-www-form-urlencoded-arrays-and-objects
   * @see https://github.com/jsonurl/specification#294-implied-object-missing-values
   * @see https://github.com/jsonurl/specification#295-empty-objects-and-arrays
   * @see https://github.com/jsonurl/specification#296-address-bar-query-string-friendly
   */
  type JsonURLParseOptions = {
    /**
     * @type {boolean} [allowEmptyUnquotedValues] Normally the empty string
     * is represented as `''` (two single quotes). This option allows the
     * parser to recognize an omitted value as the empty string. Note, in the
     * case of an object value the separator is still required.
     */
    allowEmptyUnquotedValues?: boolean,
    /**
     * @type {boolean} [allowEmptyUnquotedKeys] Normally the empty string
     * is represented as `''` (two single quotes). This option allows the
     * parser to recognize an omitted object key as the empty string. Note,
     * the separator is still required.
     */
    allowEmptyUnquotedKeys?: boolean,
    /**
     * @type {boolean} [AQF] Enable the address bar query string friendly
     * (AQF) syntax option, and implement the grammar oulined in section
     * 2.9.6 of the JSON&#x2192;URL specification.
     */
    AQF?: boolean,
    /**
     * @type {boolean} [coerceNullToEmptyString] Normally the `null` literal
     * is parsed as a JavaScript `null` value, however, if this is true
     * then `null` literals will be coerced to the empty string.
     */
    coerceNullToEmptyString?: boolean,
    /**
     * @type {Array<any>} [impliedArray] An implied array.
     *
     * If provied, parse will implement a parser for the grammar oulined in
     * section 2.9.1 of the JSON&#x2192;URL specification. The given parse
     * text is assumed to be an array, and the leading and trailing parens
     * must not be present. The given array value will be populated and
     * returned.
     */
    impliedArray?: Array<any>,
    /**
     * @type {Object} [impliedObject] An implied object.
     *
     * If provided, parse will implement the grammar oulined in section 2.9.2
     * of the JSON&#x2192;URL specification. The given parse text is assumed
     * to be an object, and the leading and trailing parens must not be
     * present. The given object value will be populated and returned.
     */
    impliedObject?: object,
    /**
     * @type {boolean} [impliedStringLiterals] Instruct the parser to assume
     * that all literals are strings. In this case, the single quote character
     * loses its significance and is parsed as-is.
     */
    impliedStringLiterals?: boolean,
    /**
     * @type {boolean} [noEmptyComposite] Implement the grammar
     * oulined in section 2.9.4 of the JSON&#x2192;URL specification.
     *
     * If true, the parser will distinguish between empty array and empty
     * object. Empty array is back-to-back parens, e.g. `()`. Empty object
     * is two parens with a single colon inside, e.g. `(:)`. Note that this
     * prevents the parser from recognizing `(:)` as an object with a single
     * member whose key and value is the unquoted empty string when
     * `allowEmptyUnquotedValues` and `allowEmptyUnquotedValues` are also
     * both true.
     */
    noEmptyComposite?: boolean,
    /**
     * @type {boolean} [wwwFormUrlEncoded] Implement the grammar oulined in
     * section 2.9.3 of the JSON&#x2192;URL specification.
     * 
     * The given parse text is may use ampersand and equal characters as the
     * value and member separator characters, respetively, at the top-level.
     * This may be combined with `impliedArray` or `impliedObject`.
     */
    wwwFormUrlEncoded?: boolean,
    /**
     * @param {*} [emptyValue] The value which represents the empty composite.
     * This may be any type. If it is a function then it will be called
     * until it resolves to something that is not a function. The default
     * is an empty Object.
     */
    emptyValue?: any,
    /**
     * @type {function} [getMissingValue] Implement the grammar oulined in
     * section 2.9.4 of the JSON&#x2192;URL specification.
     *
     * This function provides a missing top-level value for the given key.
     */
    getMissingValue?: GetMissingValue,
    /**
     * @type {*} [nullValue=null] The value which represents the `null` value.
     * This may be any type. If it is a function then it will be called
     * until it resolves to something that is not a function. The default
     * is `null`.
     */
    nullValue?: any,
    /**
     * @type {number} [maxParseChars=65535] Maximum number of characters to
     * parse. The parse() method will throw an Error if it parses more than
     * this number of characters. The default is 64K.
     */
    maxParseChars?: number,
    /**
     * @type {number} [maxParseDepth=64] Maximum parse depth.
     * The parse() method will throw an Error if the depth
     * of the input exceeds this value. The default is 64.
     */
    maxParseDepth?: number,
    /**
     * @type {number} [maxParseValues=4096] Maximum number of values to parse.
     * The parse() method will throw an Error if it parses more than this
     * number of values. The default is 4096.
     */
    maxParseValues?: number,
    /**
     * @type {boolean} [ignoreNullArrayMembers=false] Ignore null array
     * members.
     */
    ignoreNullArrayMembers?: boolean,
    /**
     * @type {boolean} [ignoreNullObjectMembers=false] Ignore null object
     * members.
     */
    ignoreNullObjectMembers?: boolean,
  }
  
  declare class JsonURL {
    /**
     * Construct a new JsonURL class.
     *
     * Each instance of this class contains a number of properties that manage
     * the behavior of the parser and the values it returns; these are documented
     * below. The class instance does not manage parse state -- that is local to
     * the parse() function itself. As long as you don't need different
     * properties (e.g. limits, null value, etc) you may re-use the same Parser
     * instance, even by multiple Workers.
     * @param {Object} [prop] Initialization properties.
     * @deprecated this constructior will be removed and the JsonURL class
     * will simply have two static functions (mirroring the interface
     * of the JSON Object). These properties may be sent as options to
     * parse() and stringify().
     */
    constructor(prop?: {
      /**
       * @type {number} [maxParseDepth=64] Maximum parse depth.
       * The parse() method will throw an Error if the depth
       * of the input exceeds this value. The default is 64.
       */
      maxParseDepth?: number;
      /**
       * @type {number} [maxParseValues=4096] Maximum number of values to parse.
       * The parse() method will throw an Error if it parses more than this
       * number of values. The default is 4K.
       */
      maxParseValues?: number;
      /**
       * @type {number} [maxParseChars=65535] Maximum number of characters to
       * parse. The parse() method will throw an Error if it parses more than
       * this number of characters. The default is 64K.
       */
      maxParseChars?: number;
      /**
       * @param {*} [emptyValue] The value which represents the empty composite.
       * This may be any type. If it is a function then it will be called
       * until it resolves to something that is not a function. The default
       * is an empty Object.
       */
      emptyValue?: any;
      /**
       * @type {*} [nullValue=null] The value which represents the `null` value.
       * This may be any type. If it is a function then it will be called
       * until it resolves to something that is not a function. The default
       * is `null`.
       */
      nullValue?: any;
    });
  
    /**
     * Parse JSON&#x2192;URL text and return a JavaScript value.
     *
     * The `text` parameter must be provided. The second parameter may be
     * either the index into `text` where the parse should start (a number)
     * or parse options. If an offset is provided then the third parameter
     * may be either the index into `text` where the parse should end (a
     * number) or parse options. If the an end index is provided then the
     * forth parameter may be parse options.
     *
     * @public
     * @param {string} text The text to parse.
     * @param {number|JsonURLParseOptions} [startOrOpt] index into `text`
     * where parse should start (a number) or parse options.
     * @param {number|JsonURLParseOptions} [endOrOpt] index into `text`
     * where parse should end (a number) or parse options.
     * @param {JsonURLParseOptions} [options] parse options.
     * @return {any} the parsed value
     * @throws SyntaxError if there is a syntax error in the given text
     * @throws Error if a limit given in the constructor (or its default)
     * is exceeded.
     */
    static parse(text: string, startOrOpt?: number | JsonURLParseOptions, endOrOpt?: number | JsonURLParseOptions, options?: JsonURLParseOptions): any;
  
    /**
     * Parse JSON&#x2192;URL text and return a JavaScript value.
     *
     * The `text` parameter must be provided. The second parameter may be
     * either the index into `text` where the parse should start (a number)
     * or parse options. If an offset is provided then the third parameter
     * may be either the index into `text` where the parse should end (a
     * number) or parse options. If the an end index is provided then the
     * forth parameter may be parse options.
     *
     * @param {string} text The text to parse.
     * @param {number|JsonURLParseOptions} [startOrOpt] index into `text`
     * where parse should start (a number) or parse options.
     * @param {number|JsonURLParseOptions} [endOrOpt] index into `text`
     * where parse should end (a number) or parse options.
     * @param {JsonURLParseOptions} [options] parse options.
     * @return {any} the parsed value
     * @throws SyntaxError if there is a syntax error in the given text
     * @throws Error if a limit given in the constructor (or its default)
     * is exceeded.
     * @deprecated this function will be removed and the JsonURL class
     * will simply have two static functions (mirroring the interface
     * of the JSON Object). Call `JsonURL.parse()` instead.
     */
    parse(text: string, startOrOpt?: number | JsonURLParseOptions, endOrOpt?: number | JsonURLParseOptions, options?: JsonURLParseOptions): any;
  
    /**
     * A static method for coverting a JavaScript value to JSON&#x2192;URL text.
     * @public
     * @param {*} value Any value
     * @param {JsonURLStringifyOptions} [options] stringify options.
     * @returns {string} JSON&#x2192;URL text, or `undefined` if the given value
     * is `undefined`.
     */
    static stringify(value: any, options?: JsonURLStringifyOptions): string | undefined;
  }
  
  export default JsonURL;
  