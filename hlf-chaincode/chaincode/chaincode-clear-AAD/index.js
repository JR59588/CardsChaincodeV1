/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const ClearSettlementTxCC = require('./lib/ClearSettlementTxCC');

module.exports.ClearSettlementTxCC = ClearSettlementTxCC;
module.exports.contracts = [ClearSettlementTxCC];