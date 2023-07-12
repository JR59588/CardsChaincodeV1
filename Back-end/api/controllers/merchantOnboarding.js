const jwt = require("jsonwebtoken");
//var logger = require("../../logger");
const express = require("express");
const bodyParser = require("body-parser");
const data = require("./data.json");
const app = express();
app.use(bodyParser.json());

// Setting for Hyperledger Fabric
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const channelName = "channel1";
const contractName = "onboardingMerchantC";

function getRandomString(length) {
  var randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}


exports.savePvAADMetaData = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PDC3";
  try {
    let org = "AAD" ;
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    if (!identity) {
      console.log(
        "An identity for the user" +
          data[org].userWallet +
          "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);
    contract.addDiscoveryInterest({
      name: contractName,
      collectionNames: [pv_IndividualCollectionName],
    });

    // Submit the specified transaction.

    const merchantID = req.body.merchantID;
    const txcMaxTxPerDay = req.body.txcMaxTxPerDay;
    const txcMinTxAmount = req.body.txcMinTxAmount;
    const txcMaxTxAmount = req.body.txcMaxTxAmount;
    const txcTxCurrency = req.body.txcTxCurrency;
    const txcNegotiatedMDR= req.body.txcNegotiatedMDR;
    const promoCode= req.body.promoCode;
    
    console.log(JSON.stringify(req.body));
    console.log("line 100 ");

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      txcNegotiatedMDR: txcNegotiatedMDR,
      txcMaxTxPerDay: txcMaxTxPerDay,
      txcMinTxAmount: txcMinTxAmount,
      txcMaxTxAmount: txcMaxTxAmount,
      txcTxCurrency: txcTxCurrency,
      promoCode:promoCode
    };

    console.log(" merchant_properties ",  merchant_properties );

    let statefulTxn = contract.createTransaction("savePvAADMetaData");

    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });

    console.log("tmapData", tmapData);

    const txresult = await statefulTxn.submit();

    console.log("result", JSON.stringify(txresult));

    // Disconnect from the gateway.
    await gateway.disconnect();

    console.log("Transaction has been submitted for AAD");
  } 
  catch (error) {
    console.error(
      `Failed to submit transaction for saving merchant private data in AAD : ${error}`
    );
    throw new Error("Failed, submitting tx for AAD PDC");
  }
};


exports.savePvACDMetaData = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PDC2";
  try {
    let org = "ACD";
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    if (!identity) {
      console.log(
        "An identity for the user" +
          data[org].userWallet +
          "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);
    contract.addDiscoveryInterest({
      name: contractName,
      collectionNames: [pv_IndividualCollectionName],
    });

    // Submit the specified transaction.

    const merchantID = req.body.merchantID;
    const merchantBankCode = req.body.merchantBankCode;
    const merchantAccountNumber = req.body.merchantAccountNumber;
    const securityDeposits = req.body.securityDeposits;

    console.log(JSON.stringify(req.body));

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      merchantBankCode: merchantBankCode ,
      merchantAccountNumber:merchantAccountNumber,
      securityDeposits: securityDeposits,
  };

    console.log("merchant_properties ", merchant_properties);

    let statefulTxn = contract.createTransaction("savePvACDMetaData");

    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });

    console.log("tmapData", tmapData);

    result = await statefulTxn.submit();

    console.log("result", result.toString());

    // Disconnect from the gateway.
    await gateway.disconnect();
  
    console.log("Transaction has been submitted For ACD");
  } 
  catch (error) {
    console.log(`Failed to submit transaction for saving merchant private data in ACD : ${error}`)
    console.error(
      `Failed to submit transaction for saving merchant private data in ACD : ${error}`
    );
    throw new Error("Failed, submitting tx for ACD PDC");
  }
};


exports.savePvAODMetaData= async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PDC1";
  try {
    let org = "AOD";
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    if (!identity) {
      console.log(
        "An identity for the user" +
          data[org].userWallet +
          "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);
    contract.addDiscoveryInterest({
      name: contractName,
      collectionNames: [pv_IndividualCollectionName],
    });

    // Submit the specified transaction
    const merchantID = req.body.merchantID;
    const product =req.body.product ;
    const numberOfPOSTerminalsRequired= req.body.numberOfPOSTerminalsRequired;
    const POSID= req.body.POSID;

    console.log(JSON.stringify(req.body));
   

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      product: product,
      numberOfPOSTerminalsRequired: numberOfPOSTerminalsRequired,
      POSID: POSID,
     };

    console.log(" merchant_properties ",  merchant_properties);

    let statefulTxn = contract.createTransaction("savePvAODMetaData");

    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });

    console.log("tmapData", tmapData);

    const txresult = await statefulTxn.submit();

    console.log(" result", JSON.stringify(txresult));

    // Disconnect from the gateway.
    await gateway.disconnect();
    
    console.log("Transaction has been submitted for AOD");
  } catch (error) {
    console.error(
      `Failed to submit transaction for saving merchant private data in AOD : ${error}`
    );
    throw new Error("Failed, submitting tx for AOD PDC");
  }
};


exports.saveOBMerchantSummary = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_CollectionName = "Main";

  try {
    let org = req.body.roleId;
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    if (!identity) {
      console.log(
        "An identity for the user" +
          data[org].userWallet +
          "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);
    contract.addDiscoveryInterest({
      name: contractName,
      collectionNames: [pv_CollectionName],
    });

    // Submit the specified transaction.

    const merchantID = req.body.merchantID;
    const merchantName = req.body.merchantName;
    const merchantDescription = req.body.merchantDescription;
    const merchantCategoryCode = req.body.merchantCategoryCode;
    const transactionGeographiesAllowed = req.body.transactionGeographiesAllowed;
    const kycStatus = req.body.kycStatus;
    const isContractSigned = req.body.isContractSigned;
  
    console.log(JSON.stringify(req.body));
    
    let result;
    let merchant_properties = {
      merchantID: merchantID,
      merchantName: merchantName,
      merchantDescription: merchantDescription,
      merchantCategoryCode: merchantCategoryCode,
      transactionGeographiesAllowed: transactionGeographiesAllowed,
      kycStatus: kycStatus,
      isContractSigned: isContractSigned,
    };

    console.log("merchant_properties ",merchant_properties);

    let statefulTxn = contract.createTransaction("saveOBMerchantSummary");

    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });

    console.log("tmapData", tmapData);

    result = await statefulTxn.submit();

    console.log(" result", result.toString());

    // Disconnect from the gateway.
    await gateway.disconnect();

    console.log("Transaction has been submitted line 140");

    await module.exports.savePvAADMetaData(req, res);
    await module.exports.savePvACDMetaData(req, res);
    await module.exports.savePvAODMetaData(req, res);

    res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });
  } catch (error) {
    console.log(`Failed to submit transaction: ${error}`);
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(401).json({
      success: false,
      message: "Error" + error,
    });
  }
};



          