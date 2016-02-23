/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { AsyncQueue } from "../lib";

describe("async queue", () => {
    describe("ctor", () => {
        it("throws if not iterable", () => {
            assert.throws(() => new AsyncQueue(<any>{}), TypeError);
        })
        it("from iterable", async () => {
            const queue = new AsyncQueue([1, 2, 3]);
            const value1 = await queue.get();
            const value2 = await queue.get();
            const value3 = await queue.get();
            assert.strictEqual(value1, 1);
            assert.strictEqual(value2, 2);
            assert.strictEqual(value3, 3);
        });
    });
    it("put1 get1", async () => {
        const queue = new AsyncQueue<number>();
        queue.put(1);
        const value = await queue.get();
        assert.strictEqual(value, 1);
    });
    it("get1 put1", async () => {
        const queue = new AsyncQueue<number>();
        const getPromise = queue.get();
        await Promise.resolve();
        queue.put(1);
        const value = await getPromise;
        assert.strictEqual(value, 1);
    });
    it("put2 get2", async () => {
        const queue = new AsyncQueue<number>();
        queue.put(1);
        queue.put(2);
        const value1 = await queue.get();
        const value2 = await queue.get();
        assert.strictEqual(value1, 1);
        assert.strictEqual(value2, 2);
    });
});
