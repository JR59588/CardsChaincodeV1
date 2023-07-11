"use strict";

const { Contract } = require("fabric-contract-api");
const pv_CollectionName = "PvOBMerchantSummary";
//const sortKeysRecursive = require("sort-keys-recursive");
const stringify = require("json-stringify-deterministic");
const CAcctMSPID = "CAcctMSP";
const pv_IndividualCollectionName = "PvCustomerCAcctInfo";

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
  if (ClientMSPID !== CAcctMSPID) {
    throw new Error(`Client from org ${ClientMSPID} is not authorized ..`);
  }
}

class MerchantOnboardingPDC extends Contract {
  
  async savePvCustomerMetaData(ctx) {
    await verifyClientOrgMatchesPeerOrg(ctx);
    const transientMap = await ctx.stub.getTransient();
    // Asset properties are private, therefore they get passed in transient field, instead of func args
    const transientAssetJSON = transientMap.get("customer_properties");
    if (!transientAssetJSON) {
      throw new Error("The customer was not found in the transient map input.");
    }

    let customerInput = JSON.parse(transientAssetJSON);
    // inputs validation

    if (!customerInput.customerID && customerInput.customerID === "") {
      throw new Error(
        "customerID field is required, it must be a non-empty string"
      );
    }
// 02-03-23 moved txcNegotiatedMDR from ap to cacct pdc
    if (
      !customerInput.txcNegotiatedMDR && customerInput.txcNegotiatedMDR === "" ) {
      throw new Error(
        "txcNegotiatedMDR field is required, it must be a non-empty string"
      );
    }


     //10-02-23 Added PromoCode check
    // if (!customerInput.promoCode && customerInput.promoCode === "") {
    //   throw new Error(
    //     "promoCode field is required, it must be a non-empty string"
    //   );
    // }

    // if (!customerInput.promoCode.startsWith("PROMO")) {
    //   throw new Error(
    //     "promoCode invalid (Try something like PROMO-XXX-YYY)"
    //   );
    // }

    // Check if customer already exists
    const customerAsBytes = await ctx.stub.getPrivateData(
      pv_IndividualCollectionName,
      customerInput.customerID
    );
    if (customerAsBytes != "") {
      throw new Error(
        `This customer (${customerInput.customerID}) already exists`
      );
    }

    const customer = {
      customerID: customerInput.customerID,
      merchantID: customerInput.merchantID,
      loanAccountNumber: customerInput.loanAccountNumber,
      loanExpiryDate: customerInput.loanExpiryDate,
      maxLoanAmount: customerInput.maxLoanAmount,
      currentOutstandingAmount: customerInput.currentOutstandingAmount,
      totalDisbursedAmount: customerInput.totalDisbursedAmount,
      isDefaulter: customerInput.isDefaulter,
      customerName: customerInput.customerName,
      //02-03-23 moved txcNegotiatedMDR from ap pdc to cacct 
      txcNegotiatedMDR: customerInput.txcNegotiatedMDR,
      //02-03-23 moving PromoCode from cacct to common pdc
     
    };
    // Save customer to private data collection

    console.log(
      `CreateAsset Put: collection ${pv_IndividualCollectionName}, ID ${customerInput.customerID} , customer ${customer}`
    );
    try {
      await ctx.stub.putPrivateData(
        pv_IndividualCollectionName,
        customerInput.customerID,
        Buffer.from(stringify(customer))
      );
    } catch (error) {
      throw Error("Failed to put customer into private data collecton.");
    }
  }

  async retrievePvCustomerMetaData(ctx, customerID) {
    await verifyClientOrgMatchesPeerOrg(ctx);
    const customerJSON = await ctx.stub.getPrivateData(
      pv_IndividualCollectionName,
      customerID
    );
    const customer = customerJSON.toString();

    //No Asset found, return empty response
    if (!customer) {
      throw new Error(
        `${customerID} does not exist in collection ${pv_IndividualCollectionName}.`
      );
    }

    return customer;
  }

  async saveOBMerchantSummary(ctx) {
    console.log("at line 38");
    const transientMap = await ctx.stub.getTransient();

    // Asset properties are private, therefore they get passed in transient field, instead of func args
    const transientAssetJSON = transientMap.get("merchant_properties");
    console.log("at line 43", transientAssetJSON);
    if (!transientAssetJSON) {
      throw new Error(
        "The merchant info was not found in the transient map input."
      );
    }

    let merchantInput = JSON.parse(transientAssetJSON);
    // inputs validation
    console.log("at line 50", merchantInput);
    if (!merchantInput.merchantID && merchantInput.merchantID === "") {
      throw new Error(
        "merchantID field is required, it must be a non-empty string"
      );
    }
    if (
      !merchantInput.locationsAllowed && merchantInput.locationsAllowed === ""
    ) {
      throw new Error(
        "locationsAllowed field is required, it must be a non-empty string"
      );
    }
    if (!merchantInput.clrOrgID && merchantInput.clrOrgID === "") {
      throw new Error(
        "clrOrgID field is required, it must be a non-empty string"
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
    console.log("at line 69", merchantAsBytes);
    if (merchantAsBytes != "") {
      throw new Error(
        `This merchant (${merchantInput.merchantID}) already exists`
      );
    }
    console.log("at line 75");

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
    console.log("at line 90", merchant);
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