/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { AsyncStack } from "../lib";

describe("async stack", () => {
    describe("ctor", () => {
        it("throws if not iterable", () => {
            assert.throws(() => new AsyncStack(<any>{}), TypeError);
        })
        it("from iterable", async () => {
            const stack = new AsyncStack([1, 2, 3]);
            const sizeAfterConstruct = stack.size;
            const value1 = await stack.pop();
            const value2 = await stack.pop();
            const value3 = await stack.pop();
            assert.strictEqual(value1, 3);
            assert.strictEqual(value2, 2);
            assert.strictEqual(value3, 1);
            assert.strictEqual(sizeAfterConstruct, 3);
            assert.strictEqual(stack.size, 0);
        });
    });

    it("push1 pop1", async () => {
        const stack = new AsyncStack<number>();
        stack.push(1);
        const sizeAfterPush = stack.size;
        const value = await stack.pop();
        assert.strictEqual(value, 1);
        assert.strictEqual(sizeAfterPush, 1);
        assert.strictEqual(stack.size, 0);
    });
    it("pop1 push1", async () => {
        const stack = new AsyncStack<number>();
        const popPromise = stack.pop();
        const sizeAfterPop = stack.size;
        await Promise.resolve();
        stack.push(1);
        const value = await popPromise;
        assert.strictEqual(value, 1);
        assert.strictEqual(sizeAfterPop, -1);
        assert.strictEqual(stack.size, 0);
    });
    it("push2 pop2", async () => {
        const stack = new AsyncStack<number>();
        stack.push(1);
        stack.push(2);
        const sizeAfterPush = stack.size;
        const value1 = await stack.pop();
        const value2 = await stack.pop();
        assert.strictEqual(value1, 2);
        assert.strictEqual(value2, 1);
        assert.strictEqual(sizeAfterPush, 2);
        assert.strictEqual(stack.size, 0);
    });
    it("pop2 push2", async () => {
        const stack = new AsyncStack<number>();
        const pop1 = stack.pop();
        const pop2 = stack.pop();
        const sizeAfterPop = stack.size;
        stack.push(1);
        stack.push(2);
        const value1 = await pop1;
        const value2 = await pop2;
        assert.strictEqual(value1, 1);
        assert.strictEqual(value2, 2);
        assert.strictEqual(sizeAfterPop, -2);
        assert.strictEqual(stack.size, 0);
    });
});
