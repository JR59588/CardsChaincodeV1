const jwt = require("jsonwebtoken");
var logger = require("../../logger");
const express = require("express");
const bodyParser = require("body-parser");
const data = require("./data.json");
const enrollAdmin = require("../../enrollAdmin");
const registerUser = require("../../registerUser");
const { exec, execSync } = require('child_process');
const path = require('path');
const app = express();
const fs = require('fs');
app.use(bodyParser.json());

// Setting for Hyperledger Fabric
const { Wallets, Gateway } = require("fabric-network");
const registerAndEnrollFunc = require("../../registerAndEnroll");
const { evaluateTransaction } = require("./utils");
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


const savePvAADMetaData = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PDC2";
  try {
    let org = "AAD";
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
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
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
    console.log("line 100 ");

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      merchantBankCode: merchantBankCode,
      merchantAccountNumber: merchantAccountNumber,
      securityDeposits: securityDeposits,
    };

    console.log(" merchant_properties ", merchant_properties);

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


const savePvAODMetaData = async function (req, res) {
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
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
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
    const product = req.body.product;
    const numberOfPOSTerminalsRequired = req.body.numberOfPOSTerminalsRequired;
    const POSID = req.body.POSID;

    console.log(JSON.stringify(req.body));


    let result;
    let merchant_properties = {
      merchantID: merchantID,
      product: product,
      numberOfPOSTerminalsRequired: numberOfPOSTerminalsRequired,
      POSID: POSID,
    };

    console.log(" merchant_properties ", merchant_properties);

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

const savePvAADAODMetaData = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PDC3";
  try {
    let org = "AOD" || "AAD";
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
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
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
    const txcMaxTxPerDay = req.body.txcMaxTxPerDay;
    const txcMinTxAmount = req.body.txcMinTxAmount;
    const txcMaxTxAmount = req.body.txcMaxTxAmount;
    const txcTxCurrency = req.body.txcTxCurrency;
    const txcNegotiatedMDR = req.body.txcNegotiatedMDR;
    const promoCode = req.body.promoCode;


    console.log(JSON.stringify(req.body));


    let result;
    let merchant_properties = {
      merchantID: merchantID,
      txcMaxTxPerDay: txcMaxTxPerDay,
      txcMinTxAmount: txcMinTxAmount,
      txcMaxTxAmount: txcMaxTxAmount,
      txcTxCurrency: txcTxCurrency,
      txcNegotiatedMDR: txcNegotiatedMDR,
      promoCode: promoCode
    };

    console.log(" merchant_properties ", merchant_properties);

    let statefulTxn = contract.createTransaction("savePvAADAODMetaData");

    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });

    console.log("tmapData", tmapData);

    const txresult = await statefulTxn.submit();

    console.log(" result", JSON.stringify(txresult));

    // Disconnect from the gateway.
    await gateway.disconnect();

    console.log("Transaction has been submitted for AOD and AAD");
  } catch (error) {
    console.error(
      `Failed to submit transaction for saving merchant private data in AOD  and AAD  : ${error}`
    );
    throw new Error("Failed, submitting tx for AOD PDC  and AAD PDC");
  }
};

const addOrgToDatabase = (orgId, orgName) => {
  try {
    const jsonStr = fs.readFileSync(path.join(__dirname, "..", "orgsAdded.json"));
    const jsonObj = JSON.parse(jsonStr);
    jsonObj.orgs.push({ orgName, orgId });
    fs.writeFileSync(path.join(__dirname, "..", "orgsAdded.json"), JSON.stringify(jsonObj));
    return { error: null };
  } catch (error) {
    return { error: "Error adding organization to the database" };
  }
}

const checkOrgPresent = (orgName) => {
  const jsonStr = fs.readFileSync(path.join(__dirname, "..", "orgsAdded.json"));
  const jsonObj = JSON.parse(jsonStr);

  const orgs = jsonObj.orgs;

  if (orgs.findIndex((org) => org.orgId == orgName) != -1) {
    return true;
  }

  return false;
}

const saveConnectionDetails = (org) => {
  const jsonStr = fs.readFileSync(path.join(__dirname, "data.json"));
  const jsonObj = JSON.parse(jsonStr);
  jsonObj[org] = {
    connectionPath: "./connection-" + org + ".json",
    walletOrg: "wallet" + org,
    clientMSPId: org + "MSP",
    userWallet: "appUserFor" + org,
    admin: "admin"
  }
  const connectionFilePath = path.join(__dirname, "..", "..", "..", "..", "HLF-Cards", "hlf-cards", "organizations", "peerOrganizations", org + ".hlfcards.com", "connection-" + org + ".json");
  const connectionDetails = fs.readFileSync(connectionFilePath);
  fs.writeFileSync(path.join(__dirname, "..", "..", "connection-" + org + ".json"), connectionDetails);
  fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(jsonObj));
}

exports.saveOBMerchantSummary = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_CollectionName = "Main";

  try {
    let org = req.body.roleId;
    if (["AAD", "ACD", "AOD"].findIndex(item => item === org) === -1) {
      return res.status(400).json({ success: false, message: "Please use a valid role" });
    } else if (!data[org]) {
      return res.status(400).json({ success: false, message: "Error!. Invalid role name" });
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
      console.log(`An identity for the user ${data[org].userWallet} does not exist in the wallet`);
      console.log("Run the registerUser.js application before retrying");
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
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

    // To check if the merchantID organization is already present in the database(For now, in a JSON file.)
    if (checkOrgPresent(req.body.merchantID)) {
      return res.status(400).json({ success: false, message: `There's already a merchant with the ID: ${req.body.merchantID}` });
    }

    // adding merchant organization to the network
    const { orgAddnError } = addOrganization(req.body.merchantID);

    if (orgAddnError) {
      console.log("Error when adding org is: ", orgAddnError);
      return res.status(400).json({
        success: false,
        message: `Failed to onboard the merchant: ${req.body.merchantName}`
      });
    }

    const { error } = addOrgToDatabase(req.body.merchantID, req.body.merchantName);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Error adding organization to the database"
      });
    }

    // Invoke Onboarding PDC chaincode functions to store private data about the Merchant that's onboarded.

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

    console.log("merchant_properties ", merchant_properties);

    let statefulTxn = contract.createTransaction("saveOBMerchantSummary");

    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });

    console.log("tmapData", tmapData);

    result = await statefulTxn.submit();

    console.log(" result", result.toString());

    // Disconnect from the gateway.

    console.log("Transaction has been submitted by saveOBMerchantSummary");

    await savePvAADMetaData(req, res);
    await savePvAADAODMetaData(req, res);
    await savePvAODMetaData(req, res);

    await gateway.disconnect();



    return res.status(200).json({
      success: true,
      message: `Successfully onboarded the merchant: ${req.body.merchantName}`,
    });
  } catch (error) {
    console.log(`Failed to onboard new merchant: ${req.body.merchantName}, ${req.body.merchantID} ${error}`);
    // console.error(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: `Failed to onboard the merchant: ${req.body.merchantName}`,
      reason: error.message,
    });
  }
};


const addOrganization = function (orgName) {

  console.log("Adding organization ", orgName);

  //Path to your Bash script.
  const bashScriptPath = path.join(__dirname, '..', '..', '..', '..', 'HLF-Cards', 'hlf-cards', 'generate.sh');

  // Get the directory where the Bash script resides.
  const scriptDirectory = path.dirname(bashScriptPath);

  // Define the arguments to pass to the Bash script.
  const jsonStr = fs.readFileSync(path.join(__dirname, "..", "newOrgVars.json"));
  const jsonObj = JSON.parse(jsonStr);


  const nextValue = jsonObj.currentValue + 2;
  const nextGlobal = jsonObj.currentGlobal + 1;

  jsonObj.currentValue = nextValue;
  jsonObj.currentGlobal = nextGlobal;
  fs.writeFileSync(path.join(__dirname, "..", "newOrgVars.json"), JSON.stringify(jsonObj));

  const scriptArguments = ['ACD', orgName, '15051', '15052', '15054', '10084', nextValue + '051', nextValue + '052', nextValue + '054', nextValue + '084', nextGlobal + '', '5'];

  // Create a command string that includes the Bash script path and its arguments.
  const command = `bash ${bashScriptPath} ${scriptArguments.join(' ')}`;

  // Run the Bash script using exec with the CWD option set to the script's directory.
  let orgAddnSuccess = true;
  try {
    execSync(command, { cwd: scriptDirectory });

    //Saving connection details for new merchant organization.
    saveConnectionDetails(orgName);
    //Enrolling users for future request settlement tx's.
    registerAndEnrollFunc(orgName);
  } catch (error) {
    console.log("Error executing generate script to add new merchant organization", error)
    orgAddnSuccess = false;
  }

  return { orgAddnError: orgAddnSuccess ? null : `There was an error adding organization ${orgName} to the network` }

};

exports.verifySubmitTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "SubmitSettlementTxCC";
  const ccFunctionName = "submitSettlementTx"

  try {
    let org = req.body.roleId;
    console.log("req.body", req.body);
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res.status(400).send("Merchant ID field is empty. Please provide Merchant ID");
    }
    if (!customerId) {
      res.status(400).send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res.status(400).send("loanReferenceNumber field is empty. Please provide loanReferenceNumber");
    }

    console.log("Verifying for ", org);
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    console.log("identity", identity);
    if (!identity) {
      console.log(
        "An identity for the user" +
        data[org].userWallet +
        "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    // console.log("gateway",gateway);
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);
    //console.log("network",network);
    // Get the contract from the network.
    const contract = network.getContract(contractName);
    // console.log("contract",contract);

    let result;
    try {
      // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log("Transaction has been submitted for verifySubmitTx by PSP ", result);
    } catch (error) {
      console.error(`Failed to call submit transaction while submitting Settelment transcation : ${error}`);
      throw error;
    }

    console.log("Transaction has been submitted for verifySubmitTx by PSP ", result);
    // Disconnect from the gateway.
    await gateway.disconnect();


    return res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};


exports.verifyAuthorizeTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "AuthorizeSettlementTxCC";
  const ccFunctionName = "authorizeSettlementTx"

  try {
    let org = req.body.roleId;
    console.log("req.body----", req.body);
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res.status(400).send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res.status(400).send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res.status(400).send("loanReferenceNumber field is empty. Please provide loanReferenceNumber");
    }

    console.log("Verifying for ", org);
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    console.log("identity", identity);
    if (!identity) {
      console.log(
        "An identity for the user" +
        data[org].userWallet +
        "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    // console.log("gateway",gateway);
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);
    //console.log("network",network);
    // Get the contract from the network.
    const contract = network.getContract(contractName);
    // console.log("contract",contract);

    let result;
    try {
      // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log("Transaction has been submitted for verifyAuthoriseTx by ACD ", result);
    } catch (error) {
      console.error(`Failed to submit transaction while submitting transcation for accept for ACD: ${error}`);
      throw error;
    }

    //console.log("Transaction has been submitted for verifyAuthoriseTx by SA ",result);
    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line139");


    res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};


exports.verifyBalanceTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "BalanceSettlementTxCC";
  const ccFunctionName = "balanceSettlementTx"

  try {
    let org = req.body.roleId;
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)

    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res.status(400).send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res.status(400).send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res.status(400).send("loanReferenceNumber field is empty. Please provide loanReferenceNumber");
    }

    console.log("Verifying balance for ", org);
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    console.log("identity", identity);
    if (!identity) {
      console.log(
        "An identity for the user" +
        data[org].userWallet +
        "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    // console.log("gateway",gateway);
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);
    //console.log("network",network);
    // Get the contract from the network.
    const contract = network.getContract(contractName);
    // console.log("contract",contract);

    let result;
    try {
      // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)

      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log("Transaction has been submitted for verifyBalanceTx by AAD ", result);
    } catch (error) {
      console.error(`Failed to call submit transaction while submitting transcation BalanceTx : ${error}`);
      throw error;
    }

    console.log("Transaction has been submitted for verifyBalanceTx  ", result);
    // Disconnect from the gateway.
    await gateway.disconnect();
    // await module.exports.balanceTxByAgg(req, res);

    return res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};


exports.verifyClearTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "ClearSettlementTxCC";
  const ccFunctionName = "clearSettlementTx"

  try {
    let org = req.body.roleId;
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }
    // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res.status(400).send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res.status(400).send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res.status(400).send("loanReferenceNumber field is empty. Please provide loanReferenceNumber");
    }

    console.log("Verifying for ", org);
    let ccpPath = path.resolve(data[org].connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.join(process.cwd(), data[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(data[org].userWallet);
    console.log("identity", identity);
    if (!identity) {
      console.log(
        "An identity for the user" +
        data[org].userWallet +
        "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return res.status(400).json({ success: false, message: `Unable to find user wallet for the organization ${org}` });
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    // console.log("gateway",gateway);
    await gateway.connect(ccp, {
      wallet,
      identity: data[org].userWallet,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);
    //console.log("network",network);
    // Get the contract from the network.
    const contract = network.getContract(contractName);
    // console.log("contract",contract);

    let result;
    try {
      // TODO : mid , cid, lrf has to be changed accordingly......(discussion in team)
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log("Transaction has been submitted for verifyclearTx by AOD ", result);
    } catch (error) {
      console.error(`Failed to submit transaction while submitting transcation for Verify for AOD: ${error}`);
      throw error;
    }

    console.log("Transaction has been submitted for verifyclearTx by AOD ", result);
    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line139");

    return res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};

exports.verifySubmitTxUtils = async function (req, res) {
  const { roleId, merchantId, customerId, loanReferenceNumber } = req.body;

  if (!(roleId && merchantId && customerId && loanReferenceNumber)) {
    res.status(400).json({
      success: false,
      message: `Ensure to provide valid request parameters for verifying submit tx`
    });
  }
  const { error, result } = await evaluateTransaction(roleId, channelName, "SubmitSettlementTxCC", "submitSettlementTx", [merchantId, customerId, loanReferenceNumber]);
  console.log("Error in submit tx: ", error);
  console.log("Result in submit tx: ", result);
  if (error) {
    console.log(`verify submit tx error: ${error}`)
    res.status(400).json({
      success: false,
      message: `Error in submit tx verification ${error}`
    });
  } else {
    console.log(`verify submit tx result: ${result}`);
    res.status(200).json({
      success: true,
      message: `Successfully invoked submit tx verification`
    });
  }
}

exports.verifyAuthorizeTxUtils = async function (req, res) {
  const { roleId, merchantId, customerId, loanReferenceNumber } = req.body;

  if (!(roleId && merchantId && customerId && loanReferenceNumber)) {
    res.status(400).json({
      success: false,
      message: `Ensure to provide valid request parameters for verifying authorize tx`
    });
  }
  const { error, result } = await evaluateTransaction(roleId, channelName, "AuthorizeSettlementTxCC", "authorizeSettlementTx", [merchantId, customerId, loanReferenceNumber]);

  if (error) {
    console.log(`verify authorize tx error: ${error}`)
    res.status(400).json({
      success: false,
      message: `Error in authorize tx verification ${error}`
    });
  } else {
    console.log(`verify authorize tx result: ${result}`);
    res.status(200).json({
      success: true,
      message: `Successfully invoked authorize tx verification`
    });
  }
}

exports.verifyBalanceTxUtils = async function (req, res) {
  const { roleId, merchantId, customerId, loanReferenceNumber } = req.body;

  if (!(roleId && merchantId && customerId && loanReferenceNumber)) {
    res.status(400).json({
      success: false,
      message: `Ensure to provide valid request parameters for verifying balance tx`
    });
  }
  const { error, result } = await evaluateTransaction(roleId, channelName, "BalanceSettlementTxCC", "balanceSettlementTx", [merchantId, customerId, loanReferenceNumber]);

  if (error) {
    console.log(`verify balance tx error: ${error}`)
    res.status(400).json({
      success: false,
      message: `Error in balance tx verification ${error}`
    });
  } else {
    console.log(`verify balance tx result: ${result}`);
    res.status(200).json({
      success: true,
      message: `Successfully invoked balance tx verification`
    });
  }
}

exports.verifyClearTxUtils = async function (req, res) {
  const { roleId, merchantId, customerId, loanReferenceNumber } = req.body;

  if (!(roleId && merchantId && customerId && loanReferenceNumber)) {
    res.status(400).json({
      success: false,
      message: `Ensure to provide valid request parameters for verifying clear tx`
    });
  }
  const { error, result } = await evaluateTransaction(roleId, channelName, "ClearSettlementTxCC", "clearSettlementTx", [merchantId, customerId, loanReferenceNumber]);

  if (error) {
    console.log(`verify clear tx error: ${error}`)
    res.status(400).json({
      success: false,
      message: `Error in clear tx verification ${error}`
    });
  } else {
    console.log(`verify clear tx result: ${result}`);
    res.status(200).json({
      success: true,
      message: `Successfully invoked clear tx verification`
    });
  }
}

exports.verifyConfirmTxUtils = async function (req, res) {
  const { roleId, merchantId, customerId, loanReferenceNumber, msgType } = req.body;

  if (!(roleId && msgType && merchantId && customerId && loanReferenceNumber)) {
    res.status(400).json({
      success: false,
      message: `Ensure to provide valid request parameters for verifying confirm tx`
    });
  }

  if (!(roleId === "AOD")) {
    return res.status(400).json({
      success: false,
      message: "Please use AOD for this operation"
    })
  }

  const { error, result } = await evaluateTransaction(roleId, channelName, "ConfirmSettlementTxCC", "confirmSettlementTx", [msgType, merchantId, customerId, loanReferenceNumber]);
  console.log("Error in confirm tx: ", error);
  console.log("Result in confirm tx: ", result);
  if (error) {
    console.log(`verify confirm tx error: ${error}`)
    res.status(400).json({
      success: false,
      message: `Error in confirm tx verification ${error}`
    });
  } else {
    console.log(`verify confirm tx result: ${result}`);
    res.status(200).json({
      success: true,
      message: `Successfully invoked confirm tx verification`
    });
  }
}