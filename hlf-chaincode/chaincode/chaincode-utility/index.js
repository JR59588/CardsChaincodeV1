/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// const assetTransfer = require('./lib/assetTransfer');
const PYMTUtils = require('./lib/PYMTUtils');
const PYMTUtilsCC = require('./lib/PYMTUtilsCC');

module.exports.PYMTUtils = PYMTUtils;
module.exports.contracts = [PYMTUtils];


module.exports.PYMTUtilsCC = PYMTUtilsCC;
module.exports.contracts = [PYMTUtilsCC];