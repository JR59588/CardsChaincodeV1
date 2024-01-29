/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const assetTransfer = require('./lib/assetTransfer');
const ConfirmSettlementTxCC = require('./lib/ConfirmSettlementTxCC');
// BNPL
module.exports.ConfirmSettlementTxCC = ConfirmSettlementTxCC;
module.exports.contracts = [ConfirmSettlementTxCC];