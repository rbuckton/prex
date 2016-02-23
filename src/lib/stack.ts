/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { isMissing, isObject, isIterable, isInstance } from "./utils";

/**
 * An asynchronous Stack.
 */
export class AsyncStack<T> {
    private _available: Array<Promise<T>> = undefined;
    private _pending: Array<(value: T | PromiseLike<T>) => void> = undefined;

    constructor(iterable?: Iterable<T | PromiseLike<T>>) {
        if (!isIterable(iterable, /*optional*/ true)) throw new TypeError("Object not iterable: iterable.");
        if (!isMissing(iterable)) {
            this._available = [];
            for (const value of iterable) {
                this._available.push(Promise.resolve(value));
            }
        }
    }

    /**
      * Adds a value to the top of the stack. If the stack is empty but has a pending
      * pop request, the value will be popped and the request fulfilled.
      */
    public push(value: T | PromiseLike<T>): void {
        if (this._pending !== undefined) {
            const resolve = this._pending.shift();
            if (resolve !== undefined) {
                resolve(value);
                return;
            }
        }

        if (this._available === undefined) {
            this._available = [];
        }

        this._available.push(Promise.resolve(value));
    }

    /**
      * Removes and returns a Promise for the top value of the stack. If the stack is empty,
      * returns a Promise for the next value to be pushed on to the stack.
      */
    public pop(): Promise<T> {
        if (this._available !== undefined) {
            const promise = this._available.pop();
            if (promise !== undefined) {
                return promise;
            }
        }

        if (this._pending === undefined) {
            this._pending = [];
        }

        return new Promise<T>(resolve => { this._pending.push(resolve); });
    }
}