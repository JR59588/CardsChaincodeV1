/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const PYMTUtils = require("./PYMTUtils");
const { Contract } = require("fabric-contract-api");
// TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
class SubmitSettlementTxCC extends Contract {
  async submitSettlementTx(ctx, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In submitSettlementTx <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by SA Org only
      //TODO : PSP org and acl org details has to be finalised......(discussion with nishanth)
      let { PSP, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, PSP);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for submitSettlementTx : "
        );
      }
// TODO : please check the parameters 
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
// TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_INITIATED,
        TXSTATUS_SUBMITTED,
        TXSTATUS_NOT_SUBMITTED
        
      } = await pymtutils.hlfconstants();
     //TODO : change the function of the utils.js for channel name.(replace:getChannelForOrgWithAgg )
      const channelName = await pymtutils.getChannelForOrgWithAgg(ctx);
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
      if (!(currentTxReadState.TxStatus == TXSTATUS_BALANCED)) {
        throw new Error(`Invalid Transaction state  for key  : ${key}`);
      }

      const isSubmitted = await this.submitTxByACD(
        ctx,
        currentTxReadState
      );

      var state;
      if (isSubmitted) {
        state = TXSTATUS_SUBMITTED;
      } else {
        state = TXSTATUS_NOT_SUBMITTED;
      }
      // putState the state to utilsCC
      currentTxReadState.TxStatus = state;
      var txObj = await pymtutils.writeTxStatus(ctx, key, channelName,currentTxReadState);
      console.log("txObj", txObj);
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error));
      throw Error(error);
    }
  }

  async submitTxByACD(ctx, txIn) {
    var isSubmitted = true;
// TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxTransactionReferenceNumber = "TransactionReferenceNumber" in txIn;
    if (hasTxTransactionReferenceNumber) {
      if (txIn.TransactionReferenceNumber === "" || txIn.TransactionReferenceNumber.length == 0) {
        isAccounted = false;
        console.log(
          "Validation by EDI...TransactionReferenceNumber not valid: ",
          isAccounted
        );
        return isAccounted;
      }
    } else {
      return false;
    }

    const hasTxLoanTenure = "LoanTenure" in txIn;
    if (hasTxLoanTenure) {
      if (txIn.LoanTenure === "" || txIn.LoanTenure.length == 0) {
        isAccounted = false;
        console.log("Validation by EDI...LoanTenure not valid: ",isAccounted);
        return isAccounted;
      }
      let LoanTenureInt = parseInt(txIn.LoanTenure);
      if(isNaN(LoanTenureInt)){
       return false;
      } 
      if (LoanTenureInt > 36){
        isAccounted = false;
        console.log("LoanTenure (", txIn.LoanTenure, ") is not valid");
        return isAccounted;
      }
    } else {
      return false;
    }
    return isAccounted;
  }
}

module.exports = SubmitSettlementTxCC;
