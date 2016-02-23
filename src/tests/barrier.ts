/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { Barrier, AsyncQueue, CancellationToken, CancelError } from "../lib";

describe("barrier", () => {
    describe("ctor", () => {
        it("throws if participantCount not number", () => {
            assert.throws(() => new Barrier(<any>{}), TypeError);
        });
        it("throws if participantCount less than zero", () => {
            assert.throws(() => new Barrier(-1), RangeError);
        });
        it("throws if postPhaseAction not function", () => {
            assert.throws(() => new Barrier(1, <any>{}), TypeError);
        });
    });
    describe("add", () => {
        it("throws if participantCount not number", () => {
            assert.throws(() => new Barrier(1).add(<any>{}), TypeError);
        });
        it("throws if participantCount less than or equal to zero", () => {
            assert.throws(() => new Barrier(1).add(0), RangeError);
        });
        it("throws if executing post phase action", async () => {
            const queue = new AsyncQueue<void>();
            const barrier = new Barrier(1, barrier => {
                queue.put(assert.throwsAsync(() => barrier.add(1)));
            });
            await barrier.signalAndWait();
            await queue.get();
        });
    });
    describe("remove", () => {
        it("throws if participantCount not number", () => {
            assert.throws(() => new Barrier(1).remove(<any>{}), TypeError);
        });
        it("throws if participantCount less than or equal to zero", () => {
            assert.throws(() => new Barrier(1).remove(0), RangeError);
        });
        it("throws if participantCount greater than initial participants", () => {
            assert.throws(() => new Barrier(1).remove(2), RangeError);
        });
        it("throws if executing post phase action", async () => {
            const queue = new AsyncQueue<void>();
            const barrier = new Barrier(1, barrier => {
                queue.put(assert.throwsAsync(() => barrier.remove(1)));
            });
            await barrier.signalAndWait();
            await queue.get();
        });
    });
    describe("signalAndWait", () => {
        it("throws if token is not CancellationToken", async () => {
            await assert.throwsAsync(() => new Barrier(1).signalAndWait(<any>{}), TypeError);
        });
        it("throws if token is canceled", async () => {
            await assert.throwsAsync(() => new Barrier(1).signalAndWait(CancellationToken.canceled), CancelError);
        });
        it("throws if executing post phase action", async () => {
            const queue = new AsyncQueue<void>();
            const barrier = new Barrier(1, barrier => {
                queue.put(assert.throwsAsync(() => barrier.signalAndWait(), Error));
            });
            await barrier.signalAndWait();
            await queue.get();
        });
        it("throws if no registered participants", async () => {
            await assert.throwsAsync(() => new Barrier(0).signalAndWait(), Error);
        });
        it("throws if no remaining participants", async () => {
            const barrier = new Barrier(1);
            barrier.signalAndWait();
            await assert.throwsAsync(() => barrier.signalAndWait(), Error);
        });
        it("with 3 participants", async () => {
            const steps: string[] = [];
            const barrier = new Barrier(3);

            async function operation1() {
                steps.push("begin1");
                await barrier.signalAndWait();
                steps.push("end1");
            }

            async function operation2() {
                steps.push("begin2");
                await barrier.signalAndWait();
                steps.push("end2");
            }

            async function operation3() {
                steps.push("begin3");
                await barrier.signalAndWait();
                steps.push("end3");
            }

            await Promise.all([operation1(), operation2(), operation3()]);
            assert.deepEqual(["begin1", "begin2", "begin3", "end1", "end2", "end3"], steps);
        });
    });

    it("postPhaseAction", async () => {
        const steps: string[] = [];
        const barrier = new Barrier(1, () => {
            steps.push("post-phase");
        });

        async function phases() {
            steps.push("phase1");
            await barrier.signalAndWait();
            steps.push("phase2");
            await barrier.signalAndWait();
            steps.push("phase3");
        }

        await phases();
        assert.deepEqual(["phase1", "post-phase", "phase2", "post-phase", "phase3"], steps);
    });
    it("participants", async () => {
       const steps: string[] = [];
       const barrier = new Barrier(1);
       async function one() {
           steps.push("one.1");
           await barrier.signalAndWait();
           steps.push("one.2");
           barrier.add(1);
           await Promise.all([twoa(), twob()]);
           steps.push("one.3");
           barrier.remove(1);
           await barrier.signalAndWait();
           steps.push("one.4");
       }
       async function twoa() {
           steps.push("two.a.1");
           await barrier.signalAndWait();
           steps.push("two.a.2");
       }
       async function twob() {
           steps.push("two.b.1");
           await barrier.signalAndWait();
           steps.push("two.b.2");
       }
       await one();
       assert.deepEqual([
           "one.1",
           "one.2",
           "two.a.1",
           "two.b.1",
           "two.a.2",
           "two.b.2",
           "one.3",
           "one.4"
        ], steps);
    });
});