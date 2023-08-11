/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const PYMTUtils = require("./PYMTUtils");
const { Contract } = require("fabric-contract-api");
const HLFEVENT = require("./HLFEVENT");
// TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
class BalanceSettlementTxCC extends Contract {
  async balanceSettlementTx(ctx, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In balanceSettlementTxCC <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by AAD Org only
      //TODO : AAD org and acl org details has to be finalised......(discussion with nishanth)
      let { AAD_ORG_MSPID, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, AAD_ORG_MSPID);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for balanceSettlementTxCC : "
        );
      }
      // TODO : please check the parameters 
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_AUTHORIZED,
        TXSTATUS_BALANCED,
        TXSTATUS_NOT_BALANCED

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
      if (!(currentTxReadState.TxStatus == TXSTATUS_AUTHORIZED)) {
        throw new Error(`Invalid Transaction state  for key  : ${key}`);
      }

      const isBalanced = await this.balanceTxByAOD(
        ctx,
        currentTxReadState
      );

      var state;
      if (isBalanced) {
        state = TXSTATUS_BALANCED;
      } else {
        state = TXSTATUS_NOT_BALANCED;
      }
      // putState the state to utilsCC
      currentTxReadState.TxStatus = state;
      var txObj = await pymtutils.writeTxStatus(ctx, key, channelName, currentTxReadState);
      console.log("txObj", txObj);
      var OrgMSPId = await ctx.clientIdentity.getMSPID();
      var hlfevent = new HLFEVENT();
      let { AOD_ACD_BT_EVENT } = await hlfevent.hlfevents();
      try {
        await this.emitEvent(
          ctx,
          AOD_ACD_BT_EVENT,
          AOD_ACD_BT_EVENT.eventID,
          key,
          OrgMSPId,
          channelName
        );
      } catch (err) {
        console.log(err);
        throw err;
      }
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error));
      throw Error(error);
    }
  }

  async balanceTxByAOD(ctx, txIn) {
    var isBalanced = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxposEntryMode = "posEntryMode" in txIn;
    if (hasTxposEntryMode) {
      if (txIn.posEntryMode === "" || txIn.posEntryMode.length == 0) {
        isBalanced = false;
        console.log(
          "Validation by AOD... posEntryMode not valid: ",
          isBalanced
        );
        return isBalanced;
      }
    } else {
      return false;
    }
    return isBalanced;
  }
  async emitEvent(ctx, eventType, eventID, keyIn, txIn, MSPId, chName) {
    let evtPayload = {
      eventMap: eventType,
      eventName: eventID,
      emittingOrgMSP: MSPId,
      channelName: chName,
      emittingOrgType: "NA",
      evTxId: "99999",
      key: keyIn,
    };
    const eventPayload = JSON.stringify(evtPayload);

    try {
      if (
        !(
          !eventID ||
          eventID.length === 0 ||
          !eventPayload ||
          eventPayload.length === 0
        )
      ) {
        const eventPayloadBuffer = Buffer.from(eventPayload);
        await ctx.stub.setEvent(eventID, eventPayloadBuffer);
      }
    } catch (err) {
      console.log(" error in emitting event : ", err);
      throw err;
    }
  }
}

module.exports = BalanceSettlementTxCC;
