/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const AccountSettlementTxCC = require('./lib/AccountSettlementTxCC');

module.exports.AccountSettlementTxCC = AccountSettlementTxCC;
module.exports.contracts = [AccountSettlementTxCC];