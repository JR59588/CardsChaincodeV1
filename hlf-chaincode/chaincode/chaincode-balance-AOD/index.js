/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const BalanceSettlementTxCC = require('./lib/BalanceSettlementTxCC');

module.exports.BalanceSettlementTxCC = BalanceSettlementTxCC;
module.exports.contracts = [BalanceSettlementTxCC];