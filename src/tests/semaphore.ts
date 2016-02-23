/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { Semaphore, Barrier, CancellationToken, CancelError } from "../lib";

describe("semaphore", () => {
    describe("ctor", () => {
        it("throws when initialCount not number", () => {
            assert.throws(() => new Semaphore(<any>{}), TypeError);
        });
        it("throws when maxCount not number", () => {
            assert.throws(() => new Semaphore(0, <any>{}), TypeError);
        });
        it("throws when initialCount is less than zero", () => {
            assert.throws(() => new Semaphore(-1), RangeError);
        });
        it("throws when maxCount is less than or equal to zero", () => {
            assert.throws(() => new Semaphore(0, 0), RangeError);
        });
        it("throws when initialCount is greater than maxCount", () => {
            assert.throws(() => new Semaphore(2, 1), RangeError);
        });
    });

    describe("wait", () => {
        it("throws when token is not CancellationToken", async () => {
            await assert.throwsAsync(() => new Semaphore(1).wait(<any>{}), TypeError);
        });
        it("throws when token is canceled", async () => {
            await assert.throwsAsync(() => new Semaphore(1).wait(CancellationToken.canceled), CancelError);
        });
    });

    describe("release", () => {
        it("throws when count not number", () => {
            assert.throws(() => new Semaphore(1).release(<any>{}), TypeError);
        });
        it("throws when count is less than or equal to zero", () => {
            assert.throws(() => new Semaphore(1).release(0), RangeError);
        });
        it("throws when count greater than available count", () => {
            assert.throws(() => new Semaphore(2, 2).release(1), RangeError);
        });
    });

    it("semaphore(1)", async () => {
        const steps: string[] = [];
        const semaphore = new Semaphore(1);

        async function operation1() {
            steps.push("operation1.1");
            await semaphore.wait();
            steps.push("operation1.2");
            semaphore.release();
        }

        async function operation2() {
            steps.push("operation2.1");
            await semaphore.wait();
            steps.push("operation2.2");
            semaphore.release();
        }

        await Promise.all([operation1(), operation2()]);
        assert.deepEqual(["operation1.1", "operation2.1", "operation1.2", "operation2.2"], steps);
    });

    it("semaphore(2)", async () => {
        const steps: string[] = [];
        const semaphore = new Semaphore(2);
        const barrier = new Barrier(2, () => {
            steps.push("barrier");
            semaphore.release(2);
        });

        async function operation1() {
            steps.push("operation1.1");
            await semaphore.wait();
            steps.push("operation1.2");
            await barrier.signalAndWait();
        }

        async function operation2() {
            steps.push("operation2.1");
            await semaphore.wait();
            steps.push("operation2.2");
            await barrier.signalAndWait();
        }

        async function operation3() {
            steps.push("operation3.1");
            await semaphore.wait();
            steps.push("operation3.2");
            semaphore.release();
        }

        await Promise.all([operation1(), operation2(), operation3()]);
        assert.deepEqual([
            "operation1.1",
            "operation2.1",
            "operation3.1",
            "operation1.2",
            "operation2.2",
            "barrier",
            "operation3.2"
        ], steps);
    });
});