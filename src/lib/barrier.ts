/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { LinkedListNode, LinkedList } from "./list";
import { CancellationToken, CancelError } from "./cancellation";
import { isMissing, isFunction, isNumber, isObject, isInstance } from "./utils";
import { Cancelable } from "@esfx/cancelable";
import { getToken } from "./adapter";

/**
 * Enables multiple tasks to cooperatively work on an algorithm through
 * multiple phases.
 */
export class Barrier {
    private _isExecutingPostPhaseAction = false;
    private _postPhaseAction: ((barrier: Barrier) => void | PromiseLike<void>) | undefined;
    private _phaseNumber: number = 0;
    private _participantCount: number;
    private _remainingParticipants: number;
    private _waiters = new LinkedList<{ resolve: () => void; reject: (reason: any) => void; }>();

    /**
     * Initializes a new instance of the Barrier class.
     *
     * @param participantCount The initial number of participants for the barrier.
     * @param postPhaseAction An action to execute between each phase.
     */
    constructor(participantCount: number, postPhaseAction?: (barrier: Barrier) => void | PromiseLike<void>) {
        if (!isNumber(participantCount)) throw new TypeError("Number expected: participantCount.");
        if ((participantCount |= 0) < 0) throw new RangeError("Argument out of range: participantCount.");
        if (!isFunction(postPhaseAction, /*optional*/ true)) throw new TypeError("Function expected: postPhaseAction.");

        this._participantCount = participantCount;
        this._remainingParticipants = participantCount;
        this._postPhaseAction = postPhaseAction;
    }

    /**
     * Gets the number of the Barrier's current phase.
     */
    public get currentPhaseNumber() {
        return this._phaseNumber;
    }

    /**
     * Gets the total number of participants in the barrier.
     */
    public get participantCount() {
        return this._participantCount;
    }

    /**
     * Gets the number of participants in the barrier that haven't yet signaled in the current phase.
     */
    public get remainingParticipants() {
        return this._remainingParticipants;
    }

    /**
     * Notifies the Barrier there will be additional participants.
     *
     * @param participantCount The number of additional participants.
     */
    public add(participantCount?: number) {
        if (isMissing(participantCount)) participantCount = 1;
        if (!isNumber(participantCount)) throw new TypeError("Number expected: participantCount.");
        if ((participantCount |= 0) <= 0) throw new RangeError("Argument out of range: participantCount.");
        if (this._isExecutingPostPhaseAction) throw new Error("This method may not be called from within the postPhaseAction.");

        this._participantCount += participantCount;
        this._remainingParticipants += participantCount;
    }

    /**
     * Notifies the Barrier there will be fewer participants.
     *
     * @param participantCount The number of participants to remove.
     */
    public remove(participantCount?: number) {
        if (isMissing(participantCount)) participantCount = 1;
        if (!isNumber(participantCount)) throw new TypeError("Number expected: participantCount.");
        if ((participantCount |= 0) <= 0) throw new RangeError("Argument out of range: participantCount.");
        if (this._participantCount < participantCount) throw new RangeError("Argument out of range: participantCount.");
        if (this._isExecutingPostPhaseAction) throw new Error("This method may not be called from within the postPhaseAction.");

        this._participantCount -= participantCount;
        this._remainingParticipants -= participantCount;
        if (this._participantCount === 0) {
            this._finishPhase();
        }
    }

    /**
     * Signals that a participant has reached the barrier and waits for all other participants
     * to reach the barrier.
     *
     * @param token An optional CancellationToken used to cancel the request.
     */
    public signalAndWait(token?: CancellationToken | Cancelable): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const _token = getToken(token);
            _token.throwIfCancellationRequested();
            if (this._isExecutingPostPhaseAction) throw new Error("This method may not be called from within the postPhaseAction.");
            if (this._participantCount === 0) throw new Error("The barrier has no registered participants.");
            if (this._remainingParticipants === 0) throw new Error("The number of operations using the barrier exceeded the number of registered participants.");

            const node = this._waiters.push({
                resolve: () => {
                    registration.unregister();
                    if (_token!.cancellationRequested) {
                        reject(new CancelError());
                    }
                    else {
                        resolve();
                    }
                },
                reject: reason => {
                    registration.unregister();
                    if (_token!.cancellationRequested) {
                        reject(new CancelError());
                    }
                    else {
                        reject(reason);
                    }
                }
            });

            const registration = _token.register(() => {
                if (node.list) {
                    node.list.deleteNode(node);
                    reject(new CancelError());
                }
            });

            this._remainingParticipants--;
            if (this._remainingParticipants === 0) {
                this._finishPhase();
            }
        });
    }

    private _finishPhase() {
        const postPhaseAction = this._postPhaseAction;
        if (postPhaseAction) {
            this._isExecutingPostPhaseAction = true;
            Promise
                .resolve()
                .then(() => postPhaseAction(this))
                .then(() => this._resolveNextPhase(), error => this._rejectNextPhase(error));
        }
        else {
            Promise
                .resolve()
                .then(() => this._resolveNextPhase());
        }
    }

    private _nextPhase() {
        this._isExecutingPostPhaseAction = false;
        this._remainingParticipants = this._participantCount;
        this._phaseNumber++;
    }

    private _resolveNextPhase() {
        this._nextPhase();
        for (const deferred of this._waiters.drain()) {
            if (deferred) deferred.resolve();
        }
    }

    private _rejectNextPhase(error: any) {
        this._nextPhase();
        for (const deferred of this._waiters.drain()) {
            if (deferred) deferred.reject(error);
        }
    }
}