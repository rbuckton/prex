/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { LinkedList } from "./list";
import { CancellationToken, CancelError } from "./cancellation";
import { isMissing, isInstance } from "./utils";

/**
 * Asynchronously notifies one or more waiting Promises that an event has occurred.
 */
export class Pulsar {
    private _waiters = new LinkedList<() => void>();

    /**
     * Notifies the next waiter.
     */
    public pulse(): void {
        const waiter = this._waiters.shift();
        if (waiter) waiter();
    }

    /**
     * Notifies all waiters.
     */
    public pulseAll(): void {
        for (const waiter of this._waiters.drain()) {
            if (waiter) waiter();
        }
    }

    /**
     * Asynchronously waits for the the next pulse.
     *
     * @param token A CancellationToken used to cancel the request.
     */
    public wait(token?: CancellationToken): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (isMissing(token)) token = CancellationToken.none;
            if (!isInstance(token, CancellationToken)) throw new TypeError("CancellationToken expected: token.");
            token.throwIfCancellationRequested();
            
            const node = this._waiters.push(() => {
                registration.unregister();
                resolve();
            });

            const registration = token.register(() => {
                node.list!.deleteNode(node);
                reject(new CancelError());
            });
        });
    }
}
