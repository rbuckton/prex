<!--
Copyright (c) Microsoft Corporation.  
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
-->

# Coordination
[Back to Index](index.md)

### Table of Contents
* [Class: ManualResetEvent](#class-manualresetevent)
  * [new ManualResetEvent(initialState?)](#new-manualreseteventinitialstate)
  * [manual.isSet](#manualisset)
  * [manual.set()](#manualset)
  * [manual.reset()](#manualreset)
  * [manual.wait(token?)](#manualwaittoken)
* [Class: AutoResetEvent](#class-autoresetevent)
  * [new AutoResetEvent(initialState?)](#new-autoreseteventinitialstate)
  * [auto.set()](#autoset)
  * [auto.reset()](#autoreset)
  * [auto.wait(token?)](#autowaittoken)
* [Class: Semaphore](#class-semaphore)
  * [new Semaphore(initialCount, maxCount?)](#new-semaphoreinitialcount-maxcount)
  * [semaphore.count](#semaphorecount)
  * [semaphore.wait(token?)](#semaphorewaittoken)
  * [semaphore.release(count?)](#semaphorereleasecount)
* [Class: CountdownEvent](#class-countdownevent)
  * [new CountdownEvent(initialCount)](#new-countdowneventinitialcount)
  * [countdown.initialCount](#countdowninitialcount)
  * [countdown.remainingCount](#countdownremainingcount)
  * [countdown.add(count?)](#countdownaddcount)
  * [countdown.reset(count?)](#countdownresetcount)
  * [countdown.signal(count?)](#countdownsignalcount)
  * [countdown.wait(token?)](#countdownwaittoken)
* [Class: Barrier](#class-barrier)
  * [new Barrier(participantCount, postPhaseAction?)](#new-barrierparticipantcount-postphaseaction)
  * [barrier.currentPhaseNumber](#barriercurrentphasenumber)
  * [barrier.participantCount](#barrierparticipantcount)
  * [barrier.remainingParticipants](#barrierremainingparticipants)
  * [barrier.add(participantCount?)](#barrieraddparticipantcount)
  * [barrier.remove(participantCount?)](#barrierremoveparticipantcount)
  * [barrier.signalAndWait(token?)](#barriersignalandwaittoken)
* [Class: ReaderWriterLock](#class-readerwriterlock)
  * [new ReaderWriterLock()](#new-readerwriterlock)
  * [lock.read(token?)](#lockreadtoken)
  * [lock.upgradeableRead(token?)](#lockupgradeablereadtoken)
  * [lock.write(token?)](#lockwritetoken)
* [Interface: LockHandle](#interface-lockhandle)
  * [handle.release()](#handlerelease)
* [Interface: UpgradeableLockHandle](#interface-upgradeablelockhandle)
  * [handle.upgrade(token?)](#handleupgradetoken)
* [Class: Deferred](#class-deferred)
  * [new Deferred()](#new-deferred)
  * [deferred.promise](#deferredpromise)
  * [deferred.resolve](#deferredresolve)
  * [deferred.reject](#deferredreject)

# Class: ManualResetEvent
Asynchronously notifies one or more waiting Promises that an event has occurred.

### Syntax
```ts
export declare class ManualResetEvent {
    constructor(initialState?: boolean);
    readonly isSet: boolean;
    set(): void;
    reset(): void;
    wait(token?: CancellationToken): Promise<void>;
}
```

## new ManualResetEvent(initialState?)
Initializes a new instance of the ManualResetEvent class.
* `initialState` [&lt;Boolean&gt;][Boolean] A value indicating whether to set the initial state to signaled.

## manual.isSet
Gets a value indicating whether the event is signaled.
* Returns: [&lt;Boolean&gt;][Boolean]

## manual.set()
Sets the state of the event to signaled, resolving one or more waiting Promises.

## manual.reset()
Sets the state of the event to nonsignaled, causing asynchronous operations to pause.

## manual.wait(token?)
Asynchronously waits for the event to become signaled.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves when the event is signaled, or rejects if the token is canceled.

# Class: AutoResetEvent
Asynchronously notifies one or more waiting Promises that an event has occurred.

### Syntax
```ts
export declare class AutoResetEvent {
    constructor(initialState?: boolean);
    set(): void;
    reset(): void;
    wait(token?: CancellationToken): Promise<void>;
}
```

## new AutoResetEvent(initialState?)
Initializes a new instance of the AutoResetEvent class.
* `initialState` [&lt;Boolean&gt;][Boolean] A value indicating whether to set the initial state to signaled.

## auto.set()
Sets the state of the event to signaled, resolving one or more waiting Promises.
The event is then automatically reset.

## auto.reset()
Sets the state of the event to nonsignaled, causing asynchronous operations to pause.

## auto.wait(token?)
Asynchronously waits for the event to become signaled.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves when the event is signaled, or rejects if the token is canceled.

# Class: Semaphore
Limits the number of asynchronous operations that can access a resource
or pool of resources.

### Syntax
```ts
export declare class Semaphore {
    constructor(initialCount: number, maxCount?: number);
    readonly count: number;
    wait(token?: CancellationToken): Promise<void>;
    release(count?: number): void;
}
```

## new Semaphore(initialCount, maxCount?)
Initializes a new instance of the Semaphore class.
* `intialCount` [&lt;Number&gt;][Number] The initial number of entries.
* `maxCount` [&lt;Number&gt;][Number] The maximum number of entries.

## semaphore.count
Gets the number of remaining asynchronous operations that can enter
the Semaphore.
* Returns: [&lt;Number&gt;][Number]

## semaphore.wait(token?)
Asynchronously waits for the event to become signaled.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves when the event is signaled, or rejects if the token is canceled.

## semaphore.release(count?)
Releases the Semaphore one or more times.
* `count` [&lt;Number&gt;][Number] The number of times to release the Semaphore.

# Class: CountdownEvent
An event that is set when all participants have signaled.

### Syntax
```ts
export declare class CountdownEvent {
    constructor(initialCount: number);
    readonly initialCount: number;
    readonly remainingCount: number;
    add(count?: number): void;
    reset(count?: number): void;
    signal(count?: number): void;
    wait(token?: CancellationToken): Promise<void>;
}
```

## new CountdownEvent(initialCount)
Initializes a new instance of the [CountdownEvent](#class-countdownevent) class.
* `initialCount` [&lt;Number&gt;][Number] The initial participant count.

## countdown.initialCount
Gets the number of signals initially required to set the event.
* Returns: [&lt;Number&gt;][Number]

## countdown.remainingCount
Gets the number of remaining signals required to set the event.
* Returns: [&lt;Number&gt;][Number]

## countdown.add(count?)
Increments the event's current count by one or more.
* `count` [&lt;Number&gt;][Number] An optional count specifying the additional number of signals for which the event will wait.

## countdown.reset(count?)
Resets the remaining and initial count to the specified value, or the initial count.
* `count` [&lt;Number&gt;][Number] An optional count specifying the number of required signals.

## countdown.signal(count?)
Registers one or more signals with the CountdownEvent, decrementing the remaining count.
* `count` [&lt;Number&gt;][Number] An optional count specifying the number of signals to register.

## countdown.wait(token?)
Asynchronously waits for the event to become signaled.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves when the event is signaled, or rejects if the token is canceled.

# Class: Barrier
Enables multiple tasks to cooperatively work on an algorithm through
multiple phases.

### Syntax
```ts
export declare class Barrier {
    constructor(participantCount: number, postPhaseAction?: (barrier: Barrier) => void | PromiseLike<void>);
    readonly currentPhaseNumber: number;
    readonly participantCount: number;
    readonly remainingParticipants: number;
    add(participantCount?: number): void;
    remove(participantCount?: number): void;
    signalAndWait(token?: CancellationToken): Promise<void>;
}
```

## new Barrier(participantCount, postPhaseAction?)
Initializes a new instance of the Barrier class.
* `participantCount` [&lt;Number&gt;][Number] The initial number of participants for the barrier.
* `postPhaseAction` [&lt;Function&gt;][Function] An action to execute between each phase.

## barrier.currentPhaseNumber
Gets the number of the Barrier's current phase.
* Returns: [&lt;Number&gt;][Number]

## barrier.participantCount
Gets the total number of participants in the barrier.
* Returns: [&lt;Number&gt;][Number]

## barrier.remainingParticipants
Gets the number of participants in the barrier that haven't yet signaled in the current phase.
* Returns: [&lt;Number&gt;][Number]

## barrier.add(participantCount?)
Notifies the Barrier there will be additional participants.
* `participantCount` [&lt;Number&gt;][Number] The number of additional participants.

## barrier.remove(participantCount?)
Notifies the Barrier there will be fewer participants.
* `participantCount` [&lt;Number&gt;][Number] The number of participants to remove.

## barrier.signalAndWait(token?)
Signals that a participant has reached the barrier and waits for all other participants
to reach the barrier.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves when all participants have signaled, or rejects if the token is canceled.

# Class: ReaderWriterLock
Coordinates readers and writers for a resource.

### Syntax
```ts
export declare class ReaderWriterLock {
    constructor();
    read(token?: CancellationToken): Promise<LockHandle>;
    upgradeableRead(token?: CancellationToken): Promise<UpgradeableLockHandle>;
    write(token?: CancellationToken): Promise<LockHandle>;
}
```

## new ReaderWriterLock()
Initializes a new instance of the ReaderWriterLock class.

## lock.read(token?)
Asynchronously waits for and takes a read lock on a resource.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves with a [LockHandle](#interface-lockhandle) when the lock is taken, or rejects if the token is canceled.

## lock.upgradeableRead(token?)
Asynchronously waits for and takes a read lock on a resource that can later be upgraded to a write lock.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves with a [LockHandle](#interface-lockhandle) when the lock is taken, or rejects if the token is canceled.

## lock.write(token?)
Asynchronously waits for and takes a write lock on a resource.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves with a [LockHandle](#interface-lockhandle) when the lock is taken, or rejects if the token is canceled.

# Interface: LockHandle
An object used to release a held lock.

### Syntax
```ts
export interface LockHandle {
    release(): void;
}
```

# handle.release()
Releases the lock.

# Interface: UpgradeableLockHandle
An object used to release a held lock or upgrade to a write lock.

### Syntax
```ts
export interface UpgradeableLockHandle {
    upgrade(token?: CancellationToken): Promise<LockHandle>;
}
```

# handle.upgrade(token?)
Upgrades the lock to a write lock.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken used to cancel the request.
* Returns: [&lt;Promise&gt;][Promise] A Promise that resolves with a [LockHandle](#interface-lockhandle) when the lock is taken, or rejects if the token is canceled.

# Class: Deferred
Encapsulates a Promise and exposes its resolve and reject callbacks.

### Syntax
```ts
export declare class Deferred<T> {
    constructor();
    readonly promise: Promise<T>;
    resolve(value?: PromiseLike<T> | T): void;
    reject(reason: any): void;
}
```

## new Deferred()
Initializes a new instance of the Deferred class.

## deferred.promise
Gets the promise.
* Returns: [&lt;Promise&gt;][Promise]

## deferred.resolve(value?)
Resolves the promise.
* `value` &lt;`any`&gt; The value used to resolve the promise.

## deferred.reject(reason)
Rejects the promise.
* `reason` &lt;`any`&gt; The reason the promise was rejected.

[String]: http://ecma-international.org/ecma-262/6.0/index.html#sec-string-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor
[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Error]: http://ecma-international.org/ecma-262/6.0/index.html#sec-error-constructor
[Promise]: http://ecma-international.org/ecma-262/6.0/index.html#sec-promise-constructor
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[CancellationToken]: cancellation.md#class-cancellationtoken