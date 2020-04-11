/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { CancellationToken } from "./cancellation";
import { Cancelable } from "@esfx/cancelable";
import { isMissing, isInstance } from "./utils";

/*@internal*/
export function getToken(token: CancellationToken | Cancelable | undefined) {
    if (isMissing(token)) token = CancellationToken.none;
    if (!isInstance(token, CancellationToken) && !Cancelable.hasInstance(token)) throw new TypeError("CancellationToken expected: token.");
    return CancellationToken.from(token);
}