/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

/**
 * Encapsulates a Promise and exposes its resolve and reject callbacks.
 */
export class Deferred<T> {
    private _promise: Promise<T>;
    private _resolve!: (value?: PromiseLike<T> | T) => void;
    private _reject!: (reason: any) => void;

    /**
     * Initializes a new instance of the Deferred class.
     */
    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * Gets the promise.
     */
    public get promise(): Promise<T> {
        return this._promise;
    }

    /**
     * Resolves the promise.
     *
     * @param value The value used to resolve the promise.
     */
    public resolve(value?: PromiseLike<T> | T): void {
        this._resolve(value);
    }

    /**
     * Rejects the promise.
     *
     * @param reason The reason the promise was rejected.
     */
    public reject(reason: any): void {
        this._reject(reason);
    }
}