/* 
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const PYMTUtils = require('./PYMTUtils');
const { Contract } = require('fabric-contract-api');
class MerchantTxCC extends Contract {

  // CreateAsset issues a new asset to the world state with given details.
  async requestSettlementTx(
    ctx,
    MerchantId,
    MerchantName,
    CustomerId,
    LoanReferenceNumber,
    txObjJSON
  ) {
    console.log(".....In requestSettlementTx ......");
    // var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);

    let { TXSTATUS_REQUESTED } = await pymtutils.hlfconstants();
    let { PYMTUtilsCC, MRT1_ORG_NAME } = await pymtutils.hlfconstants();

    try {
      await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Ord1MSP
    const accessValid = true; //await pymtutils.validateOrganization(ctx, OrgMSPID);

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

    // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
    // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx() 
    // if isValidMerchantId(m101)
    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber
    );
    console.log(" merchantsettlementcc.js:key", key);
    // else return error

    let channelName = await pymtutils.getChannelIdentity(ctx, "Org1MSP");

    // ==== Create tx object and marshal to JSON ====

    console.log("txObjJSON = ", txObjJSON);
    const tx = JSON.parse(txObjJSON);
    console.log('orgMSPID: ', OrgMSPID);
    console.log('Contents: ', txObjJSON);

    let verified = false;
    // if (OrgMSPID == MRT1_ORG_NAME) {
    verified = await this.doVerifyRequestSettlementTx(ctx, tx);

    console.log("After verifying merchantchecks: " + verified);

    //}
    return verified;
    // === Save transaction to state ===
    // await ctx.stub.putState(key, Buffer.from(JSON.stringify(settlementTx)));
    // const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    // ctx.stub.setEvent("E-TxRequested", txBuffer);

  }


  // Add x500 message to the blockchain db.
  async requestSettlementX500Tx(
    ctx,
    MerchantId,
    MerchantName,
    CustomerId,
    LoanReferenceNumber,
    txObjJSON
  ) {
    console.log(".....In requestSettlementTx ......");
    // var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);

    let { TXSTATUS_REQUESTED } = await pymtutils.hlfconstants();
    let { PYMTUtilsCC, MRT1_ORG_NAME } = await pymtutils.hlfconstants();

    try {
      await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Ord1MSP
    const accessValid = true; //await pymtutils.validateOrganization(ctx, OrgMSPID);

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

    // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
    // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx() 
    // if isValidMerchantId(m101)
    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber
    );
    console.log(" merchantsettlementcc.js:key", key);
    // else return error

    let channelName = await pymtutils.getChannelIdentity(ctx, "Org1MSP");

    // ==== Create tx object and marshal to JSON ====

    console.log("txObjJSON = ", txObjJSON);
    const tx = JSON.parse(txObjJSON);
    console.log('orgMSPID: ', OrgMSPID);
    console.log('Contents: ', txObjJSON);

    let verified = false;
    // if (OrgMSPID == MRT1_ORG_NAME) {
    verified = await this.doVerifyRequestSettlementX500Tx(ctx, tx);

    console.log("After verifying merchantchecks: " + verified);

    //}
    return verified;
    // === Save transaction to state ===
    // await ctx.stub.putState(key, Buffer.from(JSON.stringify(settlementTx)));
    // const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    // ctx.stub.setEvent("E-TxRequested", txBuffer);

  }


  async submitSettlementTx(
    ctx,
    MerchantId,
    MerchantName,
    CustomerId,
    LoanReferenceNumber,
    txObjJSON
  ) {
    console.log(".....In submitSettlementTx ......");
    // var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);

    let { TXSTATUS_SUBMITTED } = await pymtutils.hlfconstants();
    let { PYMTUtilsCC, MRT1_ORG_NAME } = await pymtutils.hlfconstants();

    try {
      await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Ord1MSP
    const accessValid = true; //await pymtutils.validateOrganization(ctx, OrgMSPID);

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

    // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
    // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx() 
    // if isValidMerchantId(m101)
    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber
    );
    console.log(" merchantsettlementcc.js:key", key);
    // else return error

    let channelName = await pymtutils.getChannelIdentity(ctx, "Org1MSP");

    // ==== Create tx object and marshal to JSON ====

    console.log("txObjJSON = ", txObjJSON);
    const tx = JSON.parse(txObjJSON);
    console.log('orgMSPID: ', OrgMSPID);
    console.log('Contents: ', txObjJSON);

    let verified = false;
    // if (OrgMSPID == MRT1_ORG_NAME) {
    verified = await this.doVerifySubmitSettlementTx(ctx, tx);

    console.log("After verifying merchantchecks: " + verified);

    //}
    return verified;
    // === Save transaction to state ===
    // await ctx.stub.putState(key, Buffer.from(JSON.stringify(settlementTx)));
    // const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    // ctx.stub.setEvent("E-TxRequested", txBuffer);

  }

  async accountSettlementTx(
    ctx,
    MerchantId,
    MerchantName,
    CustomerId,
    LoanReferenceNumber,
    txObjJSON
  ) {
    console.log(".....In accountSettlementTx ......");
    // var OrgMSPId = ctx.clientIdentity.getMSPID();
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);

    let { TXSTATUS_REQUESTED } = await pymtutils.hlfconstants();
    let { PYMTUtilsCC, MRT1_ORG_NAME } = await pymtutils.hlfconstants();

    try {
      await pymtutils.checkNull(MerchantId, CustomerId, LoanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Ord1MSP
    const accessValid = true; //await pymtutils.validateOrganization(ctx, OrgMSPID);

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

    // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
    // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx() 
    // if isValidMerchantId(m101)
    let key = await pymtutils.makeTxKey(
      OrgMSPID,
      MerchantId,
      CustomerId,
      LoanReferenceNumber
    );
    console.log(" merchantsettlementcc.js:key", key);
    // else return error

    let channelName = await pymtutils.getChannelIdentity(ctx, "Org1MSP");

    // ==== Create tx object and marshal to JSON ====

    console.log("txObjJSON = ", txObjJSON);
    const tx = JSON.parse(txObjJSON);
    console.log('orgMSPID: ', OrgMSPID);
    console.log('Contents: ', txObjJSON);

    let verified = false;
    // if (OrgMSPID == MRT1_ORG_NAME) {
    verified = await this.doVerifyAccountSettlementTx(ctx, tx);

    console.log("After verifying merchantchecks: " + verified);

    //}
    return verified;
    // === Save transaction to state ===
    // await ctx.stub.putState(key, Buffer.from(JSON.stringify(settlementTx)));
    // const txBuffer = Buffer.from(JSON.stringify(settlementTx));
    // ctx.stub.setEvent("E-TxRequested", txBuffer);

  }

  async getRequestedTx(ctx, channelName, MerchantId, CustomerID, LoanReferenceNumber) {

    var pymtutils = new PYMTUtils(ctx);
    var clientId = await pymtutils.getOrgMSPId(ctx);
    let key = await pymtutils.makeTxKey(clientId, MerchantId, CustomerID, LoanReferenceNumber);

    let settlementTxBuffer = await ctx.stub.getState(key); // get the settlementTx from chaincode state
    if (!settlementTxBuffer || settlementTxBuffer.length === 0) {
      throw new Error(`The settlementTx ${key} does not exist`);
    }
    let settlementTxString = settlementTxBuffer.toString();
    let settlementTx = JSON.parse(settlementTxString);

    return settlementTx;
  }

  async endorseSettlementTx(ctx, merchantId, CustomerId, loanReferenceNumber, txAmount) {
    // TODO: must check that txStatus is txRequested, if not then do nothing
    var pymtutils = new PYMTUtils();
    var clientId = getOrgMSPId(ctx);
    var key = await pymtutils.makeTxKey(OrgMSPId, merchantId, CustomerId, loanReferenceNumber);

    var txStatus = PYMTUtilsCC.getTxStatus(ctx, key);

    if (txStatus != pymtutils.TXSTATUS_REQUESTED) {
      console.log("Tx [ " + key + "] : Not in requested state; Tx not processed");

      return false;
    }

    if (txStatus == pymtutils.TXSTATUS_REQUESTED) {
      try {
        await pymtutils.checkNull(merchantId, CustomerId, loanReferenceNumber);
      } catch (err) {
        console.log(err);
        throw err;
      }

      let size = parseInt(loanReferenceNumber);
      if (typeof size !== "number") {
        throw new Error("Loan Reference Number must be a numeric string");
      }

      if (txAmount <= 0) {
        throw new Error("txAmount cannot be zero or a negative number");
      }

      // const id = merchantId +"-" + customerId +"-"+ loanReferenceNumber;
      // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
      // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx() 
      // if isValidMerchantId(m101)
      let key = await pymtutils.makeTxKey(OrgMSPId, merchantId, CustomerId, loanReferenceNumber);
      // else return error

      // const tx = await readState(ctx, key);
      var txObj = PYMTUtilsCC.getTxObject(ctx, key);
      console.log(JSON.stringify(txObj) + "tx value");

      // TODO: remove hardcoded Ord3MSP
      // const accessValid = await validateOrganization(ctx, "Org3MSP");
      const accessValid = true; //await pymtutils.validateOrganization(ctx, "Org3MSP");

      if (!accessValid) {
        throw new Error(
          "Un-authorized Access for transaction for merchantId : " +
          merchantId +
          " customerId :" +
          customerId +
          "LoanReferenceNumber :" +
          loanReferenceNumber
        );
      }

      checkNull(merchantId, customerId, loanReferenceNumber);

      // TODO: perform sa and ap specific validation (prefer excel)
      // TODO: if all okay update TxStatus to TxAccepted
      var clientId = getOrgMSPId(ctx);
      if (clientId == pymtutils.SA_ORG_NAME) {
        var acceptable = isTxAcceptableBySA(ctx, txObj);
      }

      if (clientId == pymtutils.AP_ORG_NAME) {
        var acceptable = isTxAcceptableByAP(ctx, txObj);
      }
    }


  }


  async initiateSettlementTx(
    ctx,
    merchantId,
    merchantName,
    customerId,
    loanReferenceNumber,
    txObjJSON
  ) {
    console.log(".....In initiateSettlementTx ......");
    var pymtutils = new PYMTUtils(ctx);
    var OrgMSPID = await pymtutils.getOrgMSPId(ctx);
    console.log("line no 46 Presettlementcc.js:OrgMSPID", OrgMSPID);

    //let { PYMTUtilsCC } = await pymtutils.hlfconstants();
    console.log("read this line and next line is in problem line num 51 ");
    let { TXSTATUS_INITIATED } = await pymtutils.hlfconstants();
    let { PYMTUtilsCC, PSP_ORG_NAME } = await pymtutils.hlfconstants();
    // TODO: must check that txStatus is txRequested, if not then do nothing

    try {
      await pymtutils.checkNull(merchantId, customerId, loanReferenceNumber);
    } catch (err) {
      console.log(err);
      throw err;
    }
    // TODO: remove hardcoded Ord1MSP
    // TODO: remove hardcoded Org3MSP must check if it is merchantOrg only
    // const accessValid = await validateOrganization(ctx, "Org3MSP");

    const accessValid = await pymtutils.validateOrganization(ctx, "PSPOrgMSP");

    if (!accessValid) {
      throw new Error(
        "This transaction already exists for merchantId : " +
        merchantId +
        " customerId :" +
        customerId +
        "LoanReferenceNumber :" +
        loanReferenceNumber
      );
    }


    var key = await pymtutils.makeTxKey(
      OrgMSPID,
      merchantId,
      customerId,
      loanReferenceNumber
    );
    console.log("line no 48 settlementcc.js:key", key);
    //// getTxStatus is in cc cross chaincode invocation for gettx status...

    let channelName = await pymtutils.getChannelIdentity(ctx, "PSPOrgMSP");
    // let size = parseInt(loanReferenceNumber);
    // if (typeof size !== "number") {
    //   throw new Error("Loan Reference Number must be a numeric string");
    // }

    // if (txAmount <= 0) {
    //   throw new Error("txAmount cannot be zero or a negative number");
    // }

    // const id = merchantId +"-" + customerId +"-"+ loanReferenceNumber;
    // TODO: check merchant ID is within specific range. If merchantId is true then proced else return error
    // TODO: key needs tobe modified to be prefixed by orgid/orgMSPId. This will be required for various validation. for ex: in acceptSettlementTx()
    // if isValidMerchantId(m101)




    //TODO: convert txObjJSON into settlementTx value object

    //const jsonString = '{"MerchantId" : "MerchantId", "MerchantName" : "MerchantName","CustomerName": "CustomerName","CustomerID": "CustomerID",}';
    console.log("txObjJSON = ", txObjJSON);
    const tx = JSON.parse(txObjJSON);
    console.log('Type: ', typeof txObjJSON);
    console.log('Contents: ', txObjJSON)

    //TODO: remove hardcoded Org3MSP must check if it is merchantOrg only
    let verified = false;
    //14.02.23 Corrected check for AGG_ORG_NAME
    if (OrgMSPID == PSP_ORG_NAME) {

      verified = await this.doVerifyinitiateSettlementTx(ctx, tx);

    }
    console.log("After verifying merchantchecks: " + verified);
    return verified;
  }


  async doVerifyRequestSettlementTx(ctx, tx) {
    var isVerified = true;
    const hasTxprimaryAccountNumber = "primaryAccountNumber" in tx;
    if (hasTxprimaryAccountNumber) {
      if (tx.primaryAccountNumber === "" || tx.primaryAccountNumber.length == 0) {
        isVerified = false;
        console.log(
          "Validation primaryAccountNumber not valid: ",
          isVerified
        );
        return isVerified;
      }
    } else {
      return false;
    }
    return isVerified;
  }


  async doVerifyRequestSettlementX500Tx(ctx, tx) {
    var isVerified = true;
    const hasTxsystemsTraceAuditNumber = "systemsTraceAuditNumber" in tx;
    if (hasTxsystemsTraceAuditNumber) {
      if (tx.systemsTraceAuditNumber === "" || tx.systemsTraceAuditNumber.length == 0) {
        isVerified = false;
        console.log(
          "Validation systemsTraceAuditNumber not valid: ",
          isVerified
        );
        return isVerified;
      }
    } else {
      return false;
    }
    return isVerified;
  }

  async doVerifySubmitSettlementTx(ctx, tx) {
    // TODO: Please check the reconciliation message either accepted or rejected and check that one particular field.
    var isVerified = true;
    const hasTxprimaryAccountNumber = "primaryAccountNumber" in tx;
    if (hasTxprimaryAccountNumber) {
      if (tx.primaryAccountNumber === "" || tx.primaryAccountNumber.length == 0) {
        isVerified = false;
        console.log(
          "Validation primaryAccountNumber not valid: ",
          isVerified
        );
        return isVerified;
      }
    } else {
      return false;
    }
    return isVerified;
  }

  async doVerifyAccountSettlementTx(ctx, tx) {
    // TODO: Please check the reconciliation message either accepted or rejected and check that one particular field.
    var isVerified = true;
    const hasTxprimaryAccountNumber = "primaryAccountNumber" in tx;
    if (hasTxprimaryAccountNumber) {
      if (tx.primaryAccountNumber === "" || tx.primaryAccountNumber.length == 0) {
        isVerified = false;
        console.log(
          "Validation primaryAccountNumber not valid: ",
          isVerified
        );
        return isVerified;
      }
    } else {
      return false;
    }
    return isVerified;
  }


  async doVerifyinitiateSettlementTx(ctx, tx) {
    var isVerify = true;
    if (!tx.primaryAccountNumber || tx.primaryAccountNumber.length === 0) {
      isVerify = false;

    }

    // if (tx.primaryAccountNumber != 16) {
    //   isVerify = false;
    //   console.log("Primary Account Number should have 16 characters");
    // }

    //13.02.23 changed validation to be on DateofLoanApproval
    // if (!tx.DateofLoanApproval || tx.DateofLoanApproval.length === 0) {
    //   isVerify = false;
    //   console.log("DateofLoanApproval not provided");
    // } else {
    //   isVerify = true;
    // }
    return isVerify;
  }

}
module.exports = MerchantTxCC;