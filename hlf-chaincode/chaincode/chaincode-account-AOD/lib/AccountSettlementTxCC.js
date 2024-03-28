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
  async accountSettlementTx(ctx, messageType, merchantId, customerId, loanReferenceNumber) {
    try {
      console.log("------>>>In balanceSettlementTxCC <<<<<<<-------");
      var pymtutils = new PYMTUtils(ctx);

      //ACL :  Can be called by AAD Org only
      //TODO : AAD org and acl org details has to be finalised......(discussion with nishanth)
      let { AAD_ORG_MSPID, PYMTUtilsCC } = await pymtutils.hlfconstants();

      const accessValid = await pymtutils.validateOrganization(ctx, AAD_ORG_MSPID);

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
        TXSTATUS_ACCOUNTED,
        TXSTATUS_NON_ACCOUNTED,
        TXSTATUS_NOT_SUBMITTED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);

      // create key
      let x500Key = messageType + "-" + merchantId + "-" + customerId + "-" + loanReferenceNumber;
      console.log("ACD: AccountTxCC key:", x500Key);

      var txObj500 = await pymtutils.readTxStatus(ctx, x500Key, channelName);

      const x500Msg = JSON.parse(txObj500);

      let currentTxReadState = x500Msg;
      console.log("printing the currentTxReadState :", currentTxReadState);


      //@to-do verify chaincode has data for key
      if (currentTxReadState.length == 0) {
        throw new Error(`Invalid Key : ${x500Msg} not found `);
      }

      // let isAccounted = false;
      // isAccounted = await this.accountTxByACD(
      //   ctx,
      //   currentTxReadState
      // );

      // checking if isaccounted is false
      // if (isAccounted == false) {
      //   throw new Error(`Invalid Key : ${x500Msg} not valid error thrown by ACD `);
      // }
      // var txObj = await pymtutils.readTxStatus(ctx, key, channelName);
      // console.log(JSON.stringify(txObj) + "tx value");
      const prevTxnsStr = await pymtutils.readAllPrevTxns(ctx, channelName); //read prev txns using channel name

      const prevTxns = JSON.parse(prevTxnsStr);

      const x500_batchNumber = currentTxReadState.batchNumber;

      const x100Msgs = prevTxns.filter(txn => txn.Record.messageType === 'x100' && txn.Record.batchNumber === x500_batchNumber);

      let allAccounted = true;

      for (let i = 0; i < x100Msgs.length; i++) {
        const x100Msg = x100Msgs[i];
        console.log("X100 message is: ", x100Msg);
        // const x100_stan = x100Msg.Record.systemsTraceAuditNumber;
        // finding x110 message
        // const x110Msg = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x110" && prevTxn.Record.systemsTraceAuditNumber === x100_stan)[0];
        // console.log("AccountTxCC AAD: X110 message read: ", x110Msg);
        // if (!x110Msg) {
        //   throw new Error(`No x110 messages found corresponding to x100 message with given Systems trace audit number ${currentTxReadState.systemsTraceAuditNumber}`);
        // }

        const isAccounted = await this.accountTxByAOD(
          ctx,
          x100Msg.Record,
        );

        let state;
        if (isAccounted) {
          state = TXSTATUS_ACCOUNTED;
        } else {
          state = TXSTATUS_NON_ACCOUNTED;
          allAccounted = false;
        }
        // putState the state to utilsCC
        x100Msg.Record.TxStatus = state;
        const x100Key = "x100-" + x100Msg.Record.MerchantId + "-" + x100Msg.Record.CustomerId + "-" + x100Msg.Record.LoanReferenceNumber;

        const txObj = await pymtutils.writeTxStatus(ctx, x100Key, channelName, x100Msg.Record);
        console.log("AccountTxCC AAD: After saving x100 message", txObj);
      }
      // saving x500 status finally
      if (allAccounted) {
        currentTxReadState.TxStatus = TXSTATUS_ACCOUNTED;
        const txObj = await pymtutils.writeTxStatus(ctx, x500Key, channelName, currentTxReadState);
        console.log("AccountTxCC AOD: After saving x500 message", txObj);
      } else {
        currentTxReadState.TxStatus = TXSTATUS_NON_ACCOUNTED;
        const txObj = await pymtutils.writeTxStatus(ctx, x500Key, channelName, currentTxReadState);
        console.log("AccountTxCC AOD: After saving x500 message", txObj);
      }
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error), error);
      throw Error(error);
    }
  }


  async accountTxByAOD(ctx, txIn) {
    return txIn.TxStatus === 'TxSubmitted';
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

  // getting all x110 messages
  async GetTxByRange(ctx, startKey, endKey) {
    let resultsIterator = await ctx.stub.getStateByRange("M1", "M2");
    let results = await this.GetAllResults(resultsIterator, false);
    console.log("Found " + results.length + " Transactions");
    return results;
  }

  async GetAllResults(iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));
        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString("utf8");
          }
        }
        allResults.push(jsonRes);
      }
      res = await iterator.next();
    }
    iterator.close();
    return allResults;
  }
}

module.exports = AccountSettlementTxCC;
