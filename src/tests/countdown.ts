/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { CountdownEvent, ManualResetEvent } from "../lib";

describe("countdown", () => {
    describe("ctor", () => {
        it("throws if initialCount not number", () => {
            assert.throws(() => new CountdownEvent(<any>{}), TypeError);
        });
        it("throws if initialCount less than zero", () => {
            assert.throws(() => new CountdownEvent(-1), RangeError);
        });
    });
    describe("add", () => {
        it("throws if count not number", () => {
            assert.throws(() => new CountdownEvent(1).add(<any>{}), TypeError);
        });
        it("throws if count less than or equal to zero", () => {
            assert.throws(() => new CountdownEvent(1).add(0), RangeError);
        });
        it("throws if already signaled", () => {
            assert.throws(() => new CountdownEvent(0).add(1), Error);
        });
        it("for count = 1", async () => {
            const steps: string[] = [];
            const event = new ManualResetEvent();
            const countdown = new CountdownEvent(2);
            async function waiter() {
                steps.push("before wait");
                await countdown.wait();
                steps.push("after wait");
            }
            async function operation1() {
                await event.wait();
                steps.push("operation1");
                countdown.signal();
            }
            async function operation2() {
                await event.wait();
                steps.push("operation2");
                countdown.add();
            }
            async function operation3() {
                await event.wait();
                await Promise.resolve();
                steps.push("operation3");
                countdown.signal();
            }
            async function operation4() {
                await event.wait();
                await Promise.resolve();
                steps.push("operation4");
                countdown.signal();
            }
            async function start() {
                event.set();
            }

            await Promise.all([waiter(), operation1(), operation2(), operation3(), operation4(), start()]);
            assert.deepEqual([
                "before wait",
                "operation1",
                "operation2",
                "operation3",
                "operation4",
                "after wait"
            ], steps);
        });
    });
    describe("reset", () => {
        it("throws if count not number", () => {
            assert.throws(() => new CountdownEvent(1).reset(<any>{}), TypeError);
        });
        it("throws if count less than zero", () => {
            assert.throws(() => new CountdownEvent(1).reset(-1), RangeError);
        });
        it("changes initial count", () => {
            const countdown = new CountdownEvent(1);
            countdown.reset(3);
            assert.strictEqual(countdown.initialCount, 3);
            assert.strictEqual(countdown.remainingCount, 3);
        });
        it("restores initial count", () => {
            const countdown = new CountdownEvent(3);
            countdown.signal(1);
            countdown.reset();
            assert.strictEqual(countdown.initialCount, 3);
            assert.strictEqual(countdown.remainingCount, 3);
        });
    });
    describe("signal", () => {
        it("throws if count not number", () => {
            assert.throws(() => new CountdownEvent(1).signal(<any>{}), TypeError);
        });
        it("throws if count less than or equal to zero", () => {
            assert.throws(() => new CountdownEvent(1).signal(0), RangeError);
        });
        it("throws if count greater than remaining count", () => {
            assert.throws(() => new CountdownEvent(0).add(1), Error);
        });
        it("for count = 1", async () => {
            const steps: string[] = [];
            const event = new ManualResetEvent();
            const countdown = new CountdownEvent(3);
            async function waiter() {
                steps.push("before wait");
                await countdown.wait();
                steps.push("after wait");
            }
            async function operation1() {
                await event.wait();
                steps.push("operation1");
                countdown.signal();
            }
            async function operation2() {
                await event.wait();
                steps.push("operation2");
                countdown.signal();
            }
            async function operation3() {
                await event.wait();
                steps.push("operation3");
                countdown.signal();
            }
            async function start() {
                event.set();
            }

            await Promise.all([waiter(), operation1(), operation2(), operation3(), start()]);
            assert.deepEqual([
                "before wait",
                "operation1",
                "operation2",
                "operation3",
                "after wait"
            ], steps);
        });
        it("for count = 2", async () => {
            const steps: string[] = [];
            const event = new ManualResetEvent();
            const countdown = new CountdownEvent(3);
            async function waiter() {
                steps.push("before wait");
                await countdown.wait();
                steps.push("after wait");
            }
            async function operation1() {
                await event.wait();
                steps.push("operation1");
                countdown.signal(2);
            }
            async function operation2() {
                await event.wait();
                steps.push("operation2");
                countdown.signal();
            }
            async function start() {
                event.set();
            }

            await Promise.all([waiter(), operation1(), operation2(), start()]);
            assert.deepEqual([
                "before wait",
                "operation1",
                "operation2",
                "after wait"
            ], steps);
        });
    });
});