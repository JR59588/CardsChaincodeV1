/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const assetTransfer = require('./lib/assetTransfer');
const AccountSettlementTxCC = require('./lib/AccountSettlementTxCC');
// BNPL
module.exports.AccountSettlementTxCC = AccountSettlementTxCC;
module.exports.contracts = [AccountSettlementTxCC];