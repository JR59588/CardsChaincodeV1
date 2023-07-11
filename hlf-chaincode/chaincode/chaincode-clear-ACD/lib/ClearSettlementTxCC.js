/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const PYMTUtils = require("./PYMTUtils");
const { Contract } = require("fabric-contract-api");
// TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
class ClearSettlementTxCC extends Contract {
  async clearSettlementTxCC(ctx, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In clearSettlementTxCC <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by AOD Org only
      //TODO : AOD org and acl org details has to be finalised......(discussion with nishanth)
      let { AOD, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, AOD);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for clearSettlementTxCC : "
        );
      }
      // TODO : please check the parameters 
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_BALANCED,
        TXSTATUS_CLEARED,
        TXSTATUS_NOT_CLEARED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);
      // TODO: Change the parameters based on requirement.
      let key = merchantId + "-" + customerId + "-" + loanReferenceNumber;
      console.log(" confirmTx.js:key", key);

      var txObj = await pymtutils.readTxStatus(ctx, key, channelName);
      console.log(JSON.stringify(txObj) + "tx value");

      let currentTxReadState = JSON.parse(txObj);
      console.log("printing the currentTxReadState :", currentTxReadState);

      //@to-do verify chaincode has data for key
      if (currentTxReadState.length == 0) {
        throw new Error(`Invalid Key : ${key} not found `);
      }

      //@to-do verify chaincode tx state is initiated only.
      // TODO verify chaincode tx state is as per requirement.
      if (!(currentTxReadState.TxStatus == TXSTATUS_CLEARED)) {
        throw new Error(`Invalid Transaction state  for key  : ${key}`);
      }

      const isCleared = await this.clearTxByACD(
        ctx,
        currentTxReadState
      );

      var state;
      if (isCleared) {
        state = TXSTATUS_CLEARED;
      } else {
        state = TXSTATUS_NOT_CLEARED;
      }
      // putState the state to utilsCC
      currentTxReadState.TxStatus = state;
      var txObj = await pymtutils.writeTxStatus(ctx, key, channelName, currentTxReadState);
      console.log("txObj", txObj);
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error));
      throw Error(error);
    }
  }

  async clearTxByACD(ctx, txIn) {
    var isCleared = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxTransactionReferenceNumber = "TransactionReferenceNumber" in txIn;
    if (hasTxTransactionReferenceNumber) {
      if (txIn.TransactionReferenceNumber === "" || txIn.TransactionReferenceNumber.length == 0) {
        isCleared = false;
        console.log(
          "Validation by EDI...TransactionReferenceNumber not valid: ",
          isCleared
        );
        return isCleared;
      }
    } else {
      return false;
    }

    const hasTxLoanTenure = "LoanTenure" in txIn;
    if (hasTxLoanTenure) {
      if (txIn.LoanTenure === "" || txIn.LoanTenure.length == 0) {
        isCleared = false;
        console.log("Validation by EDI...LoanTenure not valid: ", isCleared);
        return isCleared;
      }
      let LoanTenureInt = parseInt(txIn.LoanTenure);
      if (isNaN(LoanTenureInt)) {
        return false;
      }
      if (LoanTenureInt > 36) {
        isCleared = false;
        console.log("LoanTenure (", txIn.LoanTenure, ") is not valid");
        return isCleared;
      }
    } else {
      return false;
    }
    return isCleared;
  }
}

module.exports = ClearSettlementTxCC;
