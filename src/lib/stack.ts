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
    private _available: Array<Promise<T>> | undefined = undefined;
    private _pending: Array<(value: T | PromiseLike<T>) => void> | undefined = undefined;

    /**
     * Initializes a new instance of the AsyncStack class.
     *
     * @param iterable An optional iterable of values or promises.
     */
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
     * Gets the number of entries in the stack.
     * When positive, indicates the number of entries available to get.
     * When negative, indicates the number of requests waiting to be fulfilled.
     */
    public get size() {
        if (this._available && this._available.length > 0) {
            return this._available.length;
        }
        if (this._pending && this._pending.length > 0) {
            return -this._pending.length;
        }
        return 0;
    }


    /**
     * Adds a value to the top of the stack. If the stack is empty but has a pending
     * pop request, the value will be popped and the request fulfilled.
     *
     * @param value A value or promise to add to the stack.
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

        return new Promise<T>(resolve => { this._pending!.push(resolve); });
    }
}