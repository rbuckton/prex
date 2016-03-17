/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { CancellationToken, CancelError } from "./cancellation";
import { ManualResetEvent } from "./manualresetevent";
import { isMissing, isNumber, isInstance } from "./utils";

/**
 * An event that is set when all participants have signaled.
 */
export class CountdownEvent {
    private _initialCount: number;
    private _remainingCount: number;
    private _event: ManualResetEvent;

    /**
     * Initializes a new instance of the CountdownEvent class.
     *
     * @param initialCount The initial participant count.
     */
    constructor(initialCount: number) {
        if (!isNumber(initialCount)) throw new TypeError("Number expected: initialCount.");
        if ((initialCount |= 0) < 0) throw new RangeError("Argument out of range: initialCount.");

        this._initialCount = initialCount;
        this._remainingCount = initialCount;
        this._event = new ManualResetEvent(initialCount === 0);
    }

    /**
     * Gets the number of signals initially required to set the event.
     */
    public get initialCount(): number {
        return this._initialCount;
    }

    /**
     * Gets the number of remaining signals required to set the event.
     */
    public get remainingCount(): number {
        return this._remainingCount;
    }

    /**
     * Increments the event's current count by one or more.
     *
     * @param count An optional count specifying the additional number of signals for which the event will wait.
     */
    public add(count?: number): void {
        if (isMissing(count)) count = 1;
        if (!isNumber(count)) throw new TypeError("Number expected: count.");
        if ((count |= 0) <= 0) throw new RangeError("Argument out of range: count.");
        if (this._remainingCount === 0) throw new Error("The event is already signaled and cannot be incremented.");

        if (this._remainingCount > 0) {
            this._remainingCount += count;
        }
    }

    /**
     * Resets the remaining and initial count to the specified value, or the initial count.
     *
     * @param count An optional count specifying the number of required signals.
     */
    public reset(count?: number): void {
        if (isMissing(count)) count = this._initialCount;
        if (!isNumber(count)) throw new TypeError("Number expected: count.");
        if ((count |= 0) < 0) throw new RangeError("Argument out of range: count.");

        this._remainingCount = count;
        this._initialCount = count;
        if (this._remainingCount > 0) {
            this._event.reset();
        }
        else {
            this._event.set();
        }
    }

    /**
     * Registers one or more signals with the CountdownEvent, decrementing the remaining count.
     *
     * @param count An optional count specifying the number of signals to register.
     */
    public signal(count?: number): boolean {
        if (isMissing(count)) count = 1;
        if (!isNumber(count)) throw new TypeError("Number expected: count.");
        if ((count |= 0) <= 0) throw new RangeError("Argument out of range: count.");
        if (count > this._remainingCount) throw new Error("Invalid attempt to decrement the event's count below zero.");

        this._remainingCount -= count;
        if (this._remainingCount === 0) {
            this._event.set();
            return true;
        }

        return false;
    }

    /**
     * Asynchronously waits for the event to become signaled.
     *
     * @param token An optional CancellationToken used to cancel the request.
     */
    public wait(token?: CancellationToken): Promise<void> {
        return this._event.wait(token);
    }
}