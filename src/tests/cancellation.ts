/*! *****************************************************************************
Copyright (c) Microsoft Corporation. 
Licensed under the Apache License, Version 2.0. 

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { CancellationTokenSource, CancellationToken, CancellationTokenRegistration, CancelError } from "../lib";

describe("cancellation", () => {
    describe("source", () => {
        it("defaults", () => {
            const source = new CancellationTokenSource();
            assert.isDefined(source.token);
            assert.strictEqual(source.token, source.token);
            assert.isTrue(source.token.canBeCanceled);
            assert.isFalse(source.token.cancellationRequested);
        });
        it("cancel", async () => {
            const source = new CancellationTokenSource();
            await source.cancel();
            assert.isTrue(source.token.canBeCanceled);
            assert.isTrue(source.token.cancellationRequested);
        });
        it("close", () => {
            const source = new CancellationTokenSource();
            source.close();
            assert.isFalse(source.token.canBeCanceled);
            assert.isFalse(source.token.cancellationRequested);
        });
        it("linked tokens", async () => {
            const source1 = new CancellationTokenSource();
            const linkedSource = new CancellationTokenSource([source1.token]);
            await source1.cancel();
            assert.isTrue(linkedSource.token.canBeCanceled);
            assert.isTrue(linkedSource.token.cancellationRequested);
        });
        it("error when not a linked token", () => {
            assert.throws(() => new CancellationTokenSource(<any>[{}]), TypeError);
        });
        it("linked tokens already canceled", async () => {
            const source1 = new CancellationTokenSource();
            await source1.cancel();
            const linkedSource = new CancellationTokenSource([source1.token]);
            assert.isTrue(linkedSource.token.canBeCanceled);
            assert.isTrue(linkedSource.token.cancellationRequested);
        });
        it("cancel throws if token registration throws", async () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            const error = new Error("Error during registration.");
            const registration = token.register(() => { throw error; });
            let caughtError: Error;
            try {
                await source.cancel();
            }
            catch (e) {
                caughtError = e;
            }
            assert.strictEqual(caughtError, error);
        });
        it("register throws when not a function", () => {
            const source = new CancellationTokenSource();
            assert.throws(() => source.token.register(<any>{}), TypeError);
        });
    });

    describe("token", () => {
        it("ctor throws when not a CancellationTokenSource", () => {
            assert.throws(() => new CancellationToken(<any>{}), TypeError);
        });
        it("throwIfCancellationRequested when not canceled", () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            assert.doesNotThrow(() => token.throwIfCancellationRequested());
        });
        it("throwIfCancellationRequested when canceled", async () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            await source.cancel();
            assert.throws(() => token.throwIfCancellationRequested(), CancelError);
        });
        it("close", () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            source.close();
            assert.isFalse(token.canBeCanceled);
            assert.isFalse(token.cancellationRequested);
        });
        it("none", () => {
            const token = CancellationToken.none;
            assert.strictEqual(token, CancellationToken.none);
            assert.isFalse(token.canBeCanceled);
            assert.isFalse(token.cancellationRequested);
        });
        it("new token for source", async () => {
            const source = new CancellationTokenSource();
            const token = new CancellationToken(source);
            await source.cancel();
            assert.notStrictEqual(source.token, token);
            assert.isTrue(token.canBeCanceled);
            assert.isTrue(token.cancellationRequested);
        });
        it("register throws when not a function", () => {
            const token = new CancellationToken();
            assert.throws(() => token.register(<any>{}), TypeError);
        });
    });

    describe("registration", () => {
        it("cancel", async () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            await source.cancel();
            await source.cancel();
            assert.strictEqual(callbackInvocations, 1);
        });
        it("cancel (after unregistered)", async () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            registration.unregister();
            await source.cancel();
            assert.strictEqual(callbackInvocations, 0);
        });
        it("cancel executes in later turn", async () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            const cancelPromise = source.cancel();
            const callbackInvocationsInitialTurn = callbackInvocations;
            await cancelPromise;
            const callbackInvocationsLaterTurn = callbackInvocations;
            assert.strictEqual(callbackInvocationsInitialTurn, 0);
            assert.strictEqual(callbackInvocationsLaterTurn, 1);
        });
        it("close", async () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            source.close();
            await source.cancel();
            assert.strictEqual(callbackInvocations, 0);
        });
    });
});