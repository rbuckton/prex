/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

export function isString(value: any, optional?: boolean): value is string {
    return isTypeOf(value, "string", optional);
}

export function isNumber(value: any, optional?: boolean): value is number {
    return isTypeOf(value, "number", optional);
}

export function isBoolean(value: any, optional?: boolean): value is boolean {
    return isTypeOf(value, "boolean", optional);
}

export function isObject<T>(value: any | T, optional?: boolean): value is T {
    return isTypeOf(value, "object", optional);
}

export function isFunction<T extends Function>(value: any | T, optional?: boolean): value is T {
    return isTypeOf(value, "function", optional);
}

export function isIterable<T>(value: any | Iterable<T>, optional?: boolean): value is Iterable<T> {
    return isMissing(value) ? !!optional : typeof value === "object" && Symbol.iterator in value;
}

export function isInstance<T>(value: any | T, constructor: new (...args: any[]) => T, optional?: boolean): value is T {
    return isMissing(value) ? !!optional : value instanceof constructor;
}

function isTypeOf(value: any, typeTag: "string" | "number" | "boolean" | "object" | "function", optional: boolean) {
    return isMissing(value) ? !!optional : typeof value === typeTag;
}

export function isMissing(value: any) {
    return value === null || value === undefined;
}
