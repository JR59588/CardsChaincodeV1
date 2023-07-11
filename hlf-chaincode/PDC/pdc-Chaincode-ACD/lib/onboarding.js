"use strict";

const { Contract } = require("fabric-contract-api");
const stringify = require("json-stringify-deterministic");
const pv_CollectionName = "Main";
const ACDMSPID = "ACDMSP";

async function verifyClientOrgMatchesPeerOrg(ctx) {

  console.log(" inside verifyClientOrgMatchesPeerOrg ");

  const ClientMSPID = await ctx.clientIdentity.getMSPID();

  console.log("clientmsp", ClientMSPID);

  if (!ClientMSPID && ClientMSPID === "") {
    console.log("clientmsp", ClientMSPID);
    throw new Error("Failed getting the client's MSPID.");
  }
  
  if (ClientMSPID !== ACDMSPID) {
    throw new Error(`Client from org ${ClientMSPID} is not authorized ..`);
  }
}

class MerchantOnboardingPDC extends Contract {

  async savePvACDMetaData(ctx) {

    const transientMap = await ctx.stub.getTransient();

    const pv_IndividualCollectionName= "PDC2"

    // Asset properties are private, therefore they get passed in transient field, instead of func args
    const transientAssetJSON = transientMap.get("merchant_properties");

    if (!transientAssetJSON) {
      throw new Error("The merchant was not found in the transient map input.");
    }

    let merchantInput = JSON.parse(transientAssetJSON);

    if (!merchantInput.merchantID && merchantInput.merchantID === "") {
      throw new Error(
        "merchantID field is required, it must be a non-empty string"
      );
    }

    if (!merchantInput.promoCode && merchantInput.promoCode === "") {
      throw new Error(
        "promoCode field is required, it must be a non-empty string"
      );
    }

    if (!merchantInput.kycStatus && merchantInput.kycStatus === "") {
      throw new Error(
        "KYC Status field is required, it must be a non-empty string"
      );
    }

    if (!merchantInput.securityDeposits && merchantInput.securityDeposits === "") {
      throw new Error(
        "Security Deposits field is required, it must be a non-empty string"
      );
    }

    if (!merchantInput.isContractSigned && merchantInput.isContractSigned === "No") {
      throw new Error(
        "Is Contract Signed field is No please provide valide input."
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
    console.log("merchantAsBytes");

    await verifyClientOrgMatchesPeerOrg(ctx);

    console.log("merchant inputs :", merchantInput);

    const merchant = {
      merchantID: merchantInput.merchantID,
      merchantBankCode: merchantInput.merchantBankCode ,
      merchantAccountNumber: merchantInput.merchantAccountNumber,
      securityDeposits: merchantInput.securityDeposits,

    };
    console.log(
      `CreateAsset Put: collection ${pv_IndividualCollectionName}, ID ${merchantInput.merchantID} , merchant ${merchant}`
    );
    
    try {
      await ctx.stub.putPrivateData(
        pv_IndividualCollectionName,
        merchantInput.merchantID,
        Buffer.from(stringify(merchant))
      );
    } 
    catch (error) {
      throw Error("Failed to put merchant into private data collecton.");
    }
  }
  //savePvACDMetaData

  async saveOBMerchantSummary(ctx) {

    const transientMap = await ctx.stub.getTransient();

    console.log("transientMap", transientMap);

    const transientAssetJSON = transientMap.get("merchant_properties");

    if (!transientAssetJSON) {
      throw new Error(
        "The merchant info was not found in the transient map input."
      );
    }

    let merchantInput = JSON.parse(transientAssetJSON);
 
    console.log("merchantInput", merchantInput);

    if (!merchantInput.merchantID && merchantInput.merchantID === "") {
      throw new Error(
        "merchantID field is required, it must be a non-empty string"
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
   
    console.log("merchant inputs :", merchantInput);

    const merchant = {
      merchantID: merchantInput.merchantID,
      merchantName: merchantInput.merchantName,
      merchantDescription: merchantInput.merchantDescription,
      merchantCategoryCode: merchantInput.merchantCategoryCode,
      transactionGeographiesAllowed: merchantInput.transactionGeographiesAllowed,
      isContractSigned: merchantInput.isContractSigned,
      kycStatus: merchantInput.kycStatus,

       };

    console.log("merchant", merchant);
   
    console.log(
      `CreateAsset Put: collection ${pv_CollectionName}, ID ${merchantInput.merchantID} , merchant ${merchant}`
    );

    try {
      await ctx.stub.putPrivateData(
        pv_CollectionName,
        merchantInput.merchantID,
        Buffer.from(stringify(merchant))
      );
    } 
    catch (error) {
      console.log("Failed to put merchant into private data collecton", error);
      throw Error("Failed to put merchant into private data collecton.");
    }
  } 
  //End of saveOBMerchantSummary

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
  // retrieveOBMerchantData


  async retrievePvACDMetaData(ctx, merchantID) {

      const pv_IndividualCollectionName= "PDC2"

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
  //retrievePvACDMetaData

}
module.exports = MerchantOnboardingPDC;
