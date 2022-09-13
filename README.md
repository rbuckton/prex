<!--
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
-->

# Promise Extensions for JavaScript (prex)
Asynchronous coordination for JavaScript and TypeScript.

> **DEPRECATED: This package has been deprecated in favor of the following packages that replace it:**]
> - [`@esfx/cancelable`](https://npmjs.com/package/@esfx/cancelable):
>   - `CancelError`
> - [`@esfx/canceltoken`](https://npmjs.com/package/@esfx/canceltoken):
>   - ~~`CancellationToken`~~ is now `CancelToken`
>   - ~~`CancellationTokenSource`~~ is now `CancelSource`/`CancelToken.source()`
> - [`@esfx/async-manualresetevent`](https://npmjs.com/package/@esfx/async-manualresetevent):
>   - ~~`ManualResetEvent`~~ is now `AsyncManualResetEvent`
> - [`@esfx/async-autoresetevent`](https://npmjs.com/package/@esfx/async-autoresetevent):
>   - ~~`AutoResetEvent`~~ is now `AsyncAutoResetEvent`
> - [`@esfx/async-semaphore`](https://npmjs.com/package/@esfx/async-semaphore):
>   - ~~`Semaphore`~~ is now `AsyncSemaphore`
> - [`@esfx/async-countdown`](https://npmjs.com/package/@esfx/async-countdown):
>   - ~~`CountdownEvent`~~ is now `AsyncCountdownEvent`
> - [`@esfx/async-barrier`](https://npmjs.com/package/@esfx/async-barrier):
>   - ~~`Barrier`~~ is now `AsyncBarrier`
> - [`@esfx/async-readerwriterlock`](https://npmjs.com/package/@esfx/async-readerwriterlock):
>   - ~~`ReaderWriterLock`~~ is now `AsyncReaderWriterLock`
> - [`@esfx/async-deferred`](https://npmjs.com/package/@esfx/async-deferred):
>   - `Deferred`
> - [`@esfx/async-queue`](https://npmjs.com/package/@esfx/async-queue):
>   - `AsyncQueue`
> - [`@esfx/async-stack`](https://npmjs.com/package/@esfx/async-stack):
>   - `AsyncStack`
> - [`@esfx/async-delay`](https://npmjs.com/package/@esfx/async-delay):
>   - `delay(msec, value?)`
> - NOTE: There are no replacements for `AsyncBoundedQueue` or `Pulsar`, they have been deprecated.

This library contains a number of coordination primitives to assist in asynchronous application development in JavaScript and TypeScript.
This includes useful additions for building complex asynchronous logic including:

* Cancellation \[[Sample](#cancellation), [API Reference](docs/cancellation.md)\]
* Coordination \[[Sample](#coordination), [API Reference](docs/coordination.md)\]
* Scheduling \[[Sample](#scheduling), [API Reference](docs/scheduling.md)\]

# Installing

For the latest version:

```
npm install prex
```

# Documentation

* [API Reference](docs/index.md)
    * [Cancellation](docs/cancellation.md)
        * [Class: CancellationTokenSource](docs/cancellation.md#class-cancellationtokensource)
        * [Class: CancellationToken](docs/cancellation.md#class-cancellationtoken)
        * [Class: CancelError](docs/cancellation.md#class-cancelerror)
        * [Interface: CancellationTokenRegistration](docs/cancellation.md#interface-cancellationtokenregistration)
    * [Coordination](docs/coordination.md)
        * [Class: ManualResetEvent](docs/coordination.md#class-manualresetevent)
        * [Class: AutoResetEvent](docs/coordination.md#class-autoresetevent)
        * [Class: Semaphore](docs/coordination.md#class-semaphore)
        * [Class: CountdownEvent](docs/coordination.md#class-countdownevent)
        * [Class: Barrier](docs/coordination.md#class-barrier)
        * [Class: ReaderWriterLock](docs/coordination.md#class-readerwriterlock)
        * [Interface: LockHandle](docs/coordination.md#interface-lockhandle)
        * [Interface: UpgradeableLockHandle](docs/coordination.md#interface-upgradeablelockhandle)
        * [Class: Deferred](docs/coordination.md#class-deferred)
    * [Scheduling](docs/scheduling.md)
        * [Class: AsyncQueue](docs/scheduling.md#class-asyncqueue)
        * [Class: AsyncBoundedQueue](docs/scheduling.md#class-asyncboundedqueue)
        * [Class: AsyncStack](docs/scheduling.md#class-asyncstack)
        * [Function: delay(msec, value?)](docs/scheduling.md#function-delaymsec-value)

# Samples

## Cancellation
> API Reference: [Cancellation](docs/cancellation.md)

The [CancellationTokenSource](docs/cancellation.md#class-cancellationtokensource) and
[CancellationToken](docs/cancellation.md#class-cancellationtoken) primitives allow you to
create asynchronous operations that can be canceled externally. The following is an example
of a function used to download a file asynchronously that can be canceled:

```ts
import * as http from "http";
import * as fs from "fs";
import { CancellationTokenSource, CancellationToken } from "prex";

function downloadFile(from: string, to: string, token = CancellationToken.none) {
    return new Promise<void>((resolve, reject) => {
        const request = http.get(from);

        // abort the request if canceled.
        const registration = token.register(() => {
            request.abort();
            reject(new Error("Operation canceled."));
        });

        request.on("error", err => {
            registration.unregister();
            reject(err);
        });

        request.on("response", (response: http.IncomingMessage) => {
            response
                .pipe(fs.createWriteStream(to))
                .on("error", err => {
                    registration.unregister();
                    reject(err);
                })
                .on("end", () => {
                    registration.unregister();
                    resolve();
                });
        });
    });
}

async function main() {
    const source = new CancellationTokenSource();

    // cancel the source if the file takes more than one second to download
    setTimeout(() => source.cancel(), 1000);

    await downloadFile("http://tempuri.org/some/file", "file", source.token);
}
```

## Coordination
> API Reference: [Coordination](docs/coordination.md)

A [Semaphore](docs/coordination.md#class-semaphore) can be used to protect access to a critical
section of your code when you must limit access across multiple async operations. The following
is an example of two functions which both need exclusive access to a single resource but could
possibly be preempted when suspended while awaiting an asynchronous operation:

```ts
import { Semaphore } from "prex";

const criticalResource = new Semaphore(1);

async function updateCriticalLocalResource() {
    // Acquire a lock on the critical resource
    await criticalResource.wait();

    // Make local changes...

    // await a network resources
    await postUpdateToNetworkResource(changes);

    // release the lock
    criticalResource.release();
}

async function deleteCriticalLocalResource() {
    // Acquire a lock on the critical resource
    await criticalResource.wait();

    // Make local changes...

    // await a network resources
    await postUpdateToNetworkResource(changes);

    // release the lock
    criticalResource.release();
}

declare function postUpdateToNetworkResource(changes): Promise<void>;
```

A [Barrier](docs/coordination.md#class-barrier) can be used to coordinate complex async operations:

```ts
import { Barrier } from "prex";

const barrier = new Barrier(/*participantCount*/ 3);

async function processNpcAI() {
    while (true) {
        // process AI activities...
        await barrier.signalAndWait();
    }
}

async function processGameRules() {
    while (true) {
        // process game rules
        await barrier.signalAndWait();
    }
}

async function processGameInput() {
    while (true) {
        // process user input
        await barrier.signalAndWait();
    }
}

```

## Scheduling
> API Reference: [Scheduling](docs/scheduling.md)

An [AsyncQueue](docs/scheduling.md#class-asyncqueue) is a useful primitive for scheduling
asynchronous work:

```ts
import { AsyncQueue } from "prex";

const workItems = new AsyncQueue();

function queueUserWorkItem(action: () => void) {
    workItems.put(action);
}

async function processWorkItems() {
    while (true) {
        const action = await workItems.get();
        try {
            action();
        }
        catch (e) {
            console.error(e);
        }
    }
}
```

# License
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See [LICENSE](LICENSE) file in the project root for details.
