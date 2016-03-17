<!--
Copyright (c) Microsoft Corporation.  
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
-->

# Promise Extensions for JavaScript (prex)
Asynchronous coordination for JavaScript and TypeScript.

This library contains a number of coordination primitives to assist in asynchronous application development in JavaScript and TypeScript.

# Topics
* [Cancellation](cancellation.md)
    * [Class: CancellationTokenSource](cancellation.md#class-cancellationtokensource)
    * [Class: CancellationToken](cancellation.md#class-cancellationtoken)
    * [Class: CancelError](cancellation.md#class-cancelerror)
    * [Interface: CancellationTokenRegistration](cancellation.md#interface-cancellationtokenregistration)
* [Coordination](coordination.md)
    * [Class: ManualResetEvent](coordination.md#class-manualresetevent)
    * [Class: AutoResetEvent](coordination.md#class-autoresetevent)
    * [Class: Semaphore](coordination.md#class-semaphore)
    * [Class: CountdownEvent](coordination.md#class-countdownevent)
    * [Class: Barrier](coordination.md#class-barrier)
    * [Class: ReaderWriterLock](coordination.md#class-readerwriterlock)
    * [Interface: LockHandle](coordination.md#interface-lockhandle)
    * [Interface: UpgradeableLockHandle](coordination.md#interface-upgradeablelockhandle)
    * [Class: Deferred](coordination.md#class-deferred)
* [Scheduling](scheduling.md)
    * [Class: AsyncQueue](scheduling.md#class-asyncqueue)
    * [Class: AsyncStack](scheduling.md#class-asyncstack)
    * [Function: delay(msec, value?)](scheduling.md#function-delaymsec-value)
