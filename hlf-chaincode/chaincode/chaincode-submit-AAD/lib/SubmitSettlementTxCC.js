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
  async submitSettlementTx(ctx, messageType, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In SubmitSettlementTx <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by ACD Org only
      //TODO : ACD org and acl org details has to be finalised......(discussion with nishanth)
      let { ACD_ORG_MSPID, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, ACD_ORG_MSPID);

      if (!accessValid) {
        throw new Error(
          "Unauthorized to Perform the transaction for accountSettlementTxCC : "
        );
      }
      // TODO : please check the parameters 
      // await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_SUBMITTED,
        TXSTATUS_CONFIRMED,
        TXSTATUS_NOT_SUBMITTED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);

      let key = messageType + "-" + merchantId + "-" + customerId + "-" + loanReferenceNumber;
      console.log(" confirmTx.js:key", key);

      var txObj500 = await pymtutils.readTxStatus(ctx, key, channelName);

      const x500Msg = JSON.parse(txObj500);

      let currentTxReadState = x500Msg;
      console.log("printing the currentTxReadState :", currentTxReadState);


      //@to-do verify chaincode has data for key
      if (currentTxReadState.length == 0) {
        throw new Error(`Invalid Key : ${x500Msg} not found `);
      }

      let isSubmitted = false;
      isSubmitted = await this.submitTxByAAD(
        ctx,
        currentTxReadState
      );

      if (isSubmitted == false) {
        throw new Error(`Invalid Key : ${x500Msg} not valid error thrown by ACD `);
      }
      // var txObj = await pymtutils.readTxStatus(ctx, key, channelName);
      // console.log(JSON.stringify(txObj) + "tx value");
      const prevTxnsStr = await pymtutils.readAllPrevTxns(ctx, channelName); //read prev txns using channel name

      const prevTxns = JSON.parse(prevTxnsStr);
      let stan = currentTxReadState.systemsTraceAuditNumber;
      let stans = stan.split(',')
      let statuses = []
      for (let iii = 0; iii < stans.length; iii++) {
        stan = stans[iii]
        console.log("Stan is: ", stan);
        console.log("Previous transactions are:", prevTxns);

        const x100Msgs = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x100" && prevTxn.Record.systemsTraceAuditNumber === stan);

        console.log("Filtered x100 messages are: ", x100Msgs);

        let x100Verified = true;
        const x100Msg = x100Msgs[0]; //if no x100Msg raise error
        if (x100Msg.Record.TxStatus !== 'TxConfirmed') {
          x100Verified = false;
        }


        if (x100Verified) {
          statuses.push('TxSubmitted')
          console.log("Result after verifying all x100 messages with stan ", stan, 'TxSubmitted');

          x100Msg.TxStatus = 'TxSubmitted';
          // x110Msg.TxStatus = 'TxSubmitted';
          let key = x100Msg.Record.messageType + "-" + x100Msg.Record.MerchantId + "-" + x100Msg.Record.CustomerId + "-" + x100Msg.Record.LoanReferenceNumber;
          console.log(" x100 key::", key);
          let txObj = x100Msg.Record
          txObj.TxStatus = 'TxSubmitted'
          var txobj2 = await pymtutils.writeTxStatus(ctx, key, channelName, txObj);
          console.log("txobj2", txobj2);

        } else {
          statuses.push('TxNotSubmitted')
          console.log("Result after verifying all x100 messages with stan ", stan, 'TxNotSubmitted');

          let key = x100Msg.Record.messageType + "-" + x100Msg.Record.MerchantId + "-" + x100Msg.Record.CustomerId + "-" + x100Msg.Record.LoanReferenceNumber;

          console.log(" x100 key::", key);
          let txObj = x100Msg.Record
          txObj.TxStatus = 'TxNotSubmitted'
          var txobj2 = await pymtutils.writeTxStatus(ctx, key, channelName, txObj);
          console.log("txobj2", txobj2);

        }
      }

      txObj500.TxStatus = 'TxSubmitted';
      let txobj500Updated = await pymtutils.writeTxStatus(ctx, key500, channelName, txObj500);
      return txObj500;
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error), error);
      throw Error(error);
    }
  }

  async submitTxByAAD(ctx, txIn) {
    var isSubmitted = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxTransactionAmount = "transactionAmount" in txIn;
    if (hasTxTransactionAmount) {
      if (txIn.transactionAmount === "" || txIn.transactionAmount.length == 0) {
        isSubmitted = false;
        console.log(
          "Validation by AAD... TxTransactionAmount not valid: ",
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
