"use strict";

const { Contract } = require("fabric-contract-api");
const pv_CollectionName = "PvOBMerchantSummary";
//const sortKeysRecursive = require("sort-keys-recursive");
const stringify = require("json-stringify-deterministic");
const EDIMSPID = "EDIMSP";

async function verifyClientOrgMatchesPeerOrg(ctx) {
  console.log(" inside verifyClientOrgMatchesPeerOrg line 13 ");
  const ClientMSPID = await ctx.clientIdentity.getMSPID();
  console.log("clientmsp", ClientMSPID);
  if (!ClientMSPID && ClientMSPID === "") {
    console.log("clientmsp", ClientMSPID);
    throw new Error("Failed getting the client's MSPID.");
  }

  const peerMSPID = await ctx.stub.getMspID();
  console.log("peerMSPID", peerMSPID);
  if (!peerMSPID && peerMSPID === "") {
    throw new Error("Failed getting the peer's MSPID.");
  }

  if (ClientMSPID !== peerMSPID) {
    throw new Error(
      `Client from org ${ClientMSPID} is not authorized to read or write private data from an org ${peerMSPID} peer.`
    );
  }
  if (ClientMSPID !== EDIMSPID) {
    throw new Error(`Client from org ${ClientMSPID} is not authorized ..`);
  }
}

class MerchantOnboardingPDC extends Contract {
 
  async savePvClearingInfo(ctx) {
    const transientMap = await ctx.stub.getTransient();
    const pv_IndividualCollectionName= "PvClearingInfo"
    // Asset properties are private, therefore they get passed in transient field, instead of func args
    const transientAssetJSON = transientMap.get("merchant_properties");
    if (!transientAssetJSON) {
      throw new Error("The merchant was not found in the transient map input.");
    }

    let merchantInput = JSON.parse(transientAssetJSON);
    // inputs validation

    if (!merchantInput.merchantID && merchantInput.merchantID === "") {
      throw new Error(
        "merchantID field is required, it must be a non-empty string"
      );
    }

    //10-02-23 Added check for merchantBankCode 
    if (!merchantInput.merchantBankCode && merchantInput.merchantBankCode === "") {
      throw new Error(
        "merchantBankCode field is required, it must be a non-empty string"
      );
    }

    if (!merchantInput.merchantBankCode.startsWith("B") ) {
      throw new Error(
        "merchantBankCode field is invalid.(Try Something Like BXXXXXX)"
      );
    }
//02-03-23 moved merchantaccountnumber check from ap to edi pdc
   // 10-02-23 Adding  a check to simulate a failure
   if (!merchantInput.merchantAccountNumber && merchantInput.merchantAccountNumber === "" ) {
    throw new Error(
      "merchantAccountNumber field is required, it must be a non-empty string"
    );
  }

  // 10-02-23 Adding  a check to simulate a failure
  if ((merchantInput.merchantAccountNumber).startsWith("XYZ")) {
    throw new Error(
      "merchantAccountNumber field is not valid."
    );
  }

    // Check if merchant already exists
    const merchantAsBytes = await ctx.stub.getPrivateData(
      pv_IndividualCollectionName,
      merchantInput.merchantID
    );
    if (merchantAsBytes != "") {
      throw new Error(
        `This merchant (${merchantInput.merchantID}) already exists`
      );
    }
    console.log("at line 65");
    await verifyClientOrgMatchesPeerOrg(ctx);

    console.log("merchant inputs :", merchantInput);

    const merchant = {
      customerID: merchantInput.customerID,
      merchantID: merchantInput.merchantID,
      txID: merchantInput.txID,
      loanAccountNumber: merchantInput.loanAccountNumber,
      //10-02-23 moved merchantBankCode from AP to EDI
      merchantBankCode: merchantInput.merchantBankCode ,
      clearedAmount: merchantInput.clearedAmount,
      balanceAmount: merchantInput.balanceAmount,
      refNegotiatedMDR:merchantInput.refNegotiatedMDR,
      merchantFees: merchantInput.merchantFees,
      issuerProcessor: merchantInput.issuerProcessor,
      networkFees: merchantInput.networkFees,
      creditCost: merchantInput.creditCost,
      funding:merchantInput.funding,
      customerName: merchantInput.customerName ,
      //02-03-23 moved merchantAccountNumber from ap to edi pdc
      merchantAccountNumber: merchantInput.merchantAccountNumber,
      //03-03-23 added clrorgname in edi 
      clrOrgName: merchantInput.clrOrgName 
    };

    // Save merchant to private data collection
    //let key = merchantInput.merchantID ;
    console.log(
      `CreateAsset Put: collection ${pv_IndividualCollectionName}, ID ${merchantInput.merchantID} , merchant ${merchant}`
    );
    try {
      await ctx.stub.putPrivateData(
        pv_IndividualCollectionName,
        merchantInput.merchantID,
        Buffer.from(stringify(merchant))
      );
    } catch (error) {
      throw Error("Failed to put merchant into private data collecton.");
    }
  }

  async retrievePvEDIMerchantMetaData(ctx, merchantID) {
    // @to-verify who is allow to retrieve the private details of merchant
    const pv_IndividualCollectionName= "PvClearingInfo"
    await verifyClientOrgMatchesPeerOrg(ctx);

    const merchantJSON = await ctx.stub.getPrivateData(
      pv_IndividualCollectionName,
      merchantID
    );
    const merchant = merchantJSON.toString();

    //No Asset found, return empty response
    if (!merchant) {
      throw new Error(
        `${merchantID} does not exist in collection ${pv_IndividualCollectionName}.`
      );
    }

    return merchant;
  }

  async checkPvMerchantMetaData(ctx, merchantID) {
    const pv_IndividualCollectionName= "PvClearingInfo"
    await verifyClientOrgMatchesPeerOrg(ctx);

    const merchantJSON = await ctx.stub.getPrivateData(
      pv_IndividualCollectionName,
      merchantID
    );
    const merchant = merchantJSON.toString();
    // todo check merchantjson
    return merchant ? true : false;
  }

  async saveOBMerchantSummary(ctx) {
    const transientMap = await ctx.stub.getTransient();
    console.log("line 42", transientMap);
    // Asset properties are private, therefore they get passed in transient field, instead of func args
    const transientAssetJSON = transientMap.get("merchant_properties");
    if (!transientAssetJSON) {
      throw new Error(
        "The merchant info was not found in the transient map input."
      );
    }

    let merchantInput = JSON.parse(transientAssetJSON);
    // inputs validation
    console.log("line 51", merchantInput);
    if (!merchantInput.merchantID && merchantInput.merchantID === "") {
      throw new Error(
        "merchantID field is required, it must be a non-empty string"
      );
    }
    // 10-02-23 No need to valide for isContractSigned
    // if (
    //   !merchantInput.isContractSigned && merchantInput.isContractSigned === "" ) {
    //   throw new Error(
    //     "isContractSigned field is required, it must be a non-empty string"
    //   );
    // }
   
 //02-03-23 moved PromoCode from cacct to common pdc
    if (!merchantInput.promoCode && merchantInput.promoCode === "") {
      throw new Error(
        "promoCode field is required, it must be a non-empty string"
      );
    }

    if (!merchantInput.promoCode.startsWith("PROMO")) {
      throw new Error(
        "promoCode invalid (Try something like PROMO-XXX-YYY)"
      );
    }

    const merchantAsBytes = await ctx.stub.getPrivateData(
      pv_CollectionName,
      merchantInput.merchantID
    );
    console.log("merchantAsBytes", merchantAsBytes);
    if (merchantAsBytes != "") {
      throw new Error(
        `This merchant (${merchantInput.merchantID}) already exists`
      );
    }
    console.log("at line 78");

    console.log("merchant inputs :", merchantInput);

    const merchant = {
      merchantID: merchantInput.merchantID,
      merchantName: merchantInput.merchantName,
      merchantDescription: merchantInput.merchantDescription,
      merchantType: merchantInput.merchantType,
      bnplProductTypes: merchantInput.bnplProductTypes,
      isContractSigned: merchantInput.isContractSigned,
      clrOrgID: merchantInput.clrOrgID,
      locationsAllowed: merchantInput.locationsAllowed,
      //02-03-23 moved PromoCode from cacct to common pdc
      promoCode: merchantInput.promoCode
    };
    console.log("line 91", merchant);
    // Save merchant to private data collection
    //let key = merchantInput.merchantID ;
    console.log(
      `CreateAsset Put: collection ${pv_CollectionName}, ID ${merchantInput.merchantID} , merchant ${merchant}`
    );
    try {
      await ctx.stub.putPrivateData(
        pv_CollectionName,
        merchantInput.merchantID,
        Buffer.from(stringify(merchant))
      );
    } catch (error) {
      console.log("Failed to put merchant into private data collecton", error);
      throw Error("Failed to put merchant into private data collecton.");
    }

    //return merchant id
  } //End of saveOBMerchantSummary

  async retrieveOBMerchantData(ctx, merchantID) {
    const merchantJSON = await ctx.stub.getPrivateData(
        pv_CollectionName,
        merchantID
      );
      const merchant = merchantJSON.toString();
  
      //No Asset found, return empty response
      if (!merchant) {
        throw new Error(
          `${merchantID} does not exist in collection ${pv_CollectionName}.`
        );
      }
       return merchant;
    }
}
module.exports = MerchantOnboardingPDC;