/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import * as chai from "chai";

declare global {
    module Chai {
        interface ChaiStatic {
            Assertion: AssertionStatic;
        }
        interface AssertionStatic {
            new (target: any, message?: string): Assertion;
            addMethod(name: string, fn: Function): void;
        }
        interface Assertion {
            throwAsync(msg?: string): Promise<void>;
            throwAsync(regExp: RegExp): Promise<void>;
            throwAsync(errType: Function, msg?: string): Promise<void>;
            throwAsync(errType: Function, regExp: RegExp): Promise<void>;
            throwsAsync(msg?: string): Promise<void>;
            throwsAsync(regExp: RegExp): Promise<void>;
            throwsAsync(errType: Function, msg?: string): Promise<void>;
            throwsAsync(errType: Function, regExp: RegExp): Promise<void>;
            ThrowAsync(msg?: string): Promise<void>;
            ThrowAsync(regExp: RegExp): Promise<void>;
            ThrowAsync(errType: Function, msg?: string): Promise<void>;
            ThrowAsync(errType: Function, regExp: RegExp): Promise<void>;
        }
        interface AssertStatic {
            throwAsync(fn: Function, msg?: string): Promise<void>;
            throwAsync(fn: Function, regExp: RegExp): Promise<void>;
            throwAsync(fn: Function, errType: Function, msg?: string): Promise<void>;
            throwAsync(fn: Function, errType: Function, regExp: RegExp): Promise<void>;
            throwsAsync(fn: Function, msg?: string): Promise<void>;
            throwsAsync(fn: Function, regExp: RegExp): Promise<void>;
            throwsAsync(fn: Function, errType: Function, msg?: string): Promise<void>;
            throwsAsync(fn: Function, errType: Function, regExp: RegExp): Promise<void>;
            ThrowAsync(fn: Function, msg?: string): Promise<void>;
            ThrowAsync(fn: Function, regExp: RegExp): Promise<void>;
            ThrowAsync(fn: Function, errType: Function, msg?: string): Promise<void>;
            ThrowAsync(fn: Function, errType: Function, regExp: RegExp): Promise<void>;
        }
        interface UtilsStatic {
            flag(obj: any, key: string): any;
            flag(obj: any, key: string, value: any): void;
        }
    }
}

chai.use((chai: Chai.ChaiStatic, utils: Chai.UtilsStatic) => {
    chai.Assertion.addMethod("throwAsync", assertThrowsAsync);
    chai.Assertion.addMethod("throwsAsync", assertThrowsAsync);
    chai.Assertion.addMethod("ThrowAsync", assertThrowsAsync);

    async function assertThrowsAsync(errMsg?: string): Promise<Chai.Assertion>;
    async function assertThrowsAsync(errMsg: RegExp): Promise<Chai.Assertion>;
    async function assertThrowsAsync(errType: Function, errMsg?: string): Promise<Chai.Assertion>;
    async function assertThrowsAsync(errType: Function, errMsg: RegExp, msg?: string): Promise<Chai.Assertion>;
    async function assertThrowsAsync(errType?: Function | string | RegExp, errMsg?: string | RegExp, msg?: string) {
        const self: Chai.Assertion = this;
        if (msg) {
            utils.flag(self, "message", msg);
        }
        else {
            msg = utils.flag(self, "message");
        }

        const obj: Function = utils.flag(self, "object");

        let thrown = false;
        let thrownError: any = undefined;
        try {
            await obj();
        }
        catch (e) {
            thrown = true;
            thrownError = e;
        }

        utils.flag(self, "object", () => {
            if (thrown) {
                throw thrownError;
            }
        });

        return this.throws(errType, errMsg, msg);
    }

    chai.assert.throwsAsync = async function (fn: Function, errt?: Function | string | RegExp, errs?: string | RegExp, msg?: string) {
        if (typeof errt === "string" || errt instanceof RegExp) {
            errs = <string | RegExp>errt;
            errt = null;
        }

        await new chai.Assertion(fn, msg).to.throwAsync(<Function>errt, <any>errs);
    };
});
