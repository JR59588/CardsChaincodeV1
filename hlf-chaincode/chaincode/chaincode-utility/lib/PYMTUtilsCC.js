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
const SUBMIT_CC_SUFFIX = "SubmitSettlementTxCC";
const CONFIRM_CC_SUFFIX = "ConfirmSettlementTxCC";
const ACCOUNT_CC_SUFFIX = "AccountSettlementTxCC";

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
    additionalData
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
      additionalData: additionalData
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
  // x100
  async requestX100Tx(
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
    expirationDate,
    merchantCategoryCode,
    pointOfServiceEntryMode,
    acquiringInstitutionIdentificationCode,
    retrievalReferenceNumber,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    cardAcceptorNameAndLocation,
    currencyCode,
    additionalData,
    batchNumber,
    messageType,
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

    console.log("Inside requestX100Tx, generating key");
    // TODO: change the key as per the requirement by changing mid, cid, lrf.

    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber,
      messageType,
    );

    console.log("Inside requestX100Tx, Key generated: ", key);


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
      expirationDate: expirationDate,
      merchantCategoryCode: merchantCategoryCode,
      pointOfServiceEntryMode: pointOfServiceEntryMode,
      acquiringInstitutionIdentificationCode: acquiringInstitutionIdentificationCode,
      retrievalReferenceNumber: retrievalReferenceNumber,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      cardAcceptorNameAndLocation: cardAcceptorNameAndLocation,
      currencyCode: currencyCode,
      additionalData: additionalData,
      batchNumber: batchNumber,
      messageType: messageType,
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

  // x110 message
  async requestX110Tx(
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
    expirationDate,
    merchantCategoryCode,
    pointOfServiceEntryMode,
    acquiringInstitutionIdentificationCode,
    retrievalReferenceNumber,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    cardAcceptorNameAndLocation,
    currencyCode,
    additionalData,
    batchNumber,
    approverCode,
    authorizationId,
    messageType,
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

    console.log("Inside requestX110Tx, generating key");
    // TODO: change the key as per the requirement by changing mid, cid, lrf.

    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber,
      messageType,
    );
    console.log("Inside requestX500Tx, Key generated: ", key);


    // TODO: fields should be changed accordingly
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
      expirationDate: expirationDate,
      merchantCategoryCode: merchantCategoryCode,
      pointOfServiceEntryMode: pointOfServiceEntryMode,
      acquiringInstitutionIdentificationCode: acquiringInstitutionIdentificationCode,
      retrievalReferenceNumber: retrievalReferenceNumber,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      cardAcceptorNameAndLocation: cardAcceptorNameAndLocation,
      currencyCode: currencyCode,
      batchNumber: batchNumber,
      approverCode: approverCode,
      authorizationId: authorizationId,
      additionalData: additionalData,
      messageType: messageType
    };

    let strObj = JSON.stringify(settlementTx);
    console.log("Inside requestX110Tx, Requested Object String is: ", strObj);

    // === Save transaction to state ===

    console.log("------saving Txstate------");
    try {
      await this.saveTxState(ctx, key, settlementTx);
    } catch (err) {
      console.log(err);
      throw err;
    }

    const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    console.log("Inside requestX110Tx, buffer is: ", txBuffer);
    var hlfevent = new HLFEVENT();

    let { MERCHANT_RTX110_EVENT } = await hlfevent.hlfevents();

    try {
      await this.emitEvent(
        ctx,
        MERCHANT_RTX110_EVENT,
        MERCHANT_RTX110_EVENT.eventID,
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
  }


  // x500 message

  async requestX500Tx(
    ctx,
    MerchantId,
    CustomerId,
    LoanReferenceNumber,
    MerchantName,
    primaryAccountNumber,
    processingCode,
    transactionAmount,
    systemsTraceAuditNumber,
    networkInternationalId,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    transactionCurrencyCode,
    transactionLifecycleId,
    batchNumber,
    totalNumberOfTransactions,
    messageType
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
      LoanReferenceNumber,
      messageType
    );

    console.log("Inside requestX500Tx, Key generated: ", key);

    // TODO: fields should be changed accordingly
    let settlementTx = {
      MerchantId: MerchantId,
      CustomerId: CustomerId,
      LoanReferenceNumber: LoanReferenceNumber,
      MerchantName: MerchantName,
      primaryAccountNumber: primaryAccountNumber,
      processingCode: processingCode,
      transactionAmount: transactionAmount,
      systemsTraceAuditNumber: systemsTraceAuditNumber,
      networkInternationalId: networkInternationalId,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      transactionCurrencyCode: transactionCurrencyCode,
      transactionLifecycleId: transactionLifecycleId,
      batchNumber: batchNumber,
      totalNumberOfTransactions: totalNumberOfTransactions,
      messageType: messageType
    };

    let strObj = JSON.stringify(settlementTx);
    console.log("Inside requestX500Tx, Requested Object String is: ", strObj);

    // === Save transaction to state ===

    console.log("------saving Txstate------");
    try {
      await this.saveTxState(ctx, key, settlementTx);
    } catch (err) {
      console.log(err);
      throw err;
    }
    const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    console.log("Inside requestX500Tx, buffer is : ", txBuffer);
    var hlfevent = new HLFEVENT();
    let { MERCHANT_RTX500_EVENT } = await hlfevent.hlfevents();

    try {
      await this.emitEvent(
        ctx,
        MERCHANT_RTX500_EVENT,
        MERCHANT_RTX500_EVENT.eventID,
        key,
        settlementTx,
        OrgMSPId,
        channelName
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
    console.log("End of requestX500Tx");
  }

  // // x100 message
  // async confirmTx(
  //   ctx,
  //   MerchantId,
  //   CustomerId,
  //   LoanReferenceNumber,
  //   MerchantName,
  // ) {
  //   // acl

  //   var OrgMSPId = ctx.clientIdentity.getMSPID();
  //   var pymtutils = new PYMTUtils(ctx);
  //   var OrgMSPID = await pymtutils.getOrgMSPId(ctx);
  //   var channelName = await pymtutils.getChannelIdentity(ctx, "Org1");
  //   console.log("channel name : ", channelName);

  //   try {
  //     // TODO: change the parameters as per the requirement by changing mid, cid, lrf.
  //     await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
  //   // TODO: remove hardcoded Org1MSP
  //   const accessValid = true;//await pymtutils.validateOrganization(ctx, "Org1MSP");
  //   // TODO: change the message as per the requirement by changing mid, cid, lrf.
  //   if (!accessValid) {
  //     throw new Error(
  //       "This transaction already exists for merchantId : " +
  //       MerchantId +
  //       " customerId :" +
  //       CustomerId +
  //       "LoanReferenceNumber :" +
  //       LoanReferenceNumber
  //     );
  //   }
  //   console.log("access valid : ", accessValid);

  //   console.log("before the key in utilscc");
  //   // TODO: change the key as per the requirement by changing mid, cid, lrf.

  //   let key = await pymtutils.makeTxKey(
  //     OrgMSPID,
  //     MerchantId,
  //     CustomerId,
  //     LoanReferenceNumber,
  //     "x100",
  //   );
  //   console.log("after the key in utilscc");

  //   let settlementTx = {
  //     MerchantId: MerchantId,
  //     CustomerId: CustomerId,
  //     LoanReferenceNumber: LoanReferenceNumber,
  //     MerchantName: MerchantName
  //   };

  //   let { confirmSettlementTxFN } = await pymtutils.hlfconstants();

  //   let strObj = JSON.stringify(settlementTx);
  //   console.log(" strObj = ", strObj);
  //   var iCCName = CONFIRM_CC_SUFFIX;
  //   console.log(" PYTMutilscc.js iCCName : ", iCCName);
  //   // TODO: replace mid, mname, cid, lrf with the required fields as per the chaincode.
  //   const chaincodeResponse = await ctx.stub.invokeChaincode(
  //     iCCName,
  //     [
  //       confirmSettlementTxFN,
  //       MerchantId,
  //       MerchantName,
  //       CustomerId,
  //       LoanReferenceNumber,
  //       strObj,
  //     ],
  //     // SAChannelName
  //     channelName
  //   );

  //   console.log(" chaincodeResponse ", chaincodeResponse);

  //   var ccPayload = await checkInvokeCCResponse(chaincodeResponse);

  //   // var txIn = await this.getTxObject(ctx, key);
  //   let { TXSTATUS_CONFIRMED, TXSTATUS_NON_CONFIRMED } =
  //     await pymtutils.hlfconstants();
  //   console.log("PYTMutilscc.js ccPayload ", ccPayload);

  //   if (ccPayload == "true") {
  //     console.log("PYTMutilscc.js ccPayload ", ccPayload);
  //     settlementTx.TxStatus = TXSTATUS_CONFIRMED;
  //   } else {
  //     settlementTx.TxStatus = TXSTATUS_NON_CONFIRMED;
  //   }

  //   // === Save transaction to state ===

  //   console.log("------saving Txstate------");
  //   try {
  //     await this.saveTxState(ctx, key, settlementTx);
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }

  //   // console.log("before the putste in utilscc");
  //   // await ctx.stub.putState(key, Buffer.from(JSON.stringify(settlementTx)));
  //   // console.log("after the putstae in utilscc")
  //   const txBuffer = Buffer.from(JSON.stringify(settlementTx));
  //   // ctx.stub.setEvent("E-TxRequested", txBuffer);
  //   console.log("tx buffer : ", txBuffer);
  //   var hlfevent = new HLFEVENT();
  //   let { MERCHANT_RT_EVENT } = await hlfevent.hlfevents();
  //   // /**
  //   try {
  //     await this.emitEvent(
  //       ctx,
  //       MERCHANT_RT_EVENT,
  //       MERCHANT_RT_EVENT.eventID,
  //       key,
  //       settlementTx,
  //       OrgMSPId,
  //       channelName
  //     );
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
  //   console.log("The END");
  //   // return JSON.stringify(settlementTx);
  //   // */
  // }

  // TODO add submit request fields.
  // x110
  async submitTx(
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
    expirationDate,
    merchantCategoryCode,
    pointOfServiceEntryMode,
    acquiringInstitutionIdentificationCode,
    retrievalReferenceNumber,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    cardAcceptorNameAndLocation,
    currencyCode,
    additionalData,
    batchNumber,
    approverCode,
    authorizationId,
    messageType,
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
      LoanReferenceNumber,
      messageType,
    );
    console.log("after the key in utilscc");

    // TODO: fields should be changed accordingly
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

      expirationDate: expirationDate,
      merchantCategoryCode: merchantCategoryCode,
      pointOfServiceEntryMode: pointOfServiceEntryMode,
      acquiringInstitutionIdentificationCode: acquiringInstitutionIdentificationCode,
      retrievalReferenceNumber: retrievalReferenceNumber,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      cardAcceptorNameAndLocation: cardAcceptorNameAndLocation,
      currencyCode: currencyCode,
      batchNumber: batchNumber,
      approverCode: approverCode,
      authorizationId: authorizationId,
      additionalData: additionalData,
      messageType: messageType
    };

    // TODO: add a function called submitSettlementTxFN
    let { submitSettlementTxFN } = await pymtutils.hlfconstants();

    let strObj = JSON.stringify(settlementTx);
    console.log(" strObj = ", strObj);
    var iCCName;

    // TODO: Chaincode name should be written appropriately
    iCCName = SUBMIT_CC_SUFFIX;
    console.log(" PYTMutilscc.js iCCName : ", iCCName);
    // TODO: replace mid, mname, cid, lrf with the required fields as per the chaincode.

    const chaincodeResponse = await ctx.stub.invokeChaincode(
      iCCName,
      [
        // TODO: submitSettlementTxFN
        submitSettlementTxFN,
        // MerchantId,
        // MerchantName,
        // CustomerId,
        // LoanReferenceNumber,
        strObj
      ],
      // SAChannelName
      channelName
    );

    console.log(" chaincodeResponse ", chaincodeResponse);

    var ccPayload = await checkInvokeCCResponse(chaincodeResponse);

    // var txIn = await this.getTxObject(ctx, key);
    let { TXSTATUS_SUBMITTED, TXSTATUS_NOT_SUBMITTED } =
      await pymtutils.hlfconstants();
    console.log("PYTMutilscc.js ccPayload ", ccPayload);

    if (ccPayload == "true") {
      console.log("PYTMutilscc.js ccPayload ", ccPayload);
      settlementTx.TxStatus = TXSTATUS_SUBMITTED;
    } else {
      settlementTx.TxStatus = TXSTATUS_NOT_SUBMITTED;
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

  // x500
  async accountTx(
    ctx,
    MerchantId,
    CustomerId,
    LoanReferenceNumber,
    MerchantName,
    primaryAccountNumber,
    processingCode,
    transactionAmount,
    systemsTraceAuditNumber,
    networkInternationalId,
    cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode,
    transactionCurrencyCode,
    transactionLifecycleId,
    batchNumber,
    totalNumberOfTransactions,
    messageType
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
      LoanReferenceNumber,
      messageType
    );
    console.log("after the key in utilscc");

    // TODO: fields should be changed accordingly
    let settlementTx = {
      MerchantId: MerchantId,
      CustomerId: CustomerId,
      LoanReferenceNumber: LoanReferenceNumber,
      MerchantName: MerchantName,
      primaryAccountNumber: primaryAccountNumber,
      processingCode: processingCode,
      transactionAmount: transactionAmount,
      systemsTraceAuditNumber: systemsTraceAuditNumber,
      networkInternationalId: networkInternationalId,
      cardAcceptorTerminalIdentification: cardAcceptorTerminalIdentification,
      cardAcceptorIdentificationCode: cardAcceptorIdentificationCode,
      transactionCurrencyCode: transactionCurrencyCode,
      transactionLifecycleId: transactionLifecycleId,
      batchNumber: batchNumber,
      totalNumberOfTransactions: totalNumberOfTransactions,
      messageType: messageType
    };

    // TODO: add a function called accountSettlementTxFN
    let { accountSettlementTxFN } = await pymtutils.hlfconstants();

    let strObj = JSON.stringify(settlementTx);
    console.log(" strObj = ", strObj);

    const transactionsStrObj = await this.GetTxByRange(ctx, "", "");
    const prevTxns = JSON.parse(transactionsStrObj);
    const stan = settlementTx.systemsTraceAuditNumber;
    console.log("Stan is: ", stan);
    console.log("Previous transactions are:", prevTxns);

    const x100Msgs = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x100" && prevTxn.Record.systemsTraceAuditNumber === stan);
    const x110Msgs = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x110" && prevTxn.Record.systemsTraceAuditNumber === stan);

    console.log("Prev txns are: ", prevTxns, "X100 messages are: ", x100Msgs, "X110 messages are: ", x110Msgs);
    var iCCName;
    // iCCName = "MC_" + PYMTTX_MERCHANT_CC_SUFFIX;
    iCCName = ACCOUNT_CC_SUFFIX;
    console.log(" PYTMutilscc.js iCCName : ", iCCName);
    // TODO: replace mid, mname, cid, lrf with the required fields as per the chaincode.
    const chaincodeResponse = await ctx.stub.invokeChaincode(
      iCCName,
      [
        // TODO: accountSettlementTxFN
        accountSettlementTxFN,
        // MerchantId,
        // MerchantName,
        // CustomerId,
        // LoanReferenceNumber,
        strObj,
        transactionsStrObj,
      ],
      // SAChannelName
      channelName
    );

    console.log(" chaincodeResponse ", chaincodeResponse);

    var ccPayload = await checkInvokeCCResponse(chaincodeResponse);

    // var txIn = await this.getTxObject(ctx, key);
    let { TXSTATUS_ACCOUNTED, TXSTATUS_NON_ACCOUNTED } =
      await pymtutils.hlfconstants();
    console.log("PYTMutilscc.js ccPayload ", ccPayload);

    if (ccPayload == "true") {
      console.log("PYTMutilscc.js ccPayload ", ccPayload);
      settlementTx.TxStatus = TXSTATUS_ACCOUNTED;
      for (let i = 0; i < x100Msgs.length; i++) {
        const x100Msg = x100Msgs[i];
        console.log("Inside for loop x100 msg: ", x100Msg);
        x100Msg.Record.TxStatus = TXSTATUS_ACCOUNTED;
      }

      for (let i = 0; i < x110Msgs.length; i++) {
        const x110Msg = x110Msgs[i];
        console.log("Inside for loop x110 msg: ", x110Msg);

        x110Msg.Record.TxStatus = TXSTATUS_ACCOUNTED;
      }
    } else {
      settlementTx.TxStatus = TXSTATUS_NON_ACCOUNTED;
      for (let i = 0; i < x100Msgs.length; i++) {
        const x100Msg = x100Msgs[i];
        console.log("Inside for loop x100 msg: ", x100Msg);
        x100Msg.Record.TxStatus = TXSTATUS_NON_ACCOUNTED;
      }

      for (let i = 0; i < x110Msgs.length; i++) {
        const x110Msg = x110Msgs[i];
        console.log("Inside for loop x110 msg: ", x110Msg);

        x110Msg.Record.TxStatus = TXSTATUS_NON_ACCOUNTED;
      }
    }

    // === Save transaction to state ===

    console.log("------saving Txstate------");
    try {
      await this.saveTxState(ctx, key, settlementTx);
      for (let i = 0; i < x100Msgs.length; i++) {
        const x100Msg = x100Msgs[i];
        await this.saveTxState(ctx, x100Msg.Key, x100Msg.Record);

      }

      for (let i = 0; i < x110Msgs.length; i++) {
        const x110Msg = x110Msgs[i];
        await this.saveTxState(ctx, x110Msg.Key, x110Msg.Record);

      }

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
