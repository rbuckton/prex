/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { ReaderWriterLock, CancellationToken, CancelError } from "../lib";

describe("readerwriterlock", () => {
    describe("read", () => {
        it("throws when token not CancellationToken", async () => {
            await assert.throwsAsync(() => new ReaderWriterLock().read(<any>{}), TypeError);
        });
        it("throws when token is canceled", async () => {
            await assert.throwsAsync(() => new ReaderWriterLock().read(CancellationToken.canceled), CancelError);
        });
        it("multiple readers", async () => {
            const steps: string[] = [];
            const rw = new ReaderWriterLock();
            async function operation1() {
                await rw.read();
                steps.push("operation1");
            }
            async function operation2() {
                await rw.read();
                steps.push("operation2");
            }
            await Promise.all([operation1(), operation2()]);
            assert.deepEqual(steps, ["operation1", "operation2"]);
        });
        it("waits on existing writer", async () => {
            const steps: string[] = [];
            const rw = new ReaderWriterLock();
            const writeLockPromise = rw.write();
            const readLockPromise = rw.read();
            async function writer() {
                const lock = await writeLockPromise;
                steps.push("writer");
                lock.release();
            }
            async function reader() {
                const lock = await readLockPromise;
                steps.push("reader");
                lock.release();
            }
            await Promise.all([reader(), writer()]);
            assert.deepEqual(steps, ["writer", "reader"]);
        });
    });
    describe("upgradeableRead", () => {
        it("throws when token not CancellationToken", async () => {
            await assert.throwsAsync(() => new ReaderWriterLock().upgradeableRead(<any>{}), TypeError);
        });
        it("throws when token is canceled", async () => {
            await assert.throwsAsync(() => new ReaderWriterLock().upgradeableRead(CancellationToken.canceled), CancelError);
        });
        it("can take while reading", async () => {
            const steps: string[] = [];
            const rw = new ReaderWriterLock();
            const readLockPromise1 = rw.read();
            const upgradeableReadLockPromise = rw.upgradeableRead();
            const readLockPromise2 = rw.read();
            async function reader1() {
                const lock = await readLockPromise1;
                steps.push("reader1");
                lock.release();
            }
            async function reader2() {
                const lock = await readLockPromise2;
                steps.push("reader2");
                lock.release();
            }
            async function upgradeableReader() {
                const lock = await upgradeableReadLockPromise;
                steps.push("upgradeableReader");
                lock.release();
            }

            await Promise.all([reader1(), reader2(), upgradeableReader()]);
            assert.deepEqual(steps, [
                "reader1",
                "reader2",
                "upgradeableReader",
            ]);
        });
        describe("upgrade", () => {
            it("throws when token not CancellationToken", async () => {
                const rw = new ReaderWriterLock();
                const upgradeable = await rw.upgradeableRead();
                await assert.throwsAsync(() => upgradeable.upgrade(<any>{}), TypeError);
            });
            it("throws when token is canceled", async () => {
                const rw = new ReaderWriterLock();
                const upgradeable = await rw.upgradeableRead();
                await assert.throwsAsync(() => upgradeable.upgrade(CancellationToken.canceled), CancelError);
            });
        });
    });
    describe("write", () => {
        it("throws when token not CancellationToken", async () => {
            await assert.throwsAsync(() => new ReaderWriterLock().write(<any>{}), TypeError);
        });
        it("throws when token is canceled", async () => {
            await assert.throwsAsync(() => new ReaderWriterLock().write(CancellationToken.canceled), CancelError);
        });
        it("waits on existing readers", async () => {
            const steps: string[] = [];
            const rw = new ReaderWriterLock();
            const readLockPromises = [rw.read(), rw.read()];
            const writeLockPromise = rw.write();
            async function reader() {
                const locks = await Promise.all(readLockPromises);
                steps.push("reader");
                locks[0].release();
                locks[1].release();
            }
            async function writer() {
                const lock = await writeLockPromise;
                steps.push("writer");
                lock.release();
            }
            await Promise.all([writer(), reader()]);
            assert.deepEqual(steps, ["reader", "writer"]);
        });
    });
});