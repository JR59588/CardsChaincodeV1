//TODO what will be the key- merchandID
// TODO IN all function should check invoke by only by ap org
"use strict";

const { Contract } = require("fabric-contract-api");
const pv_CollectionName = "PvCustomerInfo";
//const sortKeysRecursive = require("sort-keys-recursive");
const stringify = require("json-stringify-deterministic");
const CAcctMSPID = "CAcctMSP";

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

class CustomerPDC extends Contract {

  async savePvCustomerMetaData(ctx) {
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

    // Check if customer already exists
    const customerAsBytes = await ctx.stub.getPrivateData(
      pv_CollectionName,
      customerInput.customerID
    );
    if (customerAsBytes != "") {
      throw new Error(
        `This customer (${customerInput.customerID}) already exists`
      );
    }

    await verifyClientOrgMatchesPeerOrg(ctx);

    const customer = {
      customerID: customerInput.customerID,
      merchantID: customerInput.merchantID,
      loanAccountNumber: customerInput.loanAccountNumber,
      loanExpiryDate: customerInput.loanExpiryDate,
      maxLoanAmount: customerInput.maxLoanAmount,
      currentOutstandingAmount: customerInput.currentOutstandingAmount,
      totalDisbursedAmount: customerInput.totalDisbursedAmount,
      isDefaulter: customerInput.isDefaulter,
      customerName: customerInput.customerName || "",
    };
    // Save customer to private data collection

    console.log(
      `CreateAsset Put: collection ${pv_CollectionName}, ID ${customerInput.customerID} , customer ${customer}`
    );
    try {
      await ctx.stub.putPrivateData(
        pv_CollectionName,
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
      pv_CollectionName,
      customerID
    );
    const customer = customerJSON.toString();

    //No Asset found, return empty response
    if (!customer) {
      throw new Error(
        `${customerID} does not exist in collection ${pv_CollectionName}.`
      );
    }

    return customer;
  }

  
}
module.exports = CustomerPDC;
