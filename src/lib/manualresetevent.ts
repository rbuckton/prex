/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { LinkedListNode, LinkedList } from "./list";
import { CancellationToken, CancelError } from "./cancellation";
import { isMissing, isBoolean, isInstance } from "./utils";

/**
 * Asynchronously notifies one or more waiting Promises that an event has occurred.
 */
export class ManualResetEvent {
    private _signaled: boolean;
    private _waiters = new LinkedList<() => void>();

    /**
     * Initializes a new instance of the ManualResetEvent class.
     *
     * @param initialState A value indicating whether to set the initial state to signaled.
     */
    constructor(initialState?: boolean) {
        if (isMissing(initialState)) initialState = false;
        if (!isBoolean(initialState)) throw new TypeError("Boolean expected: initialState.");
        this._signaled = !!initialState;
    }

    /**
     * Gets a value indicating whether the event is signaled.
     */
    public get isSet(): boolean {
        return this._signaled;
    }

    /**
     * Sets the state of the event to signaled, resolving one or more waiting Promises.
     */
    public set(): void {
        if (!this._signaled) {
            this._signaled = true;
            for (const waiter of this._waiters.drain()) {
                if (waiter) waiter();
            }
        }
    }

    /**
     * Sets the state of the event to nonsignaled, causing asynchronous operations to pause.
     */
    public reset(): void {
        this._signaled = false;
    }

    /**
     * Asynchronously waits for the event to become signaled.
     *
     * @param token A CancellationToken used to cancel the request.
     */
    public wait(token?: CancellationToken): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (isMissing(token)) token = CancellationToken.none;
            if (!isInstance(token, CancellationToken)) throw new TypeError("CancellationToken expected: token.");
            token.throwIfCancellationRequested();

            if (this._signaled) {
                resolve();
                return;
            }

            const node = this._waiters.push(() => {
                registration.unregister();
                if (token!.cancellationRequested) {
                    reject(new CancelError());
                }
                else {
                    resolve();
                }
            });

            const registration = token.register(() => {
                if (node.list) {
                    node.list.deleteNode(node);
                    reject(new CancelError());
                }
            });
        });
    }
}