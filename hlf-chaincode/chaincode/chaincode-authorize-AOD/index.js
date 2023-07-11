/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const AuthorizeSettlementTxCC = require('./lib/AuthorizeSettlementTxCC');

module.exports.AuthorizeSettlementTxCC = AuthorizeSettlementTxCC;
module.exports.contracts = [AuthorizeSettlementTxCC];