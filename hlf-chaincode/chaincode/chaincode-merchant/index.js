/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const assetTransfer = require('./lib/assetTransfer');
const MerchantTxCC = require('./lib/MerchantTxCC');

// BNPL
module.exports.MerchantTxCC = MerchantTxCC;
module.exports.contracts = [MerchantTxCC];