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

exports.savePvAPMerchantMetaData = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PvMerchantAPInfo";
  try {
    let org = "AP";
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
    const merchantDescription = req.body.merchantDescription;
    const merchantType = req.body.merchantType;
    const bnplProductTypes = req.body.bnplProductTypes;
    //02-03-23 moving merchantAccountNumber from ap  to edi
    // const merchantAccountNumber = req.body.merchantAccountNumber;
    //11-02-23moving merchantBankCode to edi
    // const merchantBankCode = req.body.merchantBankCode ? req.body.merchantBankCode : "BXXXXXX";
    const merchantAccountType = req.body.merchantAccountType
      ? req.body.merchantAccountType
      : "MXXXXXX";
    //02-03-23 moving txcNegotiatedMDR from ap  to cacct
    //const txcNegotiatedMDR = req.body.txcNegotiatedMDR;
    const txcMaxTxPerDay = req.body.txcMaxTxPerDay;
    const txcMinTxAmount = req.body.txcMinTxAmount;
    const txcMaxTxAmount = req.body.txcMaxTxAmount;
    const txcTxCurrency = req.body.txcTxCurrency;
    const aggName = req.body.aggName;
    const aggID = req.body.aggID;
    const clrOrgName = req.body.clrOrgName
      ? req.body.clrOrgName
      : "Clearing Org";
    const clrOrgID = req.body.clrOrgID ? req.body.clrOrgID : "Clearing ID";
    const isContractSigned = req.body.isContractSigned;
    const locationsAllowed = req.body.locationsAllowed;
    const merchantName = req.body.merchantName;

    console.log(JSON.stringify(req.body));
    console.log("line 111 ");

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      merchantName: merchantName,
      merchantDescription: merchantDescription,
      merchantType: merchantType,
      bnplProductTypes: bnplProductTypes,
      //02-03-23 moving merchantAccountNumber from ap  to edi
      //merchantAccountNumber: merchantAccountNumber,
      //11-02-23moving merchantBankCode to edi
      // merchantBankCode: merchantBankCode,
      merchantAccountType: merchantAccountType,
      //02-03-23 moving txcNegotiatedMDR from ap  to cacct
      //txcNegotiatedMDR: txcNegotiatedMDR,
      txcMaxTxPerDay: txcMaxTxPerDay,
      txcMinTxAmount: txcMinTxAmount,
      txcMaxTxAmount: txcMaxTxAmount,
      txcTxCurrency: txcTxCurrency,
      aggName: aggName,
      aggID: aggID,
      clrOrgName: clrOrgName,
      clrOrgID: clrOrgID,
      isContractSigned: isContractSigned,
      locationsAllowed: locationsAllowed,
    };
    console.log("line134 ");
    let statefulTxn = contract.createTransaction("savePvMerchantMetaData");
    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });
    console.log("line140 tmapData", tmapData);
    const txresult = await statefulTxn.submit();
    console.log("line146 result", JSON.stringify(txresult));

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line150 ");
    console.log("Transaction has been submitted line 151");
  } catch (error) {
    console.error(
      `Failed to submit transaction for saving merchant private data in AP : ${error}`
    );
    throw new Error("Failed, submitting tx for AP PDC");
  }
};

exports.savePvCAcctMerchantMetaData = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PvCustomerCAcctInfo";
  try {
    let org = "CAcct";
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
    const customerID = req.body.customerID;
    const loanAccountNumber = req.body.loanAccountNumber;
    const loanExpiryDate = req.body.loanExpiryDate;
    const maxLoanAmount = req.body.maxLoanAmount;
    const currentOutstandingAmount = req.body.currentOutstandingAmount;
    const totalDisbursedAmount = req.body.totalDisbursedAmount;
    const isDefaulter = req.body.isDefaulter;
    const customerName = req.body.customerName;
    //02-03-23 moving promoCode from cacct  to common
    //const promoCode = req.body.promoCode;
    //02-03-23 moving txcNegotiatedMDR from ap  to cacct
    const txcNegotiatedMDR = req.body.txcNegotiatedMDR;

    console.log(JSON.stringify(req.body));
    console.log("line 111 ");

    let result;
    let customer_properties = {
      customerID: customerID,
      merchantID: merchantID,
      loanAccountNumber: loanAccountNumber,
      loanExpiryDate: loanExpiryDate,
      maxLoanAmount: maxLoanAmount,
      currentOutstandingAmount: currentOutstandingAmount,
      totalDisbursedAmount: totalDisbursedAmount,
      isDefaulter: isDefaulter,
      customerName: customerName,
      //02-03-23 moving promoCode from cacct  to common
      //promoCode : promoCode,
      //02-03-23 moving txcNegotiatedMDR from ap  to cacct
      txcNegotiatedMDR: txcNegotiatedMDR,
    };
    console.log("line 223 ", customer_properties);
    let statefulTxn = contract.createTransaction("savePvCustomerMetaData");
    let tmapData = Buffer.from(JSON.stringify(customer_properties));
    statefulTxn.setTransient({
      customer_properties: tmapData,
    });
    console.log("line140 tmapData", tmapData);
    result = await statefulTxn.submit();
    console.log("line146 result", result.toString());

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line150 ");
    console.log("Transaction has been submitted line 151");
  } catch (error) {
    console.log(
      `Failed to submit transaction for saving customer private data in CAcct : ${error}`
    );
    console.error(
      `Failed to submit transaction for saving customer private data in CAcct : ${error}`
    );
    throw new Error("Failed, submitting tx for CAcct PDC");
  }
};

exports.savePvEDIClearingInfo = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PvClearingInfo";
  try {
    let org = "EDI";
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

    const customerID = req.body.customerID;
    const merchantID = req.body.merchantID;
    const customerName = req.body.customerName;
    const txID = req.body.txID;
    const loanAccountNumber = req.body.loanAccountNumber;
    //10-02-23 moved merchantBankCode from AP to EDI
    const merchantBankCode = req.body.merchantBankCode;
    const clearedAmount = req.body.clearedAmount;
    const balanceAmount = req.body.balanceAmount;
    const refNegotiatedMDR = req.body.refNegotiatedMDR;
    const merchantFees = req.body.merchantFees;
    const issuerProcessor = req.body.issuerProcessor;
    const networkFees = req.body.networkFees;
    const creditCost = req.body.creditCost;
    const funding = req.body.funding;
    //02-03-23 moving merchantAccountNumber from ap  to edi
    const merchantAccountNumber = req.body.merchantAccountNumber;
    //03-03-23 added clrorgname in edi
    const clrOrgName = req.body.clrOrgName
      ? req.body.clrOrgName
      : "Clearing Org";

    console.log(JSON.stringify(req.body));
    console.log("line 111 ");

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      customerID: customerID,
      customerName: customerName,
      txID: txID,
      loanAccountNumber: loanAccountNumber,
      balanceAmount: balanceAmount,
      merchantBankCode: merchantBankCode,
      clearedAmount: clearedAmount,
      refNegotiatedMDR: refNegotiatedMDR,
      merchantFees: merchantFees,
      issuerProcessor: issuerProcessor,
      networkFees: networkFees,
      creditCost: creditCost,
      funding: funding,
      //02-03-23 moved merchantAccountNumber from ap  to edi
      merchantAccountNumber: merchantAccountNumber,
      //03-03-23 added clrorgname in edi
      clrOrgName: clrOrgName,
    };
    console.log("line134 ");
    let statefulTxn = contract.createTransaction("savePvClearingInfo");
    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });
    console.log("line140 tmapData", tmapData);
    const txresult = await statefulTxn.submit();
    console.log("line146 result", JSON.stringify(txresult));

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line150 ");
    console.log("Transaction has been submitted line 151");
  } catch (error) {
    console.error(
      `Failed to submit transaction for saving merchant private data in EDI : ${error}`
    );
    throw new Error("Failed, submitting tx for EDI PDC");
  }
};

exports.saveOBMerchantSummary = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_CollectionName = "PvOBMerchantSummary";

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
    const merchantType = req.body.merchantType;
    const bnplProductTypes = req.body.bnplProductTypes;
    const txcNegotiatedMDR = req.body.txcNegotiatedMDR;
    const clrOrgID = req.body.clrOrgID ? req.body.clrOrgID : "Clearing ID";
    const isContractSigned = req.body.isContractSigned;
    const locationsAllowed = req.body.locationsAllowed;
    //02-03-23 moved promoCode from cacct  to common
    const promoCode = req.body.promoCode;
    //29-03-23 moved merchantBankCode from AP to EDI
    const merchantBankCode = req.body.merchantBankCode;
    const merchantAccountNumber = req.body.merchantAccountNumber;
    const txcMaxTxPerDay = req.body.txcMaxTxPerDay;
    const txcMinTxAmount = req.body.txcMinTxAmount;
    const txcMaxTxAmount = req.body.txcMaxTxAmount;
    const txcTxCurrency = req.body.txcTxCurrency;
    const aggName = req.body.aggName;
    const aggID = req.body.aggID;

    console.log(JSON.stringify(req.body));
    console.log("line 111 ");

    let result;
    let merchant_properties = {
      merchantID: merchantID,
      merchantName: merchantName,
      merchantDescription: merchantDescription,
      merchantType: merchantType,
      bnplProductTypes: bnplProductTypes,
      txcNegotiatedMDR: txcNegotiatedMDR,
      clrOrgID: clrOrgID,
      isContractSigned: isContractSigned,
      locationsAllowed: locationsAllowed,
      //02-03-23 moving promoCode from cacct  to common
      promoCode: promoCode,
      merchantBankCode: merchantBankCode,
      merchantAccountNumber: merchantAccountNumber,
      txcMaxTxPerDay: txcMaxTxPerDay,
      txcMinTxAmount: txcMinTxAmount,
      txcMaxTxAmount: txcMaxTxAmount,
      txcTxCurrency: txcTxCurrency,
      aggName: aggName,
      aggID: aggID,
    };
    console.log("line126 ");
    let statefulTxn = contract.createTransaction("saveOBMerchantSummary");
    let tmapData = Buffer.from(JSON.stringify(merchant_properties));
    statefulTxn.setTransient({
      merchant_properties: tmapData,
    });
    console.log("line132 tmapData", tmapData);
    result = await statefulTxn.submit();
    console.log("line135 result", result.toString());

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line139");
    console.log("Transaction has been submitted line 140");

    await module.exports.savePvAPMerchantMetaData(req, res);
    await module.exports.savePvCAcctMerchantMetaData(req, res);
    await module.exports.savePvEDIClearingInfo(req, res);

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

exports.verifyAcceptTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "ConfirmSettlementTxCC";
  const ccFunctionName = "confirmSettlementTx";

  try {
    let org = req.body.roleId;
    console.log("req.body----", req.body);
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res
        .status(400)
        .send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res
        .status(400)
        .send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res
        .status(400)
        .send(
          "loanReferenceNumber field is empty. Please provide loanReferenceNumber"
        );
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
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log(
        "Transaction has been submitted for verifyAcceptTx by SA ",
        result
      );
    } catch (error) {
      console.error(
        `Failed to submit transaction while submitting transcation for accept for SA: ${error}`
      );
      throw error;
    }

    console.log(
      "Transaction has been submitted for verifyAcceptTx by SA ",
      result
    );
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

exports.verifySubmitTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "SubmitSettlementTxCC";
  const ccFunctionName = "submitSettlementTx";

  try {
    let org = req.body.roleId;
    console.log("ln 635 req.body", req.body);
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res
        .status(400)
        .send("Merchant ID field is empty. Please provide Merchant ID");
    }
    if (!customerId) {
      res
        .status(400)
        .send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res
        .status(400)
        .send(
          "loanReferenceNumber field is empty. Please provide loanReferenceNumber"
        );
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
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log(
        "Transaction has been submitted for verifySubmitTx by AP ",
        result
      );
    } catch (error) {
      console.error(
        `Failed to call submit transaction while submitting Settelment transcation : ${error}`
      );
      throw error;
    }

    console.log(
      "Transaction has been submitted for verifySubmitTx by AP ",
      result
    );
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

exports.verifyBalanceTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "BalanceSettlementTxCC";
  const ccFunctionName = "balanceSettlementTx";

  try {
    let org = req.body.roleId;
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res
        .status(400)
        .send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res
        .status(400)
        .send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res
        .status(400)
        .send(
          "loanReferenceNumber field is empty. Please provide loanReferenceNumber"
        );
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
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log(
        "Transaction has been submitted for verifyBalanceTx  ",
        result
      );
    } catch (error) {
      console.error(
        `Failed to call submit transaction while submitting transcation BalanceTx : ${error}`
      );
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

exports.verifyAccountTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "AccountSettlementTxCC";
  const ccFunctionName = "accountSettlementTx";

  try {
    let org = req.body.roleId;
    console.log("req.body----", req.body);
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res
        .status(400)
        .send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res
        .status(400)
        .send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res
        .status(400)
        .send(
          "loanReferenceNumber field is empty. Please provide loanReferenceNumber"
        );
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
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log(
        "Transaction has been submitted for verifyAccountTx by CAcct ",
        result
      );
    } catch (error) {
      console.error(
        `Failed to submit transaction while submitting transcation for accept for CAcct: ${error}`
      );
      throw error;
    }

    console.log(
      "Transaction has been submitted for verifyAccountTx by SA ",
      result
    );
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

exports.verifyClearTx = async function (req, res) {
  const channelName = "channel1";
  const contractName = "ClearSettlementTxCC";
  const ccFunctionName = "clearSettlementTx";

  try {
    let org = req.body.roleId;
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    const merchantId = req.body.merchantId;
    const customerId = req.body.customerId;
    const loanReferenceNumber = req.body.loanReferenceNumber;
    if (!merchantId) {
      res
        .status(400)
        .send("Merchant ID field is empty. Please provide Merchant ID");
    }

    if (!customerId) {
      res
        .status(400)
        .send("customerId field is empty. Please provide customerId");
    }
    if (!loanReferenceNumber) {
      res
        .status(400)
        .send(
          "loanReferenceNumber field is empty. Please provide loanReferenceNumber"
        );
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
      result = await contract.submitTransaction(
        ccFunctionName,
        merchantId,
        customerId,
        loanReferenceNumber
      );
      console.log(
        "Transaction has been submitted for verifyclearTx by EDI ",
        result
      );
    } catch (error) {
      console.error(
        `Failed to submit transaction while submitting transcation for Verify for EDI: ${error}`
      );
      throw error;
    }

    console.log(
      "Transaction has been submitted for verifyclearTx by EDI ",
      result
    );
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

exports.checkPvMerchantMetaData = async function (req, res) {
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

    const merchantID = req.body.merchantID;

    if (!merchantID) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    const result = await contract.submitTransaction(
      "checkPvMerchantMetaData",
      merchantID
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: result.toString() });

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line 276");
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error });
  }
};

exports.saveCustomerInfo = async function (req, res) {
  const channelName = "channel1";
  const contractName = "onboardingMerchantC";
  const pv_IndividualCollectionName = "PvCustomerCAcctInfo";
  let customerAddedCount = 0;
  let addedCustomerId = [];
  try {
    let org = "CAcct";
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
    console.log("line 1093", JSON.stringify(req.body));

    const customerDetails = JSON.parse(JSON.stringify(req.body));
    console.log("line  1096 customerDetails", customerDetails);
    for await (const customer of customerDetails) {
      console.log("line  1098 customer", customer);

      const merchantID = customer.merchantID;
      const customerID = customer.customerID;
      const loanAccountNumber = customer.loanAccountNumber || " ";
      const loanExpiryDate = customer.loanExpiryDate || " ";
      const maxLoanAmount = customer.maxLoanAmount || " ";
      const currentOutstandingAmount = customer.currentOutstandingAmount || " ";
      const totalDisbursedAmount = customer.totalDisbursedAmount || " ";
      const isDefaulter = customer.isDefaulter || " ";
      const customerName = customer.customerName;

      console.log("line 1112");

      if (!merchantID) {
        console.log(
          "Merchant ID field is empty. Please provide Merchant ID. Customer :",
          customer
        );
        continue;
      }

      if (!customerID) {
        console.log(
          "customer ID field is empty. Please provide customer ID. Customer :",
          customer
        );
        continue;
      }
      if (!customerName) {
        console.log(
          "Customer Name field is empty. Please provide Customer Name. Customer :",
          customer
        );
        continue;
      }
      let customerInfo;

      try {
        customerInfo = await contract.evaluateTransaction(
          "retrievePvCustomerMetaData",
          "C" + merchantID
        );
      } catch (error) {
        console.log({
          success: false,
          message: "Error : MerchantId " + merchantID + " does not exist",
        });
        continue;
      }
      console.log(
        `The received customer info result is: ${customerInfo.toString()}`
      );

      if (!customerInfo) {
        console.log(
          "The required information for onboarding customer not found"
        );
        continue;
      }
      let result;
      const txcNegotiatedMDR = JSON.parse(customerInfo).txcNegotiatedMDR;

      console.log("line 1153", txcNegotiatedMDR);
      const customer_properties = {
        customerID: customerID,
        merchantID: merchantID,
        loanAccountNumber: loanAccountNumber,
        loanExpiryDate: loanExpiryDate,
        maxLoanAmount: maxLoanAmount,
        currentOutstandingAmount: currentOutstandingAmount,
        totalDisbursedAmount: totalDisbursedAmount,
        isDefaulter: isDefaulter,
        customerName: customerName,
        txcNegotiatedMDR: txcNegotiatedMDR,
      };
      console.log("line 1167 ", customer_properties);
      let statefulTxn = contract.createTransaction("savePvCustomerMetaData");
      let tmapData = Buffer.from(JSON.stringify(customer_properties));
      try {
        statefulTxn.setTransient({
          customer_properties: tmapData,
        });
        console.log("line 1174 tmapData", tmapData);
        result = await statefulTxn.submit();
        console.log("line146 result", result.toString());
        customerAddedCount++;
        addedCustomerId.push(customer.customerID);
      } catch (error) {
        console.log(
          `Failed to submit transaction for saving customer ${customer} private data in CAcct : ${error} `
        );
        continue;
      }
    }

    // Disconnect from the gateway.
    await gateway.disconnect();
    console.log("line 1166 ");

    console.log("Transaction has been submitted line 1167");

    return res
      .status(200)
      .json({
        response: `Successfully Added ${customerAddedCount} Customer's with CustomerId : ${addedCustomerId}`,
      });
  } catch (error) {
    console.log(
      `Failed to submit transaction for saving customer private data in CAcct : ${error}`
    );
    console.error(
      `Failed to submit transaction for saving customer private data in CAcct : ${error}`
    );
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};
