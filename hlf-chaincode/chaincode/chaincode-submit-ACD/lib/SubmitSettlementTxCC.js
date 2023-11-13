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
class SubmitSettlementTxCC extends Contract {
  async submitSettlementTx(ctx, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In submitSettlementTx <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by SA Org only
      //TODO : PSP org and acl org details has to be finalised......(discussion with nishanth)
      let { PSP_ORG_MSPID, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, PSP_ORG_MSPID);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for submitSettlementTx : "
        );
      }
      // TODO : please check the parameters 
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_REQUESTED,
        TXSTATUS_SUBMITTED,
        TXSTATUS_NOT_SUBMITTED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);
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
      if (!(currentTxReadState.TxStatus == TXSTATUS_REQUESTED)) {
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
      var txObj = await pymtutils.writeTxStatus(ctx, key, channelName, currentTxReadState);
      console.log("txObj", txObj);

      var OrgMSPId = await ctx.clientIdentity.getMSPID();
      var hlfevent = new HLFEVENT();
      let { ACD_ST_EVENT } = await hlfevent.hlfevents();
      try {
        await this.emitEvent(
          ctx,
          ACD_ST_EVENT,
          ACD_ST_EVENT.eventID,
          key,
          currentTxReadState,
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

  async submitTxByACD(ctx, txIn) {
    var isSubmitted = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxprocessingCode = "processingCode" in txIn;
    if (hasTxprocessingCode) {
      if (txIn.processingCode === "" || txIn.processingCode.length == 0) {
        isSubmitted = false;
        console.log(
          "Validation at ACD: processingCode not valid: ",
          isSubmitted
        );
        return isSubmitted;
      }
    } else {
      return false;
    }

    return isSubmitted;
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
      executionMode: txIn.executionMode,
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

module.exports = SubmitSettlementTxCC;
