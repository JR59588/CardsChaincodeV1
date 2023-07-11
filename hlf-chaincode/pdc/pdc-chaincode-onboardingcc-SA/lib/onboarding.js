"use strict";

const { Contract } = require("fabric-contract-api");
const pv_CollectionName = "PvOBMerchantSummary";
//const sortKeysRecursive = require("sort-keys-recursive");
const stringify = require("json-stringify-deterministic");
const SAOrgMSPID = "SAOrgMSP";

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
  if (ClientMSPID !== SAOrgMSPID) {
    throw new Error(`Client from org ${ClientMSPID} is not authorized ..`);
  }
}

class MerchantOnboardingPDC extends Contract {
  async saveOBMerchantSummary(ctx) {
    const transientMap = await ctx.stub.getTransient();
    console.log("at line 37", transientMap);
    // Asset properties are private, therefore they get passed in transient field, instead of func args
    const transientAssetJSON = transientMap.get("merchant_properties");
    if (!transientAssetJSON) {
      throw new Error(
        "The merchant info was not found in the transient map input."
      );
    }

    let merchantInput = JSON.parse(transientAssetJSON);
    // inputs validation
    console.log("at line 48", merchantInput);
    if (!merchantInput.merchantID && merchantInput.merchantID === "") {
      throw new Error(
        "merchantID field is required, it must be a non-empty string"
      );
    }
    if (!merchantInput.merchantType && merchantInput.merchantType === "") {
      throw new Error(
        "merchantType field is required, it must be a non-empty string"
      );
    }
    if (
      !merchantInput.bnplProductTypes && merchantInput.bnplProductTypes === "") {
      throw new Error(
        "bnplProductTypes field is required, it must be a non-empty string"
      );
    }

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
    console.log("at line 67", merchantAsBytes);
    if (merchantAsBytes != "") {
      throw new Error(
        `This merchant (${merchantInput.merchantID}) already exists`
      );
    }
    console.log("at line 73");

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
    console.log("at line 86", merchant);
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
