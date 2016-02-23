/*! *****************************************************************************
Copyright (c) Microsoft Corporation. 
Licensed under the Apache License, Version 2.0. 

See LICENSE file in the project root for details.
***************************************************************************** */

export function delay<T>(msec: number): Promise<void>;
export function delay<T>(msec: number, value: T | PromiseLike<T>): Promise<T>;
export function delay<T>(msec: number, value?: T | PromiseLike<T>) {
    return new Promise<T>(resolve => setTimeout(resolve, msec, value));
}