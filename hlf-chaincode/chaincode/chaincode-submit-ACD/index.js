/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const assetTransfer = require('./lib/assetTransfer');
const SubmitSettlementTxCC = require('./lib/SubmitSettlementTxCC');
// BNPL
module.exports.SubmitSettlementTxCC = SubmitSettlementTxCC;
module.exports.contracts = [SubmitSettlementTxCC];