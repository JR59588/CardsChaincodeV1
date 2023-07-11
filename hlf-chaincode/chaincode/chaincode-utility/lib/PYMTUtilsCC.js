/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const PYMTUtils = require("./PYMTUtils");
const { Contract } = require("fabric-contract-api");
// const HLFEVENT = require("./HLFEVENT");
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
    CustomerName,
    TransactionCurrency,
    TransactionAmount,
    TransactionReferenceNumber,
    TransactionDate,
    ProductType,
    DateofLoanApproval,
    LoanDisbursementDate,
    LoanAmount,
    LoanTenure,
    LoanStatus,
    LoanAccountNumber,
    LoCapprovedamount,
    LoCAvailableamount,
    IsContractSigned,
    Location,
    POSEntryMode,
    SubmittedBy,
    SubmissionNumber,
    ServiceDate,
    SubmissionDate
  ) {
    // acl

    // var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);
    var channelName = await pymtutils.getChannelForOrgWithAgg(ctx, "AggOrgMSP");

    try {
      await pymtutils.checkNull(merchantId, CustomerId, loanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    //20.2.23 changed to AggOrgMSP.
    const accessValid = await pymtutils.validateOrganization(ctx, "AggOrgMSP");
    console.log("accessValid : ", accessValid);

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
      // submitter MSPId added by deepak
      // this will contain the mspId of submitter organization
      //SubmitterMSPID: clientId,
      MerchantId: merchantId,
      MerchantName: merchantName, // 10.2.23 merchant name is removed from front end. so this value should not be relied up-on
      CustomerName: CustomerName,
      CustomerID: CustomerId,
      TransactionCurrency: TransactionCurrency,
      TransactionAmount: TransactionAmount,
      TransactionReferenceNumber: TransactionReferenceNumber,
      TransactionDate: TransactionDate,
      LoanReferenceNumber: loanReferenceNumber,
      ProductType: ProductType,
      DateofLoanApproval: DateofLoanApproval,
      LoanDisbursementDate: LoanDisbursementDate,
      LoanAmount: LoanAmount,
      LoanTenure: LoanTenure,
      LoanStatus: LoanStatus,
      LoanAccountNumber: LoanAccountNumber,
      LoCapprovedamount: LoCapprovedamount,
      LoCAvailableamount: LoCAvailableamount,
      IsContractSigned: IsContractSigned,
      Location: Location,
      POSEntryMode: POSEntryMode,
      SubmittedBy: SubmittedBy,
      SubmissionNumber: SubmissionNumber,
      ServiceDate: ServiceDate,
      SubmissionDate: SubmissionDate
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
    CustomerName,
    TransactionCurrency,
    TransactionAmount,
    TransactionReferenceNumber,
    TransactionDate,
    ProductType,
    DateofLoanApproval,
    LoanDisbursementDate,
    LoanAmount,
    LoanTenure,
    LoanStatus,
    LoanAccountNumber,
    LoCapprovedamount,
    LoCAvailableamount,
    IsMerchantContractSigned,
    Location,
    POSEntryMode,
    SubmittedBy,
    SubmissionNumber,
    ServiceDate,
    SubmissionDate
  ) {
    // acl

    var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);
    var channelName = await pymtutils.getChannelForOrgWithoutAgg(ctx, "Org1");
    console.log("channel name : ", channelName);

    try {
      await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Ord1MSP
    const accessValid = await pymtutils.validateOrganization(ctx, "Org1MSP");
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
    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber
    );
    console.log("after the key in utilscc");

    let settlementTx = {
      MerchantId: MerchantId,
      MerchantName: MerchantName, // 10.2.23 merchant name is removed from front end. so this value should not be relied up-on
      CustomerName: CustomerName,
      CustomerID: CustomerId,
      TransactionCurrency: TransactionCurrency,
      TransactionAmount: TransactionAmount,
      TransactionReferenceNumber: TransactionReferenceNumber,
      TransactionDate: TransactionDate,
      LoanReferenceNumber: LoanReferenceNumber,
      ProductType: ProductType,
      DateofLoanApproval: DateofLoanApproval,
      LoanDisbursementDate: LoanDisbursementDate,
      LoanAmount: LoanAmount,
      LoanTenure: LoanTenure,
      LoanStatus: LoanStatus,
      LoanAccountNumber: LoanAccountNumber,
      LoCapprovedamount: LoCapprovedamount,
      LoCAvailableamount: LoCAvailableamount,
      IsMerchantContractSigned: IsMerchantContractSigned,
      Location: Location,
      POSEntryMode: POSEntryMode,
      SubmittedBy: SubmittedBy,
      SubmissionNumber: SubmissionNumber,
      ServiceDate: ServiceDate,
      SubmissionDate: SubmissionDate,
      TxStatus: "TxRequested",
      txID: "",
      txTimestamp: "",
    };

    let { requestSettlementTxFN } = await pymtutils.hlfconstants();

    let strObj = JSON.stringify(settlementTx);
    console.log(" strObj = ", strObj);
    var iCCName;
    iCCName = "MC_" + PYMTTX_MERCHANT_CC_SUFFIX;
    console.log(" PYTMutilscc.js iCCName : ", iCCName);
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
        const eventPayloadBuffer = Buffer.from(JSON.stringify(eventPayload));
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
      txIn.txTimestamp = txTimestamp.toString();
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
