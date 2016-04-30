/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { CancellationToken } from "./cancellation";

/**
 * Waits the specified number of milliseconds before resolving.
 *
 * @param msec The number of milliseconds to wait before resolving.
 */
export function delay(msec: number): Promise<void>;

/**
 * Waits the specified number of milliseconds before resolving with the provided value.
 *
 * @param msec The number of milliseconds to wait before resolving.
 * @param value An optional value for the resulting Promise.
 */
export function delay<T>(msec: number, value: T | PromiseLike<T>): Promise<T>;

/**
 * Waits the specified number of milliseconds before resolving.
 *
 * @param token A CancellationToken
 * @param msec The number of milliseconds to wait before resolving.
 */
export function delay(token: CancellationToken, msec: number): Promise<void>;

/**
 * Waits the specified number of milliseconds before resolving with the provided value.
 *
 * @param token A CancellationToken
 * @param msec The number of milliseconds to wait before resolving.
 * @param value An optional value for the resulting Promise.
 */
export function delay<T>(token: CancellationToken, msec: number, value: T | PromiseLike<T>): Promise<T>;

/**
 * Waits the specified number of milliseconds before resolving with the provided value.
 *
 * @param token A CancellationToken
 * @param msec The number of milliseconds to wait before resolving.
 * @param value An optional value for the resulting Promise.
 */
export function delay<T>(token_: number | CancellationToken, msec_?: T | PromiseLike<T> | number, value?: T | PromiseLike<T>) {
    let token: CancellationToken;
    let msec: number;
    if (typeof token_ === "number") {
        value = msec_ as T | PromiseLike<T>;
        msec = token_;
        token = CancellationToken.none;
    }
    else {
        msec = msec_ as number;
        token = token_ as CancellationToken;
    }

    if (!token.canBeCanceled) {
        return new Promise<T>(resolve => setTimeout(resolve, msec, value));
    }

    return new Promise<T>((resolve, reject) => {
        token.throwIfCancellationRequested();

        const handle = setTimeout(() => {
            registration.unregister();
            resolve(value);
        }, msec);

        const registration = token.register(() => {
            clearTimeout(handle);
            try {
                token.throwIfCancellationRequested();
            }
            catch (e) {
                reject(e);
            }
        });
    });
}