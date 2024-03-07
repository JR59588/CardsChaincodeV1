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
      console.log("------>>>In accountSettlementTxCC <<<<<<<-------");
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
        TXSTATUS_CONFIRMED,
        TXSTATUS_NOT_SUBMITTED

      } = await pymtutils.hlfconstants();
      //TODO : change the function of the utils.js for channel name.(replace:getChannelIdentity )
      const channelName = await pymtutils.getChannelIdentity(ctx);

      let key = messageType + "-" + merchantId + "-" + customerId + "-" + loanReferenceNumber;
      console.log(" confirmTx.js:key", key);

      var txObj = await pymtutils.readTxStatus(ctx, key, channelName);

      const x500Msg = JSON.parse(txObj);

      let currentTxReadState = x500Msg;
      console.log("printing the currentTxReadState :", currentTxReadState);


      //@to-do verify chaincode has data for key
      if (currentTxReadState.length == 0) {
        throw new Error(`Invalid Key : ${x500Msg} not found `);
      }

      let isAccounted = false;
      isAccounted = await this.accountTxByACD(
        ctx,
        currentTxReadState
      );

      // checking if isaccounted is false
      if (isAccounted == false) {
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
        if (x100Msg.Record.TxStatus !== 'TxSubmitted') {
          x100Verified = false;
        }

        //const x110Msgs = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x110" && prevTxn.Record.systemsTraceAuditNumber === stan);

        // let x110Verified = true;
        // const x110Msg = x110Msgs[0];
        // if (x110Msg.Record.TxStatus !== 'TxSubmitted') {
        //     x110Verified = false;
        // }

        if (x100Verified) {
          statuses.push('TxAccounted')
          console.log("Result after verifying all x100 messages with stan ", stan, 'TxAccounted');

          x100Msg.TxStatus = 'TxAccounted';
          // x110Msg.TxStatus = 'TxAccounted';
          let key = x100Msg.Record.messageType + "-" + x100Msg.Record.MerchantId + "-" + x100Msg.Record.CustomerId + "-" + x100Msg.Record.LoanReferenceNumber;
          console.log(" x100 key::", key);
          let txObj = x100Msg.Record
          txObj.TxStatus = 'TxAccounted'
          var txobj2 = await pymtutils.writeTxStatus(ctx, key, channelName, txObj);
          console.log("txobj2", txobj2);


          // key = x110Msg.Record.messageType + "-" +  x110Msg.Record.merchantId + "-" +  x110Msg.Record.customerId + "-" +  x110Msg.Record.loanReferenceNumber;
          // console.log(" x100 key::", key);
          // txObj = x110Msg.Record
          // txObj.TxStatus = 'TxSubmitted'
          // var txobj2 = await pymtutils.writeTxStatus(ctx, key, channelName, txObj);
          // console.log("txobj2", txobj2);

        } else {
          statuses.push('TxNotAccounted')
          console.log("Result after verifying all x100 messages with stan ", stan, 'TxNotAccounted');

          let key = x100Msg.Record.messageType + "-" + x100Msg.Record.MerchantId + "-" + x100Msg.Record.CustomerId + "-" + x100Msg.Record.LoanReferenceNumber;

          console.log(" x100 key::", key);
          let txObj = x100Msg.Record
          txObj.TxStatus = 'TxNotAccounted'
          var txobj2 = await pymtutils.writeTxStatus(ctx, key, channelName, txObj);
          console.log("txobj2", txobj2);


          // key = x110Msg.Record.messageType + "-" +  x110Msg.Record.merchantId + "-" +  x110Msg.Record.customerId + "-" +  x110Msg.Record.loanReferenceNumber;
          // console.log(" x100 key::", key);
          // txObj = x110Msg.Record
          // txObj.TxStatus = 'TxNotAccounted'
          // var txobj2 = await pymtutils.writeTxStatus(ctx, key, channelName, txObj);
          // console.log("txobj2", txobj2);
        }
      }
    } catch (error) {
      console.log("Error inside submit Tx :", JSON.stringify(error), error);
      throw Error(error);
    }
  }


  async accountTxByACD(ctx, txIn) {
    var isAccounted = true;
    // TODO : check the validations and change accordingly (discussion with nishanth)
    const hasTxnetworkInternationalId = "networkInternationalId" in txIn;
    if (hasTxnetworkInternationalId) {
      if (txIn.networkInternationalId === "" || txIn.networkInternationalId.length == 0) {
        isAccounted = false;
        console.log(
          "Validation by ACD... networkInternationalId not valid: ",
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


  async GetTxByRange(ctx, startKey, endKey) {
    let resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
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
