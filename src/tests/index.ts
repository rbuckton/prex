/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { install } from "source-map-support";

// Enable source map support for exceptions.
install();

import "./async-chai";
import "./cancellation";
import "./queue";
import "./stack";
import "./manualresetevent";
import "./autoresetevent";
import "./barrier";
import "./countdown";
import "./semaphore";
import "./readerwriterlock";