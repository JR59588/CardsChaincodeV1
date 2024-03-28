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
class ConfirmSettlementTxCC extends Contract {
  async confirmSettlementTx(ctx, messageType, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In submitSettlementTx <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by SA Org only
      //TODO : PSP org and acl org details has to be finalised......(discussion with nishanth)
      let { PSP_ORG_MSPID, AOD_ORG_MSPID, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, AOD_ORG_MSPID);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for confirmSettlementTx : "
        );
      }
      // TODO : please check the parameters 
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_REQUESTED,
        TXSTATUS_CONFIRMED,
        TXSTATUS_NON_CONFIRMED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);
      let x500Key = messageType + "-" + merchantId + "-" + customerId + "-" + loanReferenceNumber;
      console.log(" confirmTx.js:x500Key", x500Key);

      var txObj = await pymtutils.readTxStatus(ctx, x500Key, channelName);

      console.log(JSON.stringify(txObj) + "tx value");

      const prevTxnsStr = await pymtutils.readAllPrevTxns(ctx, channelName); //read prev txns using channel name

      let currentTxReadState = JSON.parse(txObj);
      console.log("printing the currentTxReadState :", currentTxReadState);

      //@to-do verify chaincode has data for key
      if (currentTxReadState.length == 0) {
        throw new Error(`Invalid X500 Key : ${x500Key} not found `);
      }

      //@to-do verify chaincode tx state is initiated only.
      if (!(currentTxReadState.TxStatus == TXSTATUS_REQUESTED)) {
        throw new Error(`Invalid Transaction state  for x500Key  : ${x500Key}`);
      }

      const prevTxns = JSON.parse(prevTxnsStr);

      const x500_batchNumber = currentTxReadState.batchNumber;

      const x100Msgs = prevTxns.filter(txn => txn.Record.messageType === 'x100' && txn.Record.batchNumber === x500_batchNumber);

      let allConfirmed = true;

      for (let i = 0; i < x100Msgs.length; i++) {
        const x100Msg = x100Msgs[i];
        console.log("X100 message is: ", x100Msg);
        const x100_stan = x100Msg.Record.systemsTraceAuditNumber;
        // finding x110 message
        const x110Msg = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x110" && prevTxn.Record.systemsTraceAuditNumber === x100_stan)[0];
        // console.log("ConfirmTxCC AAD: X110 message read: ", x110Msg);
        // if (!x110Msg) {
        //   throw new Error(`No x110 messages found corresponding to x100 message with given Systems trace audit number ${currentTxReadState.systemsTraceAuditNumber}`);
        // }

        const isConfirmed = await this.confirmTxByAAD(
          ctx,
          x100Msg.Record,
          x110Msg
        );

        let state;
        if (isConfirmed) {
          state = TXSTATUS_CONFIRMED;
        } else {
          state = TXSTATUS_NON_CONFIRMED;
          allConfirmed = false;
        }
        // putState the state to utilsCC
        x100Msg.Record.TxStatus = state;
        const x100Key = "x100-" + x100Msg.Record.MerchantId + "-" + x100Msg.Record.CustomerId + "-" + x100Msg.Record.LoanReferenceNumber;

        const txObj = await pymtutils.writeTxStatus(ctx, x100Key, channelName, x100Msg.Record);
        console.log("ConfirmTxCC AAD: After saving x100 message", txObj);
      }
      // saving x500 status finally
      if (allConfirmed) {
        currentTxReadState.TxStatus = TXSTATUS_CONFIRMED;
        const txObj = await pymtutils.writeTxStatus(ctx, x500Key, channelName, currentTxReadState);
        console.log("ConfirmTxCC AAD: After saving x500 message", txObj);
      } else {
        currentTxReadState.TxStatus = TXSTATUS_NON_CONFIRMED;
        const txObj = await pymtutils.writeTxStatus(ctx, x500Key, channelName, currentTxReadState);
        console.log("ConfirmTxCC AAD: After saving x500 message", txObj);
      }

      var OrgMSPId = await ctx.clientIdentity.getMSPID();
      var hlfevent = new HLFEVENT();
      let { AAD_ACD_CT_EVENT } = await hlfevent.hlfevents();
      try {
        await this.emitEvent(
          ctx,
          AAD_ACD_CT_EVENT,
          AAD_ACD_CT_EVENT.eventID,
          x500Key,
          OrgMSPId,
          channelName
        );
      } catch (err) {
        console.log(err);
        throw err;
      }
      return currentTxReadState;
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error));
      throw Error(error);
    }

  }

  async confirmTxByAAD(ctx, txIn, x110Msg) {
    var isConfirmed = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)

    if (!x110Msg) {
      return false;
    }
    // console.log("x110Msg: ", x110Msg, "x110Msg record: ", x110Msg.Record);

    if (x110Msg.Record.approverCode === "00") { // not approved.
      return false;
    }

    const hasTxprocessingCode = "processingCode" in txIn;
    if (hasTxprocessingCode) {
      if (txIn.processingCode === "" || txIn.processingCode.length == 0) {
        isConfirmed = false;
        console.log(
          "Validation at AAD: processingCode not valid: ",
          isConfirmed
        );
        return isConfirmed;
      }
    } else {
      return false;
    }

    return isConfirmed;
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

module.exports = ConfirmSettlementTxCC;
