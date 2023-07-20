/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const PYMTUtils = require("./PYMTUtils");
const { Contract } = require("fabric-contract-api");
// TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
class AuthorizeSettlementTxCC extends Contract {
  async authorizeSettlementTx(ctx, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In authorizeSettlementTx <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by ACD Org only
      //TODO : ACD org and acl org details has to be finalised......(discussion with nishanth)
      let { ACD_ORG_MSPID, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, ACD_ORG_MSPID);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for authorizeSettlementTx : "
        );
      }
      // TODO : please check the parameters 
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_SUBMITTED,
        TXSTATUS_AUTHORIZED,
        TXSTATUS_NOT_AUTHORIZED

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
      if (!(currentTxReadState.TxStatus == TXSTATUS_SUBMITTED)) {
        throw new Error(`Invalid Transaction state  for key  : ${key}`);
      }

      const isAuthorized = await this.authorizeTxByAOD(
        ctx,
        currentTxReadState
      );

      var state;
      if (isAuthorized) {
        state = TXSTATUS_AUTHORIZED;
      } else {
        state = TXSTATUS_NOT_AUTHORIZED;
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

  async authorizeTxByAOD(ctx, txIn) {
    var isAuthorized = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxsystemTraceAuditNumber = "systemTraceAuditNumber" in txIn;
    if (hasTxsystemTraceAuditNumber) {
      if (txIn.systemTraceAuditNumber === "" || txIn.systemTraceAuditNumber.length == 0) {
        isAuthorized = false;
        console.log(
          "Validation by AOD... systemTraceAuditNumber not valid: ",
          isAuthorized
        );
        return isAuthorized;
      }
    } else {
      return false;
    }
    return isAuthorized;
  }
}

module.exports = AuthorizeSettlementTxCC;
