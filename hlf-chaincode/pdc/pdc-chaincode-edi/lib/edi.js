//TODO what will be the key- merchandID
// TODO IN all function should check invoke by only by ap org

"use strict";

const { Contract } = require("fabric-contract-api");
const pv_CollectionName = "PvClearingInfo";
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

class MerchantPDC extends Contract {
  
  async savePvMerchantMetaData(ctx) {
    const transientMap = await ctx.stub.getTransient();

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

    // Check if merchant already exists
    const merchantAsBytes = await ctx.stub.getPrivateData(
      pv_CollectionName,
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
      clearedAmount: merchantInput.clearedAmount,
      balanceAmount: merchantInput.balanceAmount,
      refNegotiatedMDR:merchantInput.refNegotiatedMDR,
      merchantFees: merchantInput.merchantFees,
      issuerProcessor: merchantInput.issuerProcessor,
      networkFees: merchantInput.networkFees,
      creditCost: merchantInput.creditCost,
      funding:merchantInput.funding,
      customerName: merchantInput.customerName || "",
    };

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
      throw Error("Failed to put merchant into private data collecton.");
    }
  }

  async retrievePvMerchantMetaData(ctx, merchantID) {
    // @to-verify who is allow to retrieve the private details of merchant

    await verifyClientOrgMatchesPeerOrg(ctx);

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

  async checkPvMerchantMetaData(ctx, merchantID) {
    const merchantJSON = await ctx.stub.getPrivateData(
      pv_CollectionName,
      merchantID
    );
    const merchant = merchantJSON.toString();
    // todo check merchantjson
    return merchant ? true : false;
  }

  
}
module.exports = MerchantPDC;
