// const SAChaincodeName = "SAvalidationcc"; 
// const APChaincodeName = "APvalidationcc";
const PYMTTxPreSettlementCC = "PYMTTxPreSettlementCC";
const acceptSettlementTxFN = "acceptSettlementTx";
const validateSettlementTxFN = "validateSettlementTx";
const processSettlementTxFn = "processSettlementTX";
const readSettlementTxFn = "readState";
const PYMTUtilsCC = "PYMTUtilsCC";
const APChaincodeName = "APvalidationcc";
const SACCFuncName = "validation";
const APCCFuncName = "validation";
const CHANNEL1 = "channel1";
const APChannelName = "mychannel";

// TODO: this names must correspond to the HLF network configuration
const AGG_ORG_NAME = "AggOrg";
const SA_ORG_NAME = "SAOrg";
const AP_ORG_NAME = "APOrg";
const CACCT_ORG_NAME = "CAcctOrg";
const EDI_ORG_NAME = "EDIOrg";

const TXSTATUS_REQUESTED = "TxRequested";
const TXSTATUS_ACCEPTED = "TxAccepted";
const TXSTATUS_REJECTED = "TxRejected";
const TXSTATUS_VALIDATED = "TxValidated";
const TXSTATUS_NOT_VALIDATED = "TxNotValidated";
const TXSTATUS_SUBMITED = "TxSubmited";
const TXSTATUS_NOT_TOBE_SUBMITED = "TxNotToBeSubmited";
const TXSTATUS_PROCESSED = "TxProcessed";
const TXSTATUS_NOT_PROCESSED = "TxNotProcessed";
const TXSTATUS_CLEARED = "TxCleared";
const TXSTATUS_NOT_CLEARED = "TxNotCleared";
const TXSTATUS_INITIATED = "TxInitiated";





class PYMTUtils {
  constructor (ctx)
  {
    // super();  
      this.ctx = ctx;
  }
//async hello(){
 // console.log("hello");
//}
  async checkNull(merchantId, customerId, loanReferenceNumber) {
    console.log("in checknull:"+ merchantId);
    console.log("in checknull:"+ customerId);
    console.log("in checknull:"+ loanReferenceNumber);
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
    if (!clientId || clientId.length === 0) {
        throw new Error("No MSP id found - please check your configuration and chaincode parameters");
    }
    return clientId;
}

  async makeTxKey(orgMSPID, merchantId, customerId, loanReferenceNumber) {

    // TODO: add checks to make sure parameters are not null, else throw error
    await this.checkNull(merchantId, customerId, loanReferenceNumber);

    let key = orgMSPID + "-" + merchantId + "-" + customerId + "-" + loanReferenceNumber;
    ///// add cross chain invocation for getstate from utilscc....
    
    let txInfo = await this.ctx.stub.getState(key);
    if (txInfo.toString()) {
      throw new Error(
        "This transaction already exists for merchantId : " +
        merchantId +
        " customerId :" +
        customerId +
        "LoanReferenceNumber :" +
        loanReferenceNumber
      );
    }
    return key;
  }

  async readTxStatus(ctx,key,channelName){
    const chaincodeResponse = await this.ctx.stub.invokeChaincode(
      PYMTUtilsCC,
      [readSettlementTxFn, key],
      // SAChannelName
      channelName
  );
  if (!chaincodeResponse) {
    let jsonResp = {};
    jsonResp.Error = "Error while reading Tx status for key :" + key;
    throw new Error(JSON.stringify(jsonResp));
}
const payload = Buffer.from(chaincodeResponse.payload, "base64").toString();
   
    return payload;
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

  async getChannelForOrgWithoutAgg(ctx, callingOrgMSP) {
    // TODO: define and remove hardcoded values
    var map = new Map();
    map.set("Org1", "channel1");
    map.set("Org2", "channel2");
    // map.set("Org5", "channel5");

    return map.get(callingOrgMSP);
  }

  async getChannelForOrgWithAgg(ctx, callingOrgMSP) {
    // TODO: define and remove hardcoded values
    var map = new Map();
    map.set("Org1", "channel3");
    map.set("Org2", "channel4");

    return map.get(callingOrgMSP);
  }

  async getMerchantMetadata(ctx, orgMSPId) {
    // TODO: define and remove hardcoded values
    var map = new Map();
    map.set("M1", { merhcantName: "m101", location: "pune", minTxAmount: "50", maxTxAmount: "500", MDR: "1.5"}); // obj1(M1 profile) will have tx details like min & max transaction amount, merchant name
    map.set("m2", { merhcantName: "m201", location: "delhi", minTxAmount: "100", maxTxAmount: "5000", MDR: "2.5"});
    // map.set("Org5", "channel5");

    return map.get(orgMSPId);
  }

  async getBnplHolderMetadata(ctx, customerId) {
    // TODO: define and remove hardcoded values
    var map = new Map();
    map.set("C101", { customerName: "John Doe", billingCity: "pune", accountNumber: "XXXXX101" }); // obj1(M1 profile) will have tx details like min & max transaction amount, merchant name
    map.set("C201", { customerName: "Mary Smith", billingCity: "delhi", accountNumber: "XXXXX201" });
    // map.set("Org5", "channel5");

    return map.get(customerId);
  }
}

module.exports = PYMTUtils
