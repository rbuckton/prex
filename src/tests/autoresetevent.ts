/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { AutoResetEvent, CancellationToken, CancelError } from "../lib";

describe("autoresetevent", () => {
    describe("ctor", () => {
        it("throws if initialState not boolean", () => {
            assert.throws(() => new AutoResetEvent(<any>{}), TypeError);
        });
    });

    describe("wait", () => {
        it("throws if token not CancellationToken", async () => {
            await assert.throwsAsync(() => new AutoResetEvent().wait(<any>{}), TypeError);
        });
        it("throws if token is canceled.", async () => {
            await assert.throwsAsync(() => new AutoResetEvent().wait(CancellationToken.canceled), CancelError);
        });
    });

    it("set", async () => {
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

            await Promise.resolve();

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
});