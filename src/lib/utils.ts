/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import "./asyncIterable";

function isTypeOf(value: any, typeTag: "string" | "symbol" | "number" | "boolean" | "object" | "function", optional: boolean) {
    return isMissing(value) ? optional : typeof value === typeTag;
}

/*@internal*/
export function isMissing<T extends null | undefined, U>(value: T | U): value is T;
/*@internal*/
export function isMissing(value: any) {
    return value === null || value === undefined;
}

/*@internal*/
export function isString<T extends string, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isString<T extends string | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isString<T>(value: T, optional = false) {
    return isTypeOf(value, "string", optional);
}

/*@internal*/
export function isNumber<T extends number, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isNumber<T extends number | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isNumber<T>(value: T, optional = false) {
    return isTypeOf(value, "number", optional);
}

/*@internal*/
export function isBoolean<T extends boolean, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isBoolean<T extends boolean | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isBoolean<T>(value: T, optional = false) {
    return isTypeOf(value, "boolean", optional);
}

/*@internal*/
export function isSymbol<T extends symbol, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isSymbol<T extends symbol | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isSymbol<T>(value: T, optional = false) {
    return isTypeOf(value, "symbol", optional);
}

/*@internal*/
export function isFunction<T extends Function, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isFunction<T extends Function | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isFunction<T>(value: T, optional = false) {
    return isTypeOf(value, "function", optional);
}

/*@internal*/
export function isObject<T extends object, U extends Function, V>(value: T | U | V | null | undefined, optional?: false): value is T;
/*@internal*/
export function isObject<T extends object | null | undefined, U extends Function, V>(value: T | U | V, optional: boolean): value is T;
/*@internal*/
export function isObject<T>(value: T, optional = false) {
    return isTypeOf(value, "object", optional);
}

/*@internal*/
export function isInstance<C extends new (...args: any[]) => any, T extends InstanceType<C>, U>(value: T | U | null | undefined, constructor: C, optional?: false): value is T;
/*@internal*/
export function isInstance<C extends new (...args: any[]) => any, T extends InstanceType<C> | null | undefined, U>(value: T | U, constructor: C, optional: boolean): value is T;
/*@internal*/
export function isInstance<T>(value: T, constructor: new (...args: any[]) => any, optional = false) {
    return isMissing(value) ? optional : value instanceof constructor;
}

/*@internal*/
export function isIterable<T extends Iterable<any>, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isIterable<T extends Iterable<any> | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isIterable<T>(value: T, optional = false) {
    return isMissing(value) ? optional : isObject(value) && isFunction((<any>value)[Symbol.iterator]);
}

/*@internal*/
export function isAsyncIterable<T extends AsyncIterable<any>, U>(value: T | U | null | undefined, optional?: false): value is T;
/*@internal*/
export function isAsyncIterable<T extends AsyncIterable<any> | null | undefined, U>(value: T | U, optional: boolean): value is T;
/*@internal*/
export function isAsyncIterable<T>(value: T, optional = false) {
    return isMissing(value) ? optional : isObject(value) && isFunction((<any>value)[(<any>Symbol).asyncIterator]);
}

/*@internal*/
export function isPromiseLike<T extends PromiseLike<any>, U>(value: T | U | null | undefined): value is T;
/*@internal*/
export function isPromiseLike(value: any){
    return isObject(value) && isFunction((<any>value).then);
}