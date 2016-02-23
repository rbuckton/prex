/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { Deferred } from "../lib";

describe("deferred", () => {
    it("resolve", async () => {
        const deferred = new Deferred<number>();
        deferred.resolve(1);
        const result = await deferred.promise;
        assert.strictEqual(result, 1);
    });
    it("reject", async () => {
        const deferred = new Deferred<void>();
        deferred.reject(new Error());
        await assert.throwsAsync(() => deferred.promise);
    });
});