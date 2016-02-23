/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { LinkedListNode, LinkedList } from "./list";
import { isMissing, isBoolean, isObject, isFunction, isIterable, isInstance } from "./utils";

type CancellationState =
    "open" |
    "cancellationRequested" |
    "closed";

/**
 * Signals a CancellationToken that it should be canceled.
 */
export class CancellationTokenSource {
    private _callbacks: LinkedList<() => void> = undefined;
    private _linkingRegistrations: CancellationTokenRegistration[] = undefined;
    private _token: CancellationToken = undefined;
    private _state: CancellationState = "open";

    /**
     * Initializes a new instance of a CancellationTokenSource.
     *
     * @param linkedTokens An optional iterable of tokens to which to link this source.
     */
    constructor(linkedTokens?: Iterable<CancellationToken>) {
        if (!isIterable(linkedTokens, /*optional*/ true)) throw new TypeError("Object not iterable: linkedTokens.");

        if (linkedTokens) {
            for (const linkedToken of linkedTokens) {
                if (!isInstance(linkedToken, CancellationToken)) throw new TypeError("CancellationToken expected.");

                if (linkedToken.cancellationRequested) {
                    this._state = "cancellationRequested";
                    this._unlink();
                    break;
                }
                else if (linkedToken.canBeCanceled) {
                    if (this._linkingRegistrations === undefined) {
                        this._linkingRegistrations = [];
                    }

                    this._linkingRegistrations.push(linkedToken.register(() => this.cancel()))
                }
            }
        }
    }

    /**
     * Gets a CancellationToken linked to this source.
     */
    public get token(): CancellationToken {
        if (this._token === undefined) {
            this._token = new CancellationToken(this);
        }

        return this._token;
    }

    /**
     * Gets a value indicating whether cancellation has been requested.
     */
    public get cancellationRequested(): boolean {
        return this._state === "cancellationRequested";
    }

    /**
     * Gets a value indicating whether the source can be canceled.
     */
    public get canBeCanceled(): boolean {
        return this._state !== "closed";
    }

    /**
     * Cancels the source, returning a Promise that is settled when cancellation has completed.
     * Any registered callbacks are executed in a later turn. If any callback raises an exception,
     * the first such exception can be observed by awaiting the return value of this method.
     */
    public cancel(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._state !== "open") {
                resolve();
                return;
            }

            this._state = "cancellationRequested";
            this._unlink();

            const callbacks = this._callbacks;
            this._callbacks = undefined;

            if (callbacks && callbacks.size > 0) {
                const pendingOperations: Promise<void>[] = [];
                for (const callback of callbacks) {
                    pendingOperations.push(this._executeCallback(callback));
                }

                // await all pending operations
                Promise.all(pendingOperations).then(() => resolve(), reject);
                return;
            }

            resolve();
        });
    }

    /**
     * Closes the source, preventing the possibility of future cancellation.
     */
    public close(): void {
        if (this._state !== "open") {
            return;
        }

        this._state = "closed";
        this._unlink();

        const callbacks = this._callbacks;
        this._callbacks = undefined;

        if (callbacks !== undefined) {
            // The registration for each callback holds onto the node, the node holds onto the
            // list, and the list holds all other nodes and callbacks. By clearing the list, the
            // GC can collect any otherwise unreachable nodes.
            callbacks.clear();
        }
    }

    /**
     * Registers a callback to execute when cancellation has been requested. If cancellation has
     * already been requested, the callback is executed immediately.
     *
     * @param callback The callback to register.
     */
    public register(callback: () => void): CancellationTokenRegistration {
        if (!isFunction(callback)) throw new TypeError("Function expected: callback.");

        if (this._state === "requested") {
            callback();
        }

        if (this._state !== "open") {
            return emptyRegistration;
        }

        if (this._callbacks === undefined) {
            this._callbacks = new LinkedList<() => void>();
        }

        const node = this._callbacks.push(() => {
            if (node.list) {
                node.list.deleteNode(node);
                callback();
            }
        });

        const registration = {
            unregister(): void {
                // When the callback is unregistered, remove the node from its list.
                if (node.list) {
                    node.list.deleteNode(node);
                }
            }
        };

        return registration;
    }

    /**
     * Executes the provided callback in a later turn.
     *
     * @param callback The callback to execute.
     */
    private _executeCallback(callback: () => void): Promise<void> {
        return Promise.resolve().then(() => {
            callback();
        });
    }

    /**
     * Unlinks the source from any linked tokens.
     */
    private _unlink(): void {
        const linkingRegistrations = this._linkingRegistrations;
        this._linkingRegistrations = undefined;

        if (linkingRegistrations !== undefined) {
            for (const linkingRegistration of linkingRegistrations) {
                linkingRegistration.unregister();
            }
        }
    }
}

// A source that cannot be canceled.
const closedSource = new CancellationTokenSource();
closedSource.close();

// A source that is already canceled.
const canceledSource = new CancellationTokenSource();
canceledSource.cancel();

/**
 * Propagates notifications that operations should be canceled.
 */
export class CancellationToken {
    public static readonly none = new CancellationToken(/*canceled*/ false);
    public static readonly canceled = new CancellationToken(/*canceled*/ true);

    private _source: CancellationTokenSource;

    /**
     * Creates a new instance of a CancellationToken.
     *
     * @param source The optional source for the token.
     */
    constructor(canceled?: boolean);
    /*@internal*/
    constructor(source: CancellationTokenSource);
    constructor(source?: CancellationTokenSource | boolean) {
        if (isMissing(source)) {
            this._source = closedSource;
        }
        else if (isBoolean(source)) {
            this._source = source ? canceledSource : closedSource;
        }
        else {
            if (!isInstance(source, CancellationTokenSource)) throw new TypeError("CancellationTokenSource expected: source.");
            this._source = source;
        }

        Object.freeze(this);
    }

    /**
     * Gets a value indicating whether cancellation has been requested.
     */
    public get cancellationRequested(): boolean {
        return this._source.cancellationRequested;
    }

    /**
     * Gets a value indicating whether the underlying source can be canceled.
     */
    public get canBeCanceled(): boolean {
        return this._source.canBeCanceled;
    }

    /**
     * Throws a CancelError if cancellation has been requested.
     */
    public throwIfCancellationRequested(): void {
        if (this.cancellationRequested) {
            throw new CancelError();
        }
    }

    /**
     * Registers a callback to execute when cancellation is requested.
     *
     * @param callback The callback to register.
     */
    public register(callback: () => void): CancellationTokenRegistration {
        return this._source.register(callback);
    }
}

/**
 * An error thrown when an operation is canceled.
 */
export class CancelError extends Error {
    constructor(message?: string) {
        super(message || "Operation was canceled");
    }
}

CancelError.prototype.name = "CancelError";

/**
 * An object used to unregister a callback registered to a CancellationToken.
 */
export interface CancellationTokenRegistration {
    /**
     * Unregisters the callback
     */
    unregister(): void;
}

const emptyRegistration: CancellationTokenRegistration = Object.create({ unregister() { }})