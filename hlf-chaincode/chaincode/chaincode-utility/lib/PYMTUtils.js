// const SAChaincodeName = "SAvalidationcc";
// const APChaincodeName = "APvalidationcc";

//CHANNEL1 : "channel1";
//APChannelName : "mychannel";

// TODO: this names must correspond to the HLF network configuration

class PYMTUtils {
  constructor(ctx) {
    // super();
    this.ctx = ctx;
  }

  async hlfconstants(ctx) {
    const hc = {


      // SA_ORG_MSPID: "SAOrgMSP",
      MRT1_ORG_NAME: "Org1MSP",
      // AP_ORG_NAME: "APMSP",
      // AGG_ORG_NAME: "AggOrgMSP",
      // CACCT_ORG_NAME: "CAcctMSP",
      // EDI_ORG_NAME: "EDIMSP",
      PSP_ORG_MSPID: "PSPMSP",
      AOD_ORG_MSPID: "AODMSP",
      ACD_ORG_MSPID: "ACDMSP",
      AAD_ORG_MSPID: "AADMSP",


      TXSTATUS_ACCEPTED: "TxAccepted",
      TXSTATUS_REQUESTED: "TxRequested",
      TXSTATUS_REJECTED: "TxRejected",
      TXSTATUS_INITIATED: "TxInitiated",
      TXSTATUS_SUBMITTED: "TxSubmitted",
      TXSTATUS_NOT_SUBMITTED: "TxNotSubmitted",
      TXSTATUS_AUTHORIZED: "TxAuthorized",
      TXSTATUS_NOT_AUTHORIZED: "TxNotAuthorized",
      TXSTATUS_BALANCED: "TxBalanced",
      TXSTATUS_NOT_BALANCED: "TxNotBalanced",
      TXSTATUS_CLEARED: "TxCleared",
      TXSTATUS_NOT_CLEARED: "TxNotCleared",
      submitSettlementTxFN: "submitSettlementTx",
      requestSettlementTxFN: "requestSettlementTx",
      accountSettlementTxFN: "accountSettlementTx",
      initiateSettlementTxFN: "initiateSettlementTx",
      reconciliationSettlementTxFN: "reconciliationSettlementTx",
      PYMTUtilsCC: "PYMTUtilsCC",
      PYMTUtilsCCReadState: "readState",
      PYMTUtilsCCWriteState: "writeState",

      // PYMTTxMerchantCC: "PYMTTxMerchantCC",
      // PYMTTxPreSettlementCC: "PYMTTxPreSettlementCC",
      // processSettlementTxFN: "processSettlementTX",
      // PYMTTxPreSettlementCC: "PYMTTxPreSettlementCC",
      // processSettlementTxFN: "processSettlementTX",

      readSettlementTxFN: "readState",

      IsMerchantContractSigned: "IsMerchantContractSigned",
      // APChaincodeName: "APvalidationcc",
      // SACCFuncName: "validation",
      // APCCFuncName: "validation",
      // acceptSettlementTxFN: "acceptSettlementTx",
      // validateSettlementTxFN: "validateSettlementTx",

      // requestSettlementTxFN: "requestSettlementTx",
      // TXSTATUS_REQUESTED: "TxRequested",
      // TXSTATUS_VALIDATED: "TxValidated",
      // TXSTATUS_NOT_VALIDATED: "TxNotValidated",
      // TXSTATUS_SUBMITED: "TxSubmited",
      // TXSTATUS_NOT_TOBE_SUBMITED: "TxNotSubmited",
      // TXSTATUS_PROCESSED: "TxProcessed",
      // TXSTATUS_NOT_PROCESSED: "TxNotProcessed",
      // TXSTATUS_CLEARED: "TxCleared",
      // TXSTATUS_NOT_CLEARED: "TxNotCleared",
      // TXSTATUS_INITIATED: "TxInitiated",
      TXSTATUS_CONFIRMED: "TxConfirmed",
      TXSTATUS_NON_CONFIRMED: "TxNonConfirmed",
      // TXSTATUS_BALANCED: "TxBalanced",
      // TXSTATUS_NON_BALANCED: "TxNonBalanced",
      TXSTATUS_ACCOUNTED: "TxAccounted",
      TXSTATUS_NON_ACCOUNTED: "TxNonAccounted",

    };
    return hc;
  }

  // TODO: Have to check with arguments. (discussion with nishant)
  async checkNull(merchantId, customerId, loanReferenceNumber) {
    console.log("in checknull:" + merchantId);
    console.log("in checknull:" + customerId);
    console.log("in checknull:" + loanReferenceNumber);
    if (!merchantId || merchantId.length === 0) {
      throw new Error("MerchantId should not be empty");
    }
    if (!customerId || customerId.length === 0) {
      throw new Error("Customer Id should not be empty");
    }
    if (!loanReferenceNumber || loanReferenceNumber.length === 0) {
      throw new Error("LoanReferenceNumber should not be empty");
    }
  }

  async getOrgMSPId(ctx) {
    var clientId = await ctx.clientIdentity.getMSPID();
    let channelId = await ctx.stub.getChannelID();
    console.log(" ChannelID for ", clientId, ":", channelId);

    if (!clientId || clientId.length === 0) {
      throw new Error(
        "No MSP id found - please check your configuration and chaincode parameters"
      );
    }
    return clientId;
  }

  // TODO: Check the arguments to make the key. (discussion in team)
  async makeTxKey(OrgMSPID, merchantId, customerId, loanReferenceNumber) {
    // TODO: add checks to make sure parameters are not null, else throw error
    console.log(
      "it is reading this line after maketxkey : ",
      OrgMSPID,
      merchantId,
      customerId,
      loanReferenceNumber
    );
    await this.checkNull(merchantId, customerId, loanReferenceNumber);

    let key =
      // OrgMSPID +
      // "-" +
      merchantId + "-" + customerId + "-" + loanReferenceNumber;
    ///// add cross chain invocation for getstate from utilscc....
    try {
      let txInfo = await this.ctx.stub.getState(key);
      if (txInfo.toString()) {
        // throw new Error(
        console.log(
          "This transaction already exists for merchantId : " +
          merchantId +
          " customerId :" +
          customerId +
          "LoanReferenceNumber :" +
          loanReferenceNumber
        );
      }
    } catch (err) {
      console.log(err);
      // jsonRes.Value = res.value.value.toString("utf8");
      throw err;
    }
    return key;
  }

  // TODO: Check whether read state is used from this code.
  async readTxStatus(ctx, key, channelName) {
    console.log(
      "line no 110----PYMTutils.js----validateTx--key,channelName",
      key,
      channelName
    );
    var pymtutils = new PYMTUtils(ctx);
    let { PYMTUtilsCC, PYMTUtilsCCReadState } = await pymtutils.hlfconstants();

    const chaincodeResponse = await this.ctx.stub.invokeChaincode(
      PYMTUtilsCC,
      [PYMTUtilsCCReadState, key],
      channelName
    );

    console.log(
      "line no 133----PYMTutils.js----ReadState--from : ${PYMTUtilsCC} ",
      chaincodeResponse
    );

    if (chaincodeResponse.status !== 200) {
      throw new Error(chaincodeResponse.message);
    }

    if (!chaincodeResponse) {
      let jsonResp = {};
      jsonResp.Error = "Error while reading Tx status for key :" + key;
      throw new Error(JSON.stringify(jsonResp));
    }
    const payload = Buffer.from(chaincodeResponse.payload, "base64").toString();

    return payload;
  }

  // TODO: Check whether read state is used from this code.
  // Please pass the value as JSON objet.
  async writeTxStatus(ctx, key, channelName, value) {
    try {
      console.log(
        "line no 157----PYMTutils.js----writeTxStatus--key,channelName",
        key,
        channelName
      );
      var pymtutils = new PYMTUtils(ctx);

      let { PYMTUtilsCC, PYMTUtilsCCWriteState } =
        await pymtutils.hlfconstants();

      let valueStringify = JSON.stringify(value);
      //@todo must check value should be json proper.

      console.log("----------.>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", PYMTUtilsCC, PYMTUtilsCCWriteState, valueStringify, key, channelName)
      const chaincodeResponse = await this.ctx.stub.invokeChaincode(
        PYMTUtilsCC,
        [PYMTUtilsCCWriteState, key, valueStringify],
        channelName
      );

      console.log(
        "line no 176----PYMTutils.js----ReadState--from : ${PYMTUtilsCC} ",
        chaincodeResponse
      );
      if (!chaincodeResponse) {
        let jsonResp = {};
        jsonResp.Error = "Error while reading Tx status for key :" + key;
        throw new Error(JSON.stringify(jsonResp));
      }
      const payload = Buffer.from(
        chaincodeResponse.payload,
        "base64"
      ).toString();
      console.log("line no 189----PYMTutils.js----payload ---------->>>>", payload);
      return payload;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async validateOrganization(ctx, orgMSP) {
    // Check minter authorization - this sample assumes only ORGMSP is the allowed to invoke tx.
    const clientMSPID = this.ctx.clientIdentity.getMSPID();
    console.log("Received MSP :" + clientMSPID);
    if (clientMSPID !== orgMSP) {
      throw new Error(
        "client is not authorized to perform this tx, clientMSP  :" +
        clientMSPID +
        "expected : " +
        orgMSP
      );
      return false;
    }
    return true;
  }

  // async getChannelForOrgWithoutAgg(ctx, callingOrgMSP) {
  //   let channelId = await ctx.stub.getChannelID();
  //   console.log(" ChannelID for ", callingOrgMSP, ":", channelId);

  //   if (!channelId || channelId.length == 0) {
  //     throw new Error("fatal error: No channel found for " + callingOrgMSP);
  //   }
  //   return channelId;
  // }

  async getChannelIdentity(ctx) {
    let channelId = await ctx.stub.getChannelID();
    console.log(" ChannelID for ", ":", channelId);

    if (!channelId || channelId.length == 0) {
      throw new Error("fatal error: No channel found");
    }
    return channelId;

    // let orgchannelinfo = {
    //   Org1: "channel3",
    //   Org2: "channel4",
    //   Org3: "channel3",
    //   Org4: "channel4"
    // };
    // let isvalueexist = Object.keys(orgchannelinfo).find(
    //   (key) => key === callingOrgMSP
    // );
    // if (isvalueexist) {
    //  return orgchannelinfo[callingOrgMSP];
    // } else
    //   throw new Error("fatal error: No channel found for " + callingOrgMSP);
  }

  async getMerchantMetadata(ctx, OrgMSPId) {
    // TODO: define and remove hardcoded values
    var map = new Map();
    map.set("M1", {
      merhcantName: "m101",
      location: "pune",
      minTxAmount: "50",
      maxTxAmount: "500",
      MDR: "1.5",
    }); // obj1(M1 profile) will have tx details like min & max transaction amount, merchant name
    map.set("m2", {
      merhcantName: "m201",
      location: "delhi",
      minTxAmount: "100",
      maxTxAmount: "5000",
      MDR: "2.5",
    });
    // map.set("Org5", "channel5");

    return map.get(OrgMSPId);
  }

  // async getBnplHolderMetadata(ctx, customerId) {
  //   // TODO: define and remove hardcoded values
  //   var map = new Map();
  //   map.set("C101", {
  //     customerName: "John Doe",
  //     billingCity: "pune",
  //     accountNumber: "XXXXX101",
  //   }); // obj1(M1 profile) will have tx details like min & max transaction amount, merchant name
  //   map.set("C201", {
  //     customerName: "Mary Smith",
  //     billingCity: "delhi",
  //     accountNumber: "XXXXX201",
  //   });
  //   // map.set("Org5", "channel5");

  //   return map.get(customerId);
  // }
}

module.exports = PYMTUtils;
