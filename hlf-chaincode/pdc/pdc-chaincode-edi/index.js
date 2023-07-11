/*
* Copyright IBM Corp. All Rights Reserved.
*
* SPDX-License-Identifier: Apache-2.0
*/
'use strict';
// const assetTransfer = require('./lib/assetTransfer');
const MerchantPDC = require('./lib/edi');

module.exports.MerchantPDC = MerchantPDC;
module.exports.contracts = [MerchantPDC];

