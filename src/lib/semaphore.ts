/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { LinkedListNode, LinkedList } from "./list";
import { CancellationToken, CancelError } from "./cancellation";
import { isMissing, isNumber, isObject, isInstance } from "./utils";
const MAX_INT32 = -1 >>> 1;

/**
 * Limits the number of asynchronous operations that can access a resource
 * or pool of resources.
 */
export class Semaphore {
    private _maxCount: number;
    private _currentCount: number;
    private _waiters = new LinkedList<() => void>();

    /**
     * Initializes a new instance of the Semaphore class.
     *
     * @param initialCount The initial number of entries.
     * @param maxCount The maximum number of entries.
     */
    constructor(initialCount: number, maxCount?: number) {
        if (isMissing(maxCount)) maxCount = MAX_INT32;
        if (!isNumber(initialCount)) throw new TypeError("Number expected: initialCount.");
        if (!isNumber(maxCount)) throw new TypeError("Number expected: maxCount.");
        if ((initialCount |= 0) < 0) throw new RangeError("Argument out of range: initialCount.");
        if ((maxCount |= 0) < 1) throw new RangeError("Argument out of range: maxCount.");
        if (initialCount > maxCount) throw new RangeError("Argument out of range: initialCount.");

        this._currentCount = initialCount;
        this._maxCount = maxCount;
    }

    /**
     * Gets the number of remaining asynchronous operations that can enter
     * the Semaphore.
     */
    public get count(): number {
        return this._currentCount;
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

            if (this._currentCount > 0) {
                this._currentCount--;
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

    /**
     * Releases the Semaphore one or more times.
     *
     * @param count The number of times to release the Semaphore.
     */
    public release(count?: number): void {
        if (isMissing(count)) count = 1;
        if (!isNumber(count)) throw new TypeError("Number expected: count.");
        if ((count |= 0) < 1) throw new RangeError("Argument out of range: count.");
        if (this._maxCount - this._currentCount < count) throw new RangeError("Argument out of range: count.");

        while (count > 0) {
            count--;
            const resolve = this._waiters.shift();
            if (resolve) {
                resolve();
            }
            else {
                this._currentCount++;
            }
        }
    }
}