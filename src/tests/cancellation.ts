/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { create } from "domain";
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
        it("cancel", () => {
            const source = new CancellationTokenSource();
            source.cancel();
            assert.isTrue(source.token.canBeCanceled);
            assert.isTrue(source.token.cancellationRequested);
        });
        it("close", () => {
            const source = new CancellationTokenSource();
            source.close();
            assert.isFalse(source.token.canBeCanceled);
            assert.isFalse(source.token.cancellationRequested);
        });
        it("linked tokens", () => {
            const source1 = new CancellationTokenSource();
            const linkedSource = new CancellationTokenSource([source1.token]);
            source1.cancel();
            assert.isTrue(linkedSource.token.canBeCanceled);
            assert.isTrue(linkedSource.token.cancellationRequested);
        });
        it("error when not a linked token", () => {
            assert.throws(() => new CancellationTokenSource(<any>[{}]), TypeError);
        });
        it("linked tokens already canceled", () => {
            const source1 = new CancellationTokenSource();
            source1.cancel();
            const linkedSource = new CancellationTokenSource([source1.token]);
            assert.isTrue(linkedSource.token.canBeCanceled);
            assert.isTrue(linkedSource.token.cancellationRequested);
        });
        it("cancel throws if token registration throws", (done) => {
            const error = new Error("Error during registration.");
            const domain = create();
            domain.on("error", e => {
                try {
                    assert.strictEqual(e, error);
                    done();
                }
                catch (e) {
                    done(e);
                }
            });
            domain.run(() => {
                const source = new CancellationTokenSource();
                const token = source.token;
                const registration = token.register(() => { throw error; });
                source.cancel();
            });
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
        it("throwIfCancellationRequested when canceled", () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            source.cancel();
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
        it("new token for source", () => {
            const source = new CancellationTokenSource();
            const token = new CancellationToken(source);
            source.cancel();
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
        it("cancel", () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            source.cancel();
            source.cancel();
            assert.strictEqual(callbackInvocations, 1);
        });
        it("cancel (after unregistered)", () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            registration.unregister();
            source.cancel();
            assert.strictEqual(callbackInvocations, 0);
        });
        it("close", () => {
            const source = new CancellationTokenSource();
            const token = source.token;
            let callbackInvocations = 0;
            const registration = token.register(() => callbackInvocations++);
            source.close();
            source.cancel();
            assert.strictEqual(callbackInvocations, 0);
        });
    });
});