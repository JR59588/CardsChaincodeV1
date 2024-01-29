/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const SubmitSettlementTxCC = require('./lib/SubmitSettlementTxCC');

module.exports.SubmitSettlementTxCC = SubmitSettlementTxCC;
module.exports.contracts = [SubmitSettlementTxCC];