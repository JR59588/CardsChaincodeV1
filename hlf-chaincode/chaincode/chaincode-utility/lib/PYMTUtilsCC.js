/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const PYMTUtils = require("./PYMTUtils");
const { Contract } = require("fabric-contract-api");
const HLFEVENT = require("./HLFEVENT");
const PYMTTX_MERCHANT_CC_SUFFIX = "PYMTTxMerchantCC";

async function checkInvokeCCResponse(chaincodeResponse) {
  console.log("LN 22 - checkInvokeCCResponse", chaincodeResponse.toString());
  console.log(JSON.stringify(chaincodeResponse));
  console.info("=======================================");

  console.log(
    "decodeddata = " +
    // Buffer.from(chaincodeResponse.payload, "base64").toString()
    Buffer.from(chaincodeResponse.payload).toString()
  );

  if (!chaincodeResponse) {
    let jsonResp = {};
    jsonResp.Error = "Validation failed Something went wrong";
    throw new Error(JSON.stringify(jsonResp));
  }
  var payload;
  try {
    console.log("Invoke CC response ---- 38", chaincodeResponse.payload);
    // payload = Buffer.from(chaincodeResponse.payload, "base64").toString();
    payload = Buffer.from(chaincodeResponse.payload).toString();

    console.log(payload);
  } catch (err) {
    console.log(err);
    throw err;
  }
  console.log("after decodeddata ");
  return payload;
}
///////   "TODO"  define readstate function

class PYMTUtilsCC extends Contract {
  //@required for V1
  async initiateTx(
    ctx,
    merchantId,
    CustomerId,
    loanReferenceNumber,
    merchantName,
    primaryAccountNumber,
    processingCode,
    transactionAmount,
    transmissionDateAndTime,
    systemsTraceAuditNumber,
    localTime,
    localDate,
    expirationDate,
    merchantCategoryCode,
    pointOfServiceEntryMode,
    acquiringInstitutionIdentificationCode,
    retrievalReferenceNumber,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    cardAcceptorNameAndLocation,
    currencyCode,
    personalIdentificationNumber,
    additionalData,
    executionMode
  ) {
    // acl

    // var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);
    var channelName = await pymtutils.getChannelIdentity(ctx, "PSPOrgMSP");

    try {
      // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
      await pymtutils.checkNull(merchantId, CustomerId, loanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    //20.2.23 changed to AggOrgMSP.
    const accessValid = await pymtutils.validateOrganization(ctx, "PSPOrgMSP");
    console.log("accessValid : ", accessValid);

    // TODO: change the message as per the requirement by changing mid, cid, lrf.
    if (!accessValid) {
      throw new Error(
        "This transaction already exists for merchantId : " +
        merchantId +
        " customerId :" +
        CustomerId +
        "LoanReferenceNumber :" +
        loanReferenceNumber
      );
    }
    // acl
    // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
    // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx()
    // if isValidMerchantId(m101)
    console.log("before the key in utilscc");
    var iCCName;
    // TODO: change tx key by changing mid, cid, lrf as per requirement.
    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      merchantId,
      CustomerId,
      loanReferenceNumber
    );
    console.log("after the key in utilscc");

    //TODO this will be invoke by initiate settlmentTX of merchantTxCC
    console.log(
      "Logic to invoke initiateSettlemetTx of merchantCC to be completed"
    );

    let initiateTxObj = {
      MerchantId: merchantId,
      CustomerID: CustomerId,
      LoanReferenceNumber: loanReferenceNumber,
      merchantName: merchantName,
      primaryAccountNumber: primaryAccountNumber,
      processingCode: processingCode,
      transactionAmount: transactionAmount,
      transmissionDateAndTime: transmissionDateAndTime,
      systemsTraceAuditNumber: systemsTraceAuditNumber,
      localTime: localTime,
      localDate: localDate,
      expirationDate: expirationDate,
      merchantCategoryCode: merchantCategoryCode,
      pointOfServiceEntryMode: pointOfServiceEntryMode,
      acquiringInstitutionIdentificationCode: acquiringInstitutionIdentificationCode,
      retrievalReferenceNumber: retrievalReferenceNumber,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      cardAcceptorNameAndLocation: cardAcceptorNameAndLocation,
      currencyCode: currencyCode,
      personalIdentificationNumber: personalIdentificationNumber,
      additionalData: additionalData,
      executionMode: executionMode,
    };

    let { initiateSettlementTxFN } = await pymtutils.hlfconstants();

    let strObj = JSON.stringify(initiateTxObj);
    console.log(" strObj = ", strObj);

    iCCName = "MC_" + PYMTTX_MERCHANT_CC_SUFFIX;
    console.log(" PYTMutilscc.js iCCName : ", iCCName);
    //TODO try catch
    const chaincodeResponse = await ctx.stub.invokeChaincode(
      iCCName,
      [
        initiateSettlementTxFN,
        merchantId,
        merchantName,
        CustomerId,
        loanReferenceNumber,
        strObj,
      ],
      // SAChannelName
      channelName
    );
    console.log(" chaincodeResponse ", chaincodeResponse);

    var ccPayload = await checkInvokeCCResponse(chaincodeResponse);

    var hlfevent = new HLFEVENT();
    let { TXSTATUS_INITIATED, TXSTATUS_REJECTED } =
      await pymtutils.hlfconstants();
    console.log("PYTMutilscc.js ccPayload ", ccPayload);

    // TODO: remove hardcoded values
    if (ccPayload == "true") {
      console.log("PYTMutilscc.js ccPayload = true : ", ccPayload);
      initiateTxObj.TxStatus = TXSTATUS_INITIATED;

    } else {
      console.log("PYTMutilscc.js ccPayload = false : ", ccPayload);
      initiateTxObj.TxStatus = TXSTATUS_REJECTED;

    }

    // === Save transaction to state ===

    console.log("------saving Txstate------");

    await this.saveTxState(ctx, key, initiateTxObj);

    let { MERCHANT_IT_EVENT } = await hlfevent.hlfevents();

    await this.emitEvent(
      ctx,
      MERCHANT_IT_EVENT,
      MERCHANT_IT_EVENT.eventID,
      key,
      initiateTxObj,
      OrgMSPID
    );
    const txBuffer = Buffer.from(JSON.stringify(initiateTxObj));
    ctx.stub.setEvent("E-TxInitiated", txBuffer);
    //console.log("---------line no 991---------------");
  }

  //@required for V1
  ///"TODO"  add settlement tx details /// should be add and invoked from this contract.........
  async requestTx(
    ctx,
    MerchantId,
    CustomerId,
    LoanReferenceNumber,
    MerchantName,
    primaryAccountNumber,
    processingCode,
    transactionAmount,
    transmissionDateAndTime,
    systemsTraceAuditNumber,
    localTime,
    localDate,
    expirationDate,
    merchantCategoryCode,
    pointOfServiceEntryMode,
    acquiringInstitutionIdentificationCode,
    retrievalReferenceNumber,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    cardAcceptorNameAndLocation,
    currencyCode,
    personalIdentificationNumber,
    additionalData,
    executionMode
  ) {
    // acl

    var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);
    var channelName = await pymtutils.getChannelIdentity(ctx, "Org1");
    console.log("channel name : ", channelName);

    try {
      // TODO: change the parameters as per the requirement by changing mid, cid, lrf.
      await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Org1MSP
    const accessValid = true;//await pymtutils.validateOrganization(ctx, "Org1MSP");
    // TODO: change the message as per the requirement by changing mid, cid, lrf.
    if (!accessValid) {
      throw new Error(
        "This transaction already exists for merchantId : " +
        MerchantId +
        " customerId :" +
        CustomerId +
        "LoanReferenceNumber :" +
        LoanReferenceNumber
      );
    }
    console.log("access valid : ", accessValid);

    console.log("before the key in utilscc");
    // TODO: change the key as per the requirement by changing mid, cid, lrf.

    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber
    );
    console.log("after the key in utilscc");

    let settlementTx = {
      MerchantId: MerchantId,
      CustomerId: CustomerId,
      LoanReferenceNumber: LoanReferenceNumber,
      MerchantName: MerchantName,
      primaryAccountNumber: primaryAccountNumber,
      processingCode: processingCode,
      transactionAmount: transactionAmount,
      transmissionDateAndTime: transmissionDateAndTime,
      systemsTraceAuditNumber: systemsTraceAuditNumber,
      localTime: localTime,
      localDate: localDate,
      expirationDate: expirationDate,
      merchantCategoryCode: merchantCategoryCode,
      pointOfServiceEntryMode: pointOfServiceEntryMode,
      acquiringInstitutionIdentificationCode: acquiringInstitutionIdentificationCode,
      retrievalReferenceNumber: retrievalReferenceNumber,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      cardAcceptorNameAndLocation: cardAcceptorNameAndLocation,
      currencyCode: currencyCode,
      personalIdentificationNumber: personalIdentificationNumber,
      additionalData: additionalData,
      executionMode: executionMode
    };

    let { requestSettlementTxFN } = await pymtutils.hlfconstants();

    let strObj = JSON.stringify(settlementTx);
    console.log(" strObj = ", strObj);
    var iCCName;
    iCCName = "MC_" + PYMTTX_MERCHANT_CC_SUFFIX;
    console.log(" PYTMutilscc.js iCCName : ", iCCName);
    // TODO: replace mid, mname, cid, lrf with the required fields as per the chaincode.
    const chaincodeResponse = await ctx.stub.invokeChaincode(
      iCCName,
      [
        requestSettlementTxFN,
        MerchantId,
        MerchantName,
        CustomerId,
        LoanReferenceNumber,
        strObj,
      ],
      // SAChannelName
      channelName
    );

    console.log(" chaincodeResponse ", chaincodeResponse);

    var ccPayload = await checkInvokeCCResponse(chaincodeResponse);

    // var txIn = await this.getTxObject(ctx, key);
    let { TXSTATUS_REQUESTED, TXSTATUS_REJECTED } =
      await pymtutils.hlfconstants();
    console.log("PYTMutilscc.js ccPayload ", ccPayload);

    if (ccPayload == "true") {
      console.log("PYTMutilscc.js ccPayload ", ccPayload);
      settlementTx.TxStatus = TXSTATUS_REQUESTED;
    } else {
      settlementTx.TxStatus = TXSTATUS_REJECTED;
    }

    // === Save transaction to state ===

    console.log("------saving Txstate------");
    try {
      await this.saveTxState(ctx, key, settlementTx);
    } catch (err) {
      console.log(err);
      throw err;
    }

    // console.log("before the putste in utilscc");
    // await ctx.stub.putState(key, Buffer.from(JSON.stringify(settlementTx)));
    // console.log("after the putstae in utilscc")
    const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    // ctx.stub.setEvent("E-TxRequested", txBuffer);
    console.log("tx buffer : ", txBuffer);
    var hlfevent = new HLFEVENT();
    let { MERCHANT_RT_EVENT } = await hlfevent.hlfevents();
    // /**
    try {
      await this.emitEvent(
        ctx,
        MERCHANT_RT_EVENT,
        MERCHANT_RT_EVENT.eventID,
        key,
        settlementTx,
        OrgMSPId,
        channelName
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
    console.log("The END");
    // return JSON.stringify(settlementTx);
    // */
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
      executionMode: txIn.executionMode
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

  async saveTxState(ctx, key, txIn) {
    // === Save transaction to state ===    let txID=ctx.stub.getTxID();
    // === Save transaction to state ===
    try {

      let txID = ctx.stub.getTxID();
      console.log("Line 389", txID);
      txIn.txID = txID;
      let txTimestamp = ctx.stub.getTxTimestamp();
      console.log("Timestamp is: ", txTimestamp, "Timestamp toString: ", txTimestamp.toString());
      const milliseconds = (txTimestamp.seconds.low + ((txTimestamp.nanos / 1000000) / 1000)) * 1000;
      const date = new Date(milliseconds);
      txIn.txTimestamp = date.toString();
      await ctx.stub.putState(key, Buffer.from(JSON.stringify(txIn)));
      console.log("successfully putstate for key :", key);

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async readState(ctx, key) {
    const settlementTxBuffer = await ctx.stub.getState(key); // get the settlementTx from chaincode state
    if (!settlementTxBuffer || settlementTxBuffer.length === 0) {
      throw new Error(`The settlementTx ${key} does not exist`);
    }
    const settlementTxString = settlementTxBuffer.toString();
    const settlementTx = JSON.parse(settlementTxString);
    return settlementTx;
  }

  async writeState(ctx, key, txIn) {
    try {
      let TxInfo = JSON.parse(txIn);
      console.log("line no 427----PYMTutilsCC.js----TxInfo", TxInfo);
      await this.saveTxState(ctx, key, TxInfo);
    } catch (error) {
      throw Error(error);
    }
  }

  async GetTxByRange(ctx, startKey, endKey) {
    let resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
    let results = await this.GetAllResults(resultsIterator, false);
    console.log("Found " + results.length + " Transcations");
    return JSON.stringify(results);
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

module.exports = PYMTUtilsCC;
