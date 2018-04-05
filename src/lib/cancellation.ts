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
    private _state: CancellationState = "open";
    private _token: CancellationToken | undefined = undefined;
    private _registrations: LinkedList<CancellationTokenRegistration> | undefined = undefined;
    private _linkingRegistrations: CancellationTokenRegistration[] | undefined = undefined;

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

    /*@internal*/ get _currentState(): CancellationState {
        if (this._state === "open" && this._linkingRegistrations && this._linkingRegistrations.length > 0) {
            for (const registration of this._linkingRegistrations) {
                if (registration._cancellationSource &&
                    registration._cancellationSource._currentState === "cancellationRequested") {
                    return "cancellationRequested";
                }
            }
        }
        return this._state;
    }

    /**
     * Gets a value indicating whether cancellation has been requested.
     */
    /*@internal*/ get _cancellationRequested(): boolean {
        return this._currentState === "cancellationRequested";
    }

    /**
     * Gets a value indicating whether the source can be canceled.
     */
    /*@internal*/ get _canBeCanceled(): boolean {
        return this._currentState !== "closed";
    }

    /**
     * Cancels the source, evaluating any registered callbacks. If any callback raises an exception,
     * the exception is propagated to a host specific unhanedle exception mechanism.
     */
    public cancel(): void {
        if (this._state !== "open") {
            return;
        }

        this._state = "cancellationRequested";
        this._unlink();

        const registrations = this._registrations;
        this._registrations = undefined;

        if (registrations && registrations.size > 0) {
            for (const registration of registrations) {
                if (registration._cancellationTarget) {
                    this._executeCallback(registration._cancellationTarget);
                }
            }
        }
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

        const callbacks = this._registrations;
        this._registrations = undefined;

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
    /*@internal*/ _register(callback: () => void): CancellationTokenRegistration {
        if (!isFunction(callback)) throw new TypeError("Function expected: callback.");

        if (this._state === "cancellationRequested") {
            this._executeCallback(callback);
            return emptyRegistration;
        }

        if (this._state === "closed") {
            return emptyRegistration;
        }

        if (this._registrations === undefined) {
            this._registrations = new LinkedList<CancellationTokenRegistration>();
        }

        const node = this._registrations.push({
            _cancellationSource: this,
            _cancellationTarget: callback,
            unregister(this: CancellationTokenRegistration): void {
                if (this._cancellationSource === undefined) return;
                if (this._cancellationSource._registrations) {
                    this._cancellationSource._registrations.deleteNode(node);
                }
                this._cancellationSource = undefined;
                this._cancellationTarget = undefined;
            }
        });

        return node.value!;
    }

    /**
     * Executes the provided callback.
     *
     * @param callback The callback to execute.
     */
    private _executeCallback(callback: () => void): void {
        try {
            callback();
        }
        catch (e) {
            // HostReportError(e)
            setTimeout(() => { throw e; }, 0);
        }
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
    /**
     * A token which will never be canceled.
     */
    public static readonly none = new CancellationToken(/*canceled*/ false);

    /**
     * A token that is already canceled.
     */
    public static readonly canceled = new CancellationToken(/*canceled*/ true);

    private _source: CancellationTokenSource;

    /*@internal*/
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
        return this._source._cancellationRequested;
    }

    /**
     * Gets a value indicating whether the underlying source can be canceled.
     */
    public get canBeCanceled(): boolean {
        return this._source._canBeCanceled;
    }

    /**
     * Adapts a CancellationToken-like primitive from a different library.
     */
    public static from(token: CancellationToken | VSCodeCancellationTokenLike | AbortSignalLike) {
        if (isVSCodeCancellationTokenLike(token)) {
            if (token.isCancellationRequested) return CancellationToken.canceled;
            const source = new CancellationTokenSource();
            token.onCancellationRequested(() => source.cancel());
            return source.token;
        }
        else if (isAbortSignalLike(token)) {
            if (token.aborted) return CancellationToken.canceled;
            const source = new CancellationTokenSource();
            token.addEventListener("abort", () => source.cancel());
            return source.token;
        }
        else {
            return token;
        }
    }

    /**
     * Returns a CancellationToken that becomes canceled when **any** of the provided tokens are canceled.
     * @param tokens An iterable of CancellationToken objects.
     */
    public static race(tokens: Iterable<CancellationToken>) {
        if (!isIterable(tokens)) throw new TypeError("Object not iterable: iterable.");
        const tokensArray = Array.isArray(tokens) ? tokens : [...tokens];
        return tokensArray.length > 0 ? new CancellationTokenSource(tokensArray).token : CancellationToken.none;
    }

    /**
     * Returns a CancellationToken that becomes canceled when **all** of the provided tokens are canceled.
     * @param tokens An iterable of CancellationToken objects.
     */
    public static all(tokens: Iterable<CancellationToken>) {
        if (!isIterable(tokens)) throw new TypeError("Object not iterable: iterable.");
        const tokensArray = Array.isArray(tokens) ? tokens : [...tokens];
        return tokensArray.length > 0 ? new CancellationTokenCountdown(tokensArray).token : CancellationToken.none;
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
        return this._source._register(callback);
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
    /*@internal*/ _cancellationSource: CancellationTokenSource | undefined;
    /*@internal*/ _cancellationTarget: (() => void) | undefined;
    /**
     * Unregisters the callback
     */
    unregister(): void;
}

const emptyRegistration: CancellationTokenRegistration = Object.create({ unregister() { } });

/**
 * Describes a foreign cancellation primitive similar to the one provided by `vscode` for extensions.
 */
export interface VSCodeCancellationTokenLike {
    readonly isCancellationRequested: boolean;
    onCancellationRequested(listener: () => any): { dispose(): any; };
}

/**
 * Describes a foreign cancellation primitive similar to the one used by the DOM.
 */
export interface AbortSignalLike {
    readonly aborted: boolean;
    addEventListener(type: "abort", callback: () => any): any;
}

function isVSCodeCancellationTokenLike(token: any): token is VSCodeCancellationTokenLike {
    return typeof token === "object"
        && token !== null
        && isBoolean(token.isCancellationRequested)
        && isFunction(token.onCancellationRequested);
}

function isAbortSignalLike(token: any): token is AbortSignalLike {
    return typeof token === "object"
        && token !== null
        && isBoolean(token.aborted)
        && isFunction(token.addEventListener);
}

/**
 * An object that provides a CancellationToken that becomes cancelled when **all** of its
 * containing tokens are canceled. This is similar to `CancellationToken.all`, except that you are
 * able to add additional tokens.
 */
export class CancellationTokenCountdown {
    private _addedCount = 0;
    private _signaledCount = 0;
    private _canBeSignaled = false;
    private _source = new CancellationTokenSource();
    private _registrations: CancellationTokenRegistration[] = [];

    constructor(iterable?: Iterable<CancellationToken>) {
        if (!isIterable(iterable, /*optional*/ true)) throw new TypeError("Object not iterable: iterable.");

        if (iterable) {
            for (const token of iterable) {
                this.add(token);
            }
        }

        this._canBeSignaled = true;
        this._checkSignalState();
    }

    /**
     * Gets the number of tokens added to the countdown.
     */
    public get addedCount() { return this._addedCount; }

    /**
     * Gets the number of tokens that have not yet been canceled.
     */
    public get remainingCount() { return this._addedCount - this._signaledCount; }

    /**
     * Gets the CancellationToken for the countdown.
     */
    public get token() { return this._source.token; }

    /**
     * Adds a CancellationToken to the countdown.
     */
    add(token: CancellationToken) {
        if (!isInstance(token, CancellationToken)) throw new TypeError("CancellationToken expected.");
        if (this._source._currentState !== "open") return this;
        if (token.cancellationRequested) {
            this._addedCount++;
            this._signaledCount++;
            this._checkSignalState();
        }
        else if (token.canBeCanceled) {
            this._addedCount++;
            this._registrations.push(token.register(() => {
                this._signaledCount++;
                this._checkSignalState();
            }));
        }
        return this;
    }

    private _checkSignalState() {
        if (!this._canBeSignaled || this._signaledCount < this._addedCount) return;
        this._canBeSignaled = false;
        if (this._addedCount > 0) {
            try {
                for (const registration of this._registrations) {
                    registration.unregister();
                }
            }
            finally {
                this._registrations.length = 0;
                this._source.cancel();
            }
        }
    }
}