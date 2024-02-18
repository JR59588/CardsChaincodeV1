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
class AccountSettlementTxCC extends Contract {
  async accountSettlementTx(ctx, x500Msg) {
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
      // await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);

      let {
        // TODO : update the utils.js file (hlfconstants)  
        TXSTATUS_SUBMITTED,
        TXSTATUS_ACCOUNTED,
        TXSTATUS_NON_ACCOUNTED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);
      // TODO: Change the parameters based on requirement.
      // let key = merchantId + "-" + customerId + "-" + loanReferenceNumber;
      // console.log(" confirmTx.js:key", key);

      // var txObj = await pymtutils.readTxStatus(ctx, key, channelName);
      // console.log(JSON.stringify(txObj) + "tx value");

      let currentTxReadState = JSON.parse(x500Msg);
      console.log("printing the currentTxReadState :", currentTxReadState);

      //@to-do verify chaincode has data for key
      if (currentTxReadState.length == 0) {
        throw new Error(`Invalid Key : ${x500Msg} not found `);
      }

      let queryString = {
        selector: {
          messageType: "x110",
        }
      }

      const settlementTxIterator = await ctx.stub.getQueryResultWithPagination(JSON.stringify(queryString)); // get the settlementTx from chaincode state
      let allResults = [];
      while (await settlementTxIterator.hasNext()) {
        const result = await settlementTxIterator.next();
        const key = result.value.key;
        const value = result.value.value;
        allResults.push(value);
        // Process the key or retrieve associated data
        console.log(`Found key: ${key} value: ${value}`);
      }
      settlementTxIterator.close();
      console.log("read x110 messages: ", allResults);

      //@to-do verify chaincode tx state is initiated only.
      // TODO verify chaincode tx state is as per requirement.
      // if (!(currentTxReadState.TxStatus == TXSTATUS_SUBMITTED)) {
      //   throw new Error(`Invalid Transaction state  for key  : ${key}`);
      // }
      let isAccounted = false;

      isAccounted = await this.accountTxByAOD(
        ctx,
        currentTxReadState
      );

      //   var state;
      //   if (isAccounted) {
      //     state = TXSTATUS_ACCOUNTED;
      //   } else {
      //     state = TXSTATUS_NON_ACCOUNTED;
      //   }
      //   // putState the state to utilsCC
      //   currentTxReadState.TxStatus = state;
      //   var txObj = await pymtutils.writeTxStatus(ctx, key, channelName, currentTxReadState);
      //   console.log("txObj", txObj);
      //   var OrgMSPId = await ctx.clientIdentity.getMSPID();
      //   var hlfevent = new HLFEVENT();
      //   let { AOD_ACD_AT_EVENT } = await hlfevent.hlfevents();
      //   try {
      //     await this.emitEvent(
      //       ctx,
      //       AOD_ACD_AT_EVENT,
      //       AOD_ACD_AT_EVENT.eventID,
      //       key,
      //       OrgMSPId,
      //       channelName
      //     );
      //   } catch (err) {
      //     console.log(err);
      //     throw err;
      //   }
      return isAccounted;

    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error));
      throw Error(error);
    }

  }

  async accountTxByAOD(ctx, txIn) {
    var isAccounted = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxcardAcceptorIdentificationCode = "cardAcceptorIdentificationCode" in txIn;
    if (hasTxcardAcceptorIdentificationCode) {
      if (txIn.cardAcceptorIdentificationCode === "" || txIn.cardAcceptorIdentificationCode.length == 0) {
        isAccounted = false;
        console.log(
          "Validation by AOD... cardAcceptorIdentificationCode not valid: ",
          isAccounted
        );
        return isAccounted;
      }
    } else {
      return false;
    }
    return isAccounted;
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

module.exports = AccountSettlementTxCC;
