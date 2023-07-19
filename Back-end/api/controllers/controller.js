const jwt = require("jsonwebtoken");
var logger = require("../../logger");
const express = require("express");
const bodyParser = require("body-parser");
const data = require("./data.json");
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(bodyParser.json());

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

exports.requestSettlementTx = async function (req, res) {
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
    
    //await gateway.connect(ccp, { wallet, identity: walletUser, discovery: { enabled: true, asLocalhost: true } });

    // Get the network (channel) our contract is deployed to.
    let mode = req.body.mode || "Direct" ;
    let clientMSPId = data[org].clientMSPId;
    let channelName = getChannelName(mode, clientMSPId);
    console.log("Using channel name : ", channelName);

    let contractName = "PYMTUtilsCC";
    let ccFunctionName = getFunctionName(mode, clientMSPId);
    console.log("Function name = ", ccFunctionName);

    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);

    // Submit the specified transaction.

    let stxObj = makeTxObj(req, res);

    console.log(
      "trying to add data in requestsetllmentTx for merchantId",
      stxObj.merchantId,
      ccFunctionName,
      contract

    );
    console.log("controller " ,JSON.stringify(stxObj));
    await contract.submitTransaction(
      ccFunctionName,
      stxObj.processingCode,
      stxObj.transactionAmount,
      stxObj.transmissionDateAndTime,
      stxObj.systemTraceAuditNumber,
      stxObj.localTime,
      stxObj.localDate,
      stxObj.expirationDate,
      stxObj.merchantCategoryCode,
      stxObj.posEntryMode,
      stxObj.acquiringInstitutionIdentificationCode,
      stxObj.retrievalReferenceNumber,
      stxObj.cardAcceptorTerminalIdentification,
      stxObj.cardAcceptorIdentificationCode,
      stxObj.cardAcceptorNameAndLocation,
      stxObj.currencyCode,
      stxObj.personalIdentificationNumber,
      stxObj.additionalData,
      stxObj.posData
    );
    console.log("inside requestsetllmentTx ,Transaction has been submitted");

    res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};

function getChannelName(mode, MSPId) {
  //14.02.23 todo: this logic has to be completed
  var chName ;
  // TODO: change MSPID according to the requirement
  if (mode == "PSP") {
    if (MSPId == "PSPMSP") {
      chName = "channel1";
    }
  } else {
  }
  chName = "channel1";
  return chName;
}



function getFunctionName(mode, MSPId) {
  var fnName ;
  if (mode == "PSP") {
    
      fnName = "initiateTx";
    }
   
   //direct mode requestTx
  else {
    fnName = "requestTx";
    
  }

  console.log("WARNING : Function name : " , fnName  );
  return fnName;
}

function makeTxObj(req, res) {
  //TODO: change the property values of the object according to the requirements
  let localTxObj = {
    processingCode: req.body.processingCode,
    transactionAmount: req.body.transactionAmount,
    transmissionDateAndTime: req.body.transmissionDateAndTime,
    systemTraceAuditNumber: req.body.systemTraceAuditNumber,
    localTime: req.body.localTime,
    localDate: req.body.localDate,
    expirationDate: req.body.expirationDate,
    merchantCategoryCode: req.body.merchantCategoryCode,
    posEntryMode: req.body.posEntryMode,
    acquiringInstitutionIdentificationCode: req.body.acquiringInstitutionIdentificationCode,
    retrievalReferenceNumber: req.body.retrievalReferenceNumber,
    cardAcceptorTerminalIdentification: req.body.cardAcceptorTerminalIdentification,
    cardAcceptorIdentificationCode: req.body.cardAcceptorIdentificationCode,
    cardAcceptorNameAndLocation: req.body.cardAcceptorNameAndLocation,
    currencyCode: req.body.currencyCode,
    personalIdentificationNumber: req.body.personalIdentificationNumber,
    additionalData: req.body.additionalData,
    posData: req.body.posData,

  };
  return localTxObj;
}

