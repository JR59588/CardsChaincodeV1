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


exports.retrievePvMerchantMetaData = async function (req, res) {
  console.log("line 53 ");
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
    // const CustomerID = req.body.CustomerID;
    // const LoanReferenceNumber = req.body.LoanReferenceNumber;
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    // if (ClientMSPID !== APMSPID) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Sorry,you are not authorized to view this data.Please contact the Network Administrator.",
    //   });
    // }
    const result = await contract.evaluateTransaction(
      "retrievePvMerchantMetaData",
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
  console.log("line 183 ");
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
    // const CustomerID = req.body.CustomerID;
    // const LoanReferenceNumber = req.body.LoanReferenceNumber;
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    // if (ClientMSPID !== APMSPID) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Sorry,you are not authorized to view this data.Please contact the Network Administrator.",
    //   });
    // }
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


exports.retrievePvCustomerMetaData = async function (req, res) {
  console.log("line 56 ");
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
    //const merchantID = req.body.merchantID;
    const customerID = req.params.customerID;
    // const LoanReferenceNumber = req.body.LoanReferenceNumber;
    if (!customerID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    const result = await contract.evaluateTransaction(
      "retrievePvCustomerMetaData",
      customerID
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


exports.retrieveEDIPvMerchantMetaData = async function (req, res) {
  console.log("line 53 ");
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
    console.log("line number 366 merchantID", merchantID);
    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }

    const result = await contract.evaluateTransaction(
      "retrievePvEDIMerchantMetaData",
      merchantID
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: JSON.parse(result.toString()) });
    return result;
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
  console.log("line 387 ");

  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  try {
    let org = req.params.roleId;

    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantID = req.params.merchantID;

    console.log("line number 400 merchantID", merchantID);

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

    //console.log("---line 438 COMMON DATA---");
    let defaultValueOBMerchant = {
      "bnplProductTypes": UNAUTHORIZED,
      "clrOrgID": UNAUTHORIZED,
      "isContractSigned": UNAUTHORIZED,
      "merchantDescription": UNAUTHORIZED,
      "merchantID": UNAUTHORIZED,
      "merchantName": UNAUTHORIZED,
      "merchantType": UNAUTHORIZED,
      "locationsAllowed": UNAUTHORIZED,
      "promoCode": UNAUTHORIZED,
    }
    let defaultValueAPPDC = {
      "bnplProductTypes": UNAUTHORIZED,
      "clrOrgID": UNAUTHORIZED,
      "clrOrgName": UNAUTHORIZED,
      "isContractSigned": UNAUTHORIZED,
      "merchantDescription": UNAUTHORIZED,
      "merchantID": UNAUTHORIZED,
      "merchantName": UNAUTHORIZED,
      "merchantType": UNAUTHORIZED,
      "txcMaxTxPerDay": UNAUTHORIZED,
      "txcMinTxAmount": UNAUTHORIZED,
      "txcMaxTxAmount": UNAUTHORIZED,
      "txcTxCurrency": UNAUTHORIZED,
      "aggName": UNAUTHORIZED,
      "aggID": UNAUTHORIZED
    }

    let defaultValueCAcctPDC = {
      "currentOutstandingAmount": UNAUTHORIZED,
      "customerID": UNAUTHORIZED,
      "customerName": UNAUTHORIZED,
      "isDefaulter": UNAUTHORIZED,
      "loanAccountNumber": UNAUTHORIZED,
      "loanExpiryDate": UNAUTHORIZED,
      "maxLoanAmount": UNAUTHORIZED,
      "merchantID": UNAUTHORIZED,
      "totalDisbursedAmount": UNAUTHORIZED,
      "txcNegotiatedMDR": UNAUTHORIZED,
    }
    let defaultValueEDIPDC = {
      "balanceAmount": UNAUTHORIZED,
      "clearedAmount": UNAUTHORIZED,
      "creditCost": UNAUTHORIZED,
      "customerID": UNAUTHORIZED,
      "customerName": UNAUTHORIZED,
      "funding": UNAUTHORIZED,
      "issuerProcessor": UNAUTHORIZED,
      "loanAccountNumber": UNAUTHORIZED,
      "merchantBankCode": UNAUTHORIZED,
      "merchantFees": UNAUTHORIZED,
      "merchantID": UNAUTHORIZED,
      "networkFees": UNAUTHORIZED,
      "refNegotiatedMDR": UNAUTHORIZED,
      "txID": UNAUTHORIZED,
      "merchantAccountNumber": UNAUTHORIZED,
      //03-03-23 added clrorgname
      "clrOrgName": UNAUTHORIZED,
    }
    let retrieveOBMerchantDataResult;
    try {
      retrieveOBMerchantDataResult = await contract.evaluateTransaction(
        "retrieveOBMerchantData",
        merchantID
      );
      console.log("line 443---retrieveOBMerchantDataResult", JSON.parse(retrieveOBMerchantDataResult));
      //  console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
    }
    catch (error) {
      retrieveOBMerchantDataResult = { error: error, pdcUnauthorized: "retrieveOBMerchantData" }
    }
    console.log("line 449---retrieveOBMerchantDataResult", retrieveOBMerchantDataResult);

    console.log("---line 451 AP DATA---");
    let retrievePvMerchantMetaDataResult;
    try {
      retrievePvMerchantMetaDataResult = await contract.evaluateTransaction(
        "retrievePvMerchantMetaData",
        merchantID
      );
      // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      console.log("line 458---retrievePvMerchantMetaDataResult", JSON.parse(retrievePvMerchantMetaDataResult));
    } catch (error) {
      retrievePvMerchantMetaDataResult = { error: error, pdcUnauthorized: "retrievePvMerchantMetaData" }
    }
    console.log("line 462---retrievePvMerchantMetaDataResult", retrievePvMerchantMetaDataResult);

    console.log("---line 465 CACCT DATA---");
    let retrievePvCustomerMetaDataResult;
    try {
      retrievePvCustomerMetaDataResult = await contract.evaluateTransaction(
        "retrievePvCustomerMetaData",
        "C" + merchantID
        // merchantID
      );
      //  console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      console.log("line 471---retrievePvCustomerMetaData", JSON.parse(retrievePvCustomerMetaDataResult));
    } catch (error) {
      retrievePvCustomerMetaDataResult = { error: error, pdcUnauthorized: "retrievePvCustomerMetaData" }
    }
    console.log("line 475---retrievePvCustomerMetaData", retrievePvCustomerMetaDataResult);

    console.log("---line 477 EDI DATA---");
    let retrieveEDIPvMerchantMetaDataResult;
    try {
      retrieveEDIPvMerchantMetaDataResult = await contract.evaluateTransaction(
        "retrievePvEDIMerchantMetaData",
        merchantID
      );

      console.log("line 484---retrieveEDIPvMerchantMetaDataResult", JSON.parse(retrieveEDIPvMerchantMetaDataResult));
    } catch (error) {
      retrieveEDIPvMerchantMetaDataResult = { error: error, pdcUnauthorized: "retrievePvEDIMerchantMetaData" }
    }
    console.log("line 488---retrieveEDIPvMerchantMetaDataResult", retrieveEDIPvMerchantMetaDataResult);


    retrieveOBMerchantDataResult = retrieveOBMerchantDataResult.error ? defaultValueOBMerchant : JSON.parse(retrieveOBMerchantDataResult)
    retrievePvMerchantMetaDataResult = retrievePvMerchantMetaDataResult.error ? defaultValueAPPDC : JSON.parse(retrievePvMerchantMetaDataResult)
    retrievePvCustomerMetaDataResult = retrievePvCustomerMetaDataResult.error ? defaultValueCAcctPDC : JSON.parse(retrievePvCustomerMetaDataResult)
    retrieveEDIPvMerchantMetaDataResult = retrieveEDIPvMerchantMetaDataResult.error ? defaultValueEDIPDC : JSON.parse(retrieveEDIPvMerchantMetaDataResult)

    console.log("retrieveOBMerchantDataResult : ", retrieveOBMerchantDataResult);
    console.log("retrievePvMerchantMetaDataResult : ", retrievePvMerchantMetaDataResult);
    console.log("retrievePvCustomerMetaDataResult : ", retrievePvCustomerMetaDataResult);
    console.log("retrieveEDIPvMerchantMetaDataResult : ", retrieveEDIPvMerchantMetaDataResult);

    const mergeObjects1 = mergeObjects(retrieveOBMerchantDataResult, retrievePvMerchantMetaDataResult)
    const mergeObjects2 = mergeObjects(mergeObjects1, retrievePvCustomerMetaDataResult)
    const mergeObjects3 = mergeObjects(mergeObjects2, retrieveEDIPvMerchantMetaDataResult)

    console.log("mergeObjects1", mergeObjects1);
    console.log("mergeObjects2", mergeObjects2);
    console.log("mergeObjects3", mergeObjects3);

    console.log("retrieveOBMerchantDataResult", retrieveOBMerchantDataResult);
    console.log("retrievePvMerchantMetaDataResult", retrievePvMerchantMetaDataResult);
    console.log("retrievePvCustomerMetaDataResult", retrievePvCustomerMetaDataResult);
    console.log("retrieveEDIPvMerchantMetaDataResult", retrieveEDIPvMerchantMetaDataResult);

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
