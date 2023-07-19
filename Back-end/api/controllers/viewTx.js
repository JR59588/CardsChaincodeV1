const jwt = require("jsonwebtoken");
var logger = require("../../logger");
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
const UNAUTHORIZED = "Not Authorized"

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

const verifyToken = (req, res) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.secret);

    return decoded;
  } catch (err) {
    return res.status(401).send("A valid token is required for authentication");
  }
};




exports.GetTxByRange = async function (req, res) {
  const contractName = "PYMTUtilsCC";
  try {
    let org = req.params.roleId;
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
    const startKey = "";
    const endKey = "";
    const result = await contract.evaluateTransaction(
      "GetTxByRange",
      startKey,
      endKey
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: JSON.parse(result.toString()) });

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error });
  }
};


exports.retrieveOBMerchantData = async function (req, res) {

  console.log("retrieveOBMerchantData ");

  const channelName = "channel1";
  const contractName = "onboardingMerchantC";

  try {
    let org = req.params.roleId;
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

    // Submit the specified transaction.
    //ctx is
    //const ClientMSPID = await ctx.clientIdentity.getMSPID();
    const merchantID = req.params.merchantID;
    
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
   
    const result = await contract.evaluateTransaction(
      "retrieveOBMerchantData",
      merchantID
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: JSON.parse(result.toString()) });
    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);

    return res.status(401).json({
      success: false,
      message: "Error" + error,
    });
  }
};

exports.retrievePvAADMetaData = async function (req, res) {

  console.log("retrievePvAADMetaData");

  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  try {
    let org = req.params.roleId;
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
    const merchantID = req.params.merchantID;
    
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
   
    const result = await contract.evaluateTransaction(
      "retrievePvAADMetaData",
      merchantID
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: JSON.parse(result.toString()) });
    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);

    return res.status(401).json({
      success: false,
      message: "Error" + error,
    });
  }
};


exports.retrievePvAODMetaData = async function (req, res) {

  console.log("retrievePvAODMetaData");
  try {
    let org = req.params.roleId;
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
    const merchantID = req.body.merchantID;
    
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    const result = await contract.evaluateTransaction(
      "retrievePvAODMetaData",
      merchantID
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: result.toString() });

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(401).json({
      success: false,
      message: "Error" + error,
    });
  }
};

exports.retrievePvAADAODMetaData = async function (req, res) {

  console.log("retrievePvAADAODMetaData");
  try {
    let org = req.params.roleId;
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
    const merchantID = req.body.merchantID;
    
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    const result = await contract.evaluateTransaction(
      "retrievePvAADAODMetaData",
      merchantID
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: result.toString() });

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(401).json({
      success: false,
      message: "Error" + error,
    });
  }
};

exports.lookUpMerchantMetaData = async function (req, res) {
  console.log("lookUpMerchantMetaData ");

  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  try {
    let org = req.params.roleId;

    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantID = req.params.merchantID;

    console.log(" merchantID", merchantID);

    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
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

    //console.log("---COMMON DATA---");
    let defaultValueOBMerchant = {
      "merchantID": UNAUTHORIZED,
      "merchantName": UNAUTHORIZED,
      "merchantDescription": UNAUTHORIZED,
      "merchantCategoryCode": UNAUTHORIZED,
      "transactionGeographiesAllowed": UNAUTHORIZED,
      "kycStatus": UNAUTHORIZED,
      "isContractSigned": UNAUTHORIZED,
    }
    let defaultValueAODPDC = {
      "product": UNAUTHORIZED,
      "numberOfPOSTerminalsRequired": UNAUTHORIZED,
      "POSID": UNAUTHORIZED,
    }

    let defaultValueAADAODPDC = {
      "txcNegotiatedMDR": UNAUTHORIZED,
      "txcMaxTxPerDay": UNAUTHORIZED,
      "txcMinTxAmount": UNAUTHORIZED,
      "txcMaxTxAmount": UNAUTHORIZED,
      "txcTxCurrency": UNAUTHORIZED,
      "promoCode": UNAUTHORIZED,
    }
    
    let defaultValueAADPDC = {
      "merchantBankCode": UNAUTHORIZED,
      "merchantAccountNumber": UNAUTHORIZED,
      "securityDeposits": UNAUTHORIZED,
    }

    let retrieveOBMerchantDataResult;
    try {
      retrieveOBMerchantDataResult = await contract.evaluateTransaction(
        "retrieveOBMerchantData",
        merchantID
      );
      console.log("---retrieveOBMerchantDataResult---", JSON.parse(retrieveOBMerchantDataResult));
      //  console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    }
    catch (error) {
      retrieveOBMerchantDataResult = { error: error, pdcUnauthorized: "retrieveOBMerchantData" }
    }
    console.log("---retrieveOBMerchantDataResult---", retrieveOBMerchantDataResult);

    console.log("---retrievePvAODMetaData DATA---");

    let retrievePvAODMetaDataResult;
    try {
      retrievePvAODMetaDataResult = await contract.evaluateTransaction(
        "retrievePvAODMetaData",
        merchantID
      );
      // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      console.log("---retrievePvAODMetaDataResult---", JSON.parse(retrievePvAODMetaDataResult));
    } catch (error) {
      retrievePvAODMetaDataResult = { error: error, pdcUnauthorized: "retrievePvAODMetaData" }
    }
    console.log("---retrievePvAODMetaDataResult---", retrievePvAODMetaDataResult);

    console.log("---retrievePvAADMetaData DATA---");

    let retrievePvAADMetaDataResult;
    try {
      retrievePvAADMetaDataResult = await contract.evaluateTransaction(
        "retrievePvAADMetaData",
         merchantID
        // merchantID
      );
      //  console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      console.log("---retrievePvAADMetaData---", JSON.parse(retrievePvAADMetaDataResult));
    } catch (error) {
      retrievePvAADMetaDataResult = { error: error, pdcUnauthorized: "retrievePvAADMetaData" }
    }
    console.log("---retrievePvAADMetaData---", retrievePvAADMetaDataResult);

    console.log("---retrievePvAADAODMetaData DATA---");

    let retrievePvAADAODMetaDataResult;
    try {
      retrievePvAADAODMetaDataResult = await contract.evaluateTransaction(
        "retrievePvAADAODMetaData",
        merchantID
      );

      console.log("---retrievePvAADAODMetaDataResult---", JSON.parse(retrievePvAADAODMetaDataResult));
    } catch (error) {
      retrievePvAADAODMetaDataResult = { error: error, pdcUnauthorized: "retrievePvAADAODMetaData" }
    }
    console.log("---retrievePvAADAODMetaDataResult---", retrievePvAADAODMetaDataResult);


    retrieveOBMerchantDataResult = retrieveOBMerchantDataResult.error ? defaultValueOBMerchant : JSON.parse(retrieveOBMerchantDataResult)
    retrievePvAODMetaDataResult = retrievePvAODMetaDataResult.error ? defaultValueAODPDC : JSON.parse(retrievePvAODMetaDataResult)
    retrievePvAADMetaDataResult = retrievePvAADMetaDataResult.error ? defaultValueAADPDC : JSON.parse(retrievePvAADMetaDataResult)
    retrievePvAADAODMetaDataResult = retrievePvAADAODMetaDataResult.error ? defaultValueAADAODPDC : JSON.parse(retrievePvAADAODMetaDataResult)

    console.log("retrieveOBMerchantDataResult : ", retrieveOBMerchantDataResult);
    console.log("retrievePvAODMetaDataResult : ", retrievePvAODMetaDataResult);
    console.log("retrievePvAADMetaDataResult : ", retrievePvAADMetaDataResult);
    console.log("retrievePvAADAODMetaDataResult : ", retrievePvAADAODMetaDataResult);

    const mergeObjects1 = mergeObjects(retrieveOBMerchantDataResult, retrievePvAODMetaDataResult)
    const mergeObjects2 = mergeObjects(mergeObjects1, retrievePvAADMetaDataResult)
    const mergeObjects3 = mergeObjects(mergeObjects2, retrievePvAADAODMetaDataResult)

    console.log("mergeObjects1", mergeObjects1);
    console.log("mergeObjects2", mergeObjects2);
    console.log("mergeObjects3", mergeObjects3);

    console.log("retrieveOBMerchantDataResult", retrieveOBMerchantDataResult);
    console.log("retrievePvAODMetaDataResult", retrievePvAODMetaDataResult);
    console.log("retrievePvAADMetaDataResult", retrievePvAADMetaDataResult);
    console.log("retrievePvAADAODMetaDataResult", retrievePvAADAODMetaDataResult);

    return res.status(200).json
      ({
        response: { ...mergeObjects3 }
      });

  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);

    return res.status(401).json({
      success: false,
      message: "Error" + error,
    });
  }
};

function mergeObjects(obj1, obj2) {
  // Create a new object to hold the merged properties  
  const merged = {};
  // Merge properties from the first object 
  for (const prop in obj1) {
    if (obj1.hasOwnProperty(prop)) {
      merged[prop] = obj1[prop];
    }
  }
  // Merge properties from the second object  
  for (const prop in obj2) {
    if (obj2.hasOwnProperty(prop)) {
      // If the property already exists in the merged object and has a non-empty value, skip it    
      if (merged.hasOwnProperty(prop) && merged[prop] != UNAUTHORIZED) {
        continue;
      }
      // Otherwise, add the property to the merged object     
      merged[prop] = obj2[prop];
    }
  }
  // Return the merged object  
  return merged;
}
