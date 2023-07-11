"use strict";

const { Contract } = require("fabric-contract-api");
const pv_CollectionName = "PvOBMerchantSummary";
//const sortKeysRecursive = require("sort-keys-recursive");
const stringify = require("json-stringify-deterministic");
const APMSPID = "APMSP";

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
  if (ClientMSPID !== APMSPID) {
    throw new Error(`Client from org ${ClientMSPID} is not authorized ..`);
  }
}

class MerchantOnboardingPDC extends Contract {
 
 
  async savePvMerchantMetaData(ctx) {
    const transientMap = await ctx.stub.getTransient();
    const pv_IndividualCollectionName= "PvMerchantAPInfo"
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
//moving validation check of merchantaccountnumber to edi pdc
   
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
    console.log("at line 78");
    await verifyClientOrgMatchesPeerOrg(ctx);

    console.log("merchant inputs :", merchantInput);

    const merchant = {
      merchantID: merchantInput.merchantID,
      merchantDescription: merchantInput.merchantDescription,
      merchantType: merchantInput.merchantType,
      bnplProductTypes: merchantInput.bnplProductTypes,
    //10-2-23 moving this into EDI PDC merchantBankCode: merchantInput.merchantBankCode ,
    //10-2-23 This has been removed from onboarding FE merchantAccountType: merchantInput.merchantAccountType 
      txcMaxTxPerDay: merchantInput.txcMaxTxPerDay,
      txcMinTxAmount: merchantInput.txcMinTxAmount,
      txcMaxTxAmount: merchantInput.txcMaxTxAmount,
      txcTxCurrency: merchantInput.txcTxCurrency,
      aggName: merchantInput.aggName,
      aggID: merchantInput.aggID,
      clrOrgName: merchantInput.clrOrgName ,
      clrOrgID: merchantInput.clrOrgID ,
      isContractSigned: merchantInput.isContractSigned,
      merchantName: merchantInput.merchantName ,
      //02-03-23 moving txcNegotiatedMDR to cacct pdc
      //02-03-23 moving merchantAccountNumber to EDI PDC
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

  async retrievePvMerchantMetaData(ctx, merchantID) {
    await verifyClientOrgMatchesPeerOrg(ctx);
    const pv_IndividualCollectionName= "PvMerchantAPInfo"
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

    await verifyClientOrgMatchesPeerOrg(ctx);
    const pv_IndividualCollectionName= "PvMerchantAPInfo"
    const merchantJSON = await ctx.stub.getPrivateData(
      pv_IndividualCollectionName,
      merchantID
    );
    const merchant = merchantJSON.toString();
    
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

    //moving txcNegotiatedMDR validation to CaAcct pdc
    
 //02-03-23 moved PromoCode validation from cacct to common pdc
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