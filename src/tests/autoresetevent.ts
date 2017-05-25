/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { AutoResetEvent, CancellationTokenSource, CancellationToken, CancelError, delay } from "../lib";

describe("autoresetevent", () => {
    describe("ctor", () => {
        it("start signaled", async () => {
            const event = new AutoResetEvent(true);
            async function waitForEvent() {
                await event.wait();
                return 1;
            }
            async function waitForDelay() {
                await delay(10);
                return 2;
            }
            const result = await Promise.race([waitForEvent(), waitForDelay()]);
            assert.strictEqual(result, 1);
        });
        it("start signaled and reset", async () => {
            const event = new AutoResetEvent(true);
            event.reset();

            async function waitForEvent() {
                await event.wait();
                return 1;
            }
            async function waitForDelay() {
                await delay(10);
                return 2;
            }

            const result = await Promise.race([waitForEvent(), waitForDelay()]);
            assert.strictEqual(result, 2);
        });
        it("throws if initialState not boolean", () => {
            assert.throws(() => new AutoResetEvent(<any>{}), TypeError);
        });
    });

    describe("wait", () => {
        it("when canceled later", async () => {
            const event = new AutoResetEvent();
            const source = new CancellationTokenSource();
            const waitPromise = event.wait(source.token);
            source.cancel();
            await assert.throwsAsync(() => waitPromise, CancelError);
        });
        it("when canceled after set", async () => {
            const event = new AutoResetEvent();
            const source = new CancellationTokenSource();
            const waitPromise = event.wait(source.token);
            event.set();
            source.cancel();
            await waitPromise;
        });
        it("throws if token not CancellationToken", async () => {
            await assert.throwsAsync(() => new AutoResetEvent().wait(<any>{}), TypeError);
        });
        it("throws if token is canceled.", async () => {
            await assert.throwsAsync(() => new AutoResetEvent().wait(CancellationToken.canceled), CancelError);
        });
    });

    describe("set", () => {
        it("before waiters", async () => {
            const steps: string[] = [];
            const event = new AutoResetEvent();

            async function setEvent() {
                steps.push("set1");
                event.set();
            }

            async function waitForEvent() {
                steps.push("before wait1");
                await event.wait();
                steps.push("after wait1");
            }

            await Promise.all([setEvent(), waitForEvent()]);
            assert.deepEqual(steps, [
                "set1",
                "before wait1",
                "after wait1",
            ]);
        });

        it("general", async () => {
            const steps: string[] = [];
            const event = new AutoResetEvent();

            async function waitForEvent() {
                steps.push("before wait1");
                await event.wait();
                steps.push("after wait1");

                steps.push("before wait2");
                await event.wait();
                steps.push("after wait2");
            }

            async function setEvent() {
                steps.push("set1");
                event.set();

                await delay(1);

                steps.push("set2");
                event.set();
            }

            await Promise.all([waitForEvent(), setEvent()]);
            assert.deepEqual([
                "before wait1",
                "set1",
                "after wait1",
                "before wait2",
                "set2",
                "after wait2"],
                steps);
        });

        it("before waiters when already signaled", async () => {
            const steps: string[] = [];
            const event = new AutoResetEvent(true);

            async function setEvent() {
                steps.push("set1");
                event.set();
            }

            async function waitForEvent() {
                steps.push("before wait1");
                await event.wait();
                steps.push("after wait1");
            }

            await Promise.all([setEvent(), waitForEvent()]);
            assert.deepEqual(steps, [
                "set1",
                "before wait1",
                "after wait1",
            ]);
        });
    });
});