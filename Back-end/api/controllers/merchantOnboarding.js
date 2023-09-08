const jwt = require("jsonwebtoken");
var logger = require("../../logger");
const express = require("express");
const bodyParser = require("body-parser");
const data = require("./data.json");
const app = express();
const fs = require('fs');
app.use(bodyParser.json());

// Setting for Hyperledger Fabric
const { Wallets, Gateway } = require("fabric-network");
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

exports.savePvAADAODMetaData= async function (req, res) {
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
    const txcMaxTxPerDay = req.body.txcMaxTxPerDay;
    const txcMinTxAmount =req.body.txcMinTxAmount ;
    const txcMaxTxAmount= req.body.txcMaxTxAmount;
    const txcTxCurrency= req.body.txcTxCurrency;
    const txcNegotiatedMDR= req.body.txcNegotiatedMDR;
    const promoCode= req.body.promoCode;


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
    await gateway.disconnect();

    console.log("Transaction has been submitted by saveOBMerchantSummary");

    await module.exports.savePvAADMetaData(req, res);
    await module.exports.savePvAADAODMetaData(req, res);
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


exports.testOrgAddition = async function(req, res) {
  try {
    console.log("req.body: ", req.body);
    const orgName = req.body.orgName;
    if (orgName !== undefined) {
      console.log("Adding organization ", req.body.orgName);

      const { exec } = require('child_process');
      const path = require('path');

      //Path to your Bash script.
      const bashScriptPath = path.join(__dirname, '..', '..', '..', '..', 'HLF-Cards', 'hlf-cards', 'generate.sh');

      // Get the directory where the Bash script resides.
      const scriptDirectory = path.dirname(bashScriptPath);

      // Define the arguments to pass to the Bash script.
      const jsonStr = fs.readFileSync(path.join(__dirname, "..", "newOrgVars.json"));
      const jsonObj = JSON.parse(jsonStr);

      const nextValue = jsonObj.currentValue + 2;
      const nextGlobal = jsonObj.currentGlobal + 1;

      const scriptArguments = ['ACD', req.body.orgName, '15051', '15052', '15054', '10084', nextValue + '051', nextValue + '052', nextValue + '054', nextValue + '084', nextGlobal + '', '5'];

      // Create a command string that includes the Bash script path and its arguments.
      const command = `bash ${bashScriptPath} ${scriptArguments.join(' ')}`;

      // Run the Bash script using exec with the CWD option set to the script's directory.
      exec(command, { cwd: scriptDirectory }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Bash script: ${error}`);
          throw new Error(error);
        }
        console.log(`Bash script output: ${stdout}`);
        console.error(`Bash script errors: ${stderr}`);
        jsonObj.currentValue = nextValue;
        jsonObj.currentGlobal = nextGlobal;
        fs.writeFileSync(path.join(__dirname, "..", "newOrgVars.json"), JSON.stringify(jsonObj));
        res.status(200).send('Organization added succesfully');
      });
    } else {
      throw new Error("Orgnaization name not found!");
    }

  } catch (error) {
    console.log("Error adding organization ", req.body.orgName);
    console.log(error);
    res.status(400).send('Something went wrong in adding the organization');
  }
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
      return;
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
      return;
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
      return;
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
      return;
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

