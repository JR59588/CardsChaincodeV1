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

    //console.log("line no 110---------",JSON.stringify(req.body));
    // console.log(req.params)

    // IsMerchantContractSigned: isMerchantContractSigned,

    console.log(
      "trying to add data in requestsetllmentTx for merchantId",
      stxObj.merchantId,
      ccFunctionName,
      contract

    );
    console.log("controller line no 108" ,JSON.stringify(stxObj));
    await contract.submitTransaction(
      ccFunctionName,
      stxObj.merchantId,
      stxObj.CustomerID,
      stxObj.LoanReferenceNumber,
      stxObj.merchantName,
      stxObj.CustomerName,
      stxObj.TransactionCurrency,
      stxObj.TransactionAmount,
      stxObj.TransactionReferenceNumber,
      stxObj.TransactionDate,
      stxObj.ProductType,
      stxObj.DateofLoanApproval,
      stxObj.LoanDisbursementDate,
      stxObj.LoanAmount,
      stxObj.LoanTenure,
      stxObj.LoanStatus,
      stxObj.LoanAccountNumber,
      stxObj.LoCapprovedamount,
      stxObj.LoCAvailableamount,
      stxObj.isContractSigned,
      stxObj.Location,
      stxObj.POSEntryMode,
      stxObj.SubmittedBy,
      stxObj.SubmissionNumber,
      stxObj.ServiceDate,
      stxObj.SubmissionDate
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
  if (mode == "Aggregator") {
    if (MSPId == "Org1MSP") {
      chName = "channel1";
    }
  } else {
  }
  chName = "channel1";
  return chName;
}



function getFunctionName(mode, MSPId) {
  var fnName ;
  if (mode == "Aggregator") {
    
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
  let localTxObj = {
    merchantId: req.body.merchantId,
    merchantName: req.body.merchantName,
    CustomerName: req.body.CustomerName,
    CustomerID: req.body.CustomerID,
    TransactionCurrency: req.body.TransactionCurrency,
    TransactionAmount: req.body.TransactionAmount,
    TransactionReferenceNumber: req.body.TransactionReferenceNumber,
    TransactionDate: req.body.TransactionDate,
    LoanReferenceNumber: req.body.LoanReferenceNumber,
    DateofLoanApproval: req.body.DateofLoanApproval,
    SubmittedBy: req.body.SubmittedBy,
    SubmissionNumber: req.body.SubmissionNumberRef,
    ServiceDate: req.body.ServiceDate,
    SubmissionDate: req.body.SubmissionDateTime,
    LoanAccountNumber: req.body.LoanAccountNumber,
    isContractSigned: req.body.isContractSigned
      ? req.body.isContractSigned
      : true,
    Location: req.body.Location,
    POSEntryMode: req.body.POSEntryMode,

    ProductType: req.body.ProductType || "",
    LoanAmount: req.body.LoanAmount || "",
    LoanTenure: req.body.LoanTenure || "",
    LoanDisbursementDate: req.body.LoanDisbursementDate || "",
    LoanStatus: req.body.LoanStatus || "Pending",
    LoCapprovedamount: req.body.LoCapprovedamount || "",
    LoCAvailableamount: req.body.LoCAvailableamount || "",

  };
  return localTxObj;
}







/** 
exports.getSettlementTxDetails = async function (req, res) {
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
    try {
      await gateway.connect(ccp, {
        wallet,
        identity: data[org].userWallet,
        discovery: { enabled: true, asLocalhost: true },
      });
    } catch (error) {
      console.log(error);
    }

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);

    const merchantId = req.body.merchantId;
    const CustomerID = req.body.CustomerID;
    const LoanReferenceNumber = req.body.LoanReferenceNumber;
    if (!merchantId || !CustomerID || !LoanReferenceNumber) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    const result = await contract.evaluateTransaction(
      "getSettlementTxDetails",
      merchantId,
      CustomerID,
      LoanReferenceNumber
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: result.toString() });

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error });
  }
};
*/

/** 
exports.validateSettlementTx = async function (req, res) {
  try {
    let ccp = JSON.parse(fs.readFileSync(ccpPathOrg2, "utf8"));
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "walletorg2");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(walletUser_org2);
    if (!identity) {
      console.log(
        "An identity for the user" +
          walletUser_org2 +
          "does not exist in the wallet"
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: walletUser_org2,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(contractName);

    const merchantId = req.body.merchantId;
    const CustomerID = req.body.CustomerID;
    const LoanReferenceNumber = req.body.LoanReferenceNumber;
    if (!merchantId || !CustomerID || !LoanReferenceNumber) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be processed.Please provide valid inputs",
      });
    }
    const result = await contract.submitTransaction(
      "validateSettlementTx",
      merchantId,
      CustomerID,
      LoanReferenceNumber
    );
    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );
    res.status(200).json({ response: result.toString() });

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error });
  }
};
*/

/*exports.aggregatorPost= async function (req, res) {
  const data=req.body
    try {
     
      // Submit the specified transaction.
     
      const merchantId = req.body.merchantId
      const merchantName = req.body.merchantName
      const merchantDescription= req.body.merchantDescription
      const product= req.body.product
      const merchantAccountNumber= req.body.merchantAccountNumber 
      const aggregatorName= req.body.aggregatorName
      const aggregatorID = req.body.aggregatorID
      const numberofTransactionsperday= req.body.numberofTransactionsperday
      const currency= req.body.currency
      const minimumTransactionAmount= req.body.minimumTransactionAmount
      const maximumTransactionAmount=req.body.maximumTransactionAmount
      const locationsAllowed=req.body.locationsAllowed
      const negotiatedMDR=req.body.negotiatedMDR
      const clearingOrganisationName=req.body.clearingOrganisationName
      const clearingOrgID= req.body.clearingOrgID
      const merchantType= req.body.merchantType
      //const contractsignedwithMerchant= req.body.contractsignedwithMerchant
      const contractsignedwithMerchant = req.body.isContractSigned ? req.body.isContractSigned : true;
    
  
  console.log(JSON.stringify(req.body));
  console.log(req.params)
      if (
        
        !merchantId ||
        !merchantName ||
        !merchantDescription ||
        !merchantType ||
        !product ||
        !merchantAccountNumber ||
        !aggregatorName ||
        !aggregatorID ||
        !numberofTransactionsperday ||
        !currency ||
        !minimumTransactionAmount ||
        !maximumTransactionAmount ||
        !locationsAllowed ||
        !negotiatedMDR ||
        !clearingOrganisationName ||
        !clearingOrgID ||
        !contractsignedwithMerchant 
      )
          {
        return res.status(400).json({
          success: false,
          message: "Request cannot be processed.Please provide valid inputs",
        });
      }
      // await contract.submitTransaction('aggregatorPost', 
      // merchantId,
      // merchantName,
      // merchantDescription,
      // merchantType,
      // product,
      // merchantAccountNumber,
      // aggregatorName,
      // aggregatorID,
      // numberofTransactionsperday,
      // currency,
      // minimumTransactionAmount,
      // maximumTransactionAmount,
      // locationsAllowed,
      // negotiatedMDR,
      // clearingOrganisationName,
      // clearingOrgID,
      // contractsignedwithMerchant,
      // )

  const AggregatorData={

    merchantName,
    merchantId,
    merchantDescription,
    merchantType,
    product,
    merchantAccountNumber,
    aggregatorName,
    aggregatorID,
    numberofTransactionsperday,
    currency,
    minimumTransactionAmount,
    maximumTransactionAmount,
    locationsAllowed,
    negotiatedMDR,
    clearingOrganisationName,
    clearingOrgID,
    contractsignedwithMerchant
    }

    const addData=new aggregator_schema(AggregatorData)
    await addData.save();

      console.log('Transaction has been submitted');
      res.status(200).json({
        success: true,
        message: addData,
        
      });
  
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      return res.status(400).json({
        success: false,
        message: "Error"+error,
      });
  }
  } */

/**
exports.addTxbyAggregator = async function (req, res) {
  try {
    // let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // // Create a new file system based wallet for managing identities.

    // const walletPath = path.join(process.cwd(), 'wallet');

    // const wallet = await Wallets.newFileSystemWallet(walletPath);

    // console.log(`Wallet path: ${walletPath}`);

    // // Check to see if we've already enrolled the user.

    // const identity = await wallet.get(walletUser);

    // if (!identity) {

    //     console.log("An identity for the user" + walletUser +"does not exist in the wallet");

    //     console.log('Run the registerUser.js application before retrying');

    //     return;
    // }

    // // Create a new gateway for connecting to our peer node.

    // const gateway = new Gateway();
    // await gateway.connect(ccp, { wallet, identity: walletUser, discovery: { enabled: true, asLocalhost: true } });

    // // Get the network (channel) our contract is deployed to.

    // const network = await gateway.getNetwork(channelName);

    // // Get the contract from the network.

    // const contract = network.getContract(contractName);

    // Submit the specified transaction.

    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')

    // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')

    const data = {};

    data.merchantId = req.body.merchantId;
    data.merchantName = req.body.merchantName;
    data.merchantDescription = req.body.merchantDescription;
    data.merchantType = req.body.merchantType;
    data.merchantAccountNumber = req.body.merchantAccountNumber;
    data.AggregatorName = req.body.AggregatorName;
    data.AggregatorID = req.body.AggregatorID;
    data.ProductType = req.body.ProductType;
    data.numberOfTransactions = req.body.numberOfTransactions;
    data.Currency = req.body.Currency;
    data.minimumTransaction = req.body.minimumTransaction;

    //Change the contract function name and the inputs inside according to the contract

    // await contract.addtxMerchant('addtxMerchant', ctx,

    // merchantId,
    // merchantName,
    // CustomerName,
    // CustomerID,
    // TransactionCurrency,
    // TransactionAmount,
    // TransactionReferenceNumber,
    // TransactionDate,
    // LoanReferenceNumber,
    // ProductType,
    // DateofLoanApproval,
    // LoanDisbursementDate,
    // LoanAmount,
    // LoanTenure,
    // LoanStatus,
    // LoanAccountNumber,
    // LoCapprovedamount,
    // LoCAvailableamount,
    // isContractSigned);

    logger.info("Merchant onboarding info :" + data);
    res.status(200).json({
      success: true,
      message: "Transaction has been submitted",
    });
    // Disconnect from the gateway.

    //await gateway.disconnect();
  } catch (error) {
    console.log(`Failed to submit transaction: ${error}`);
    return res.status(400).json({
      success: false,
      message: "Error" + error,
    });
  }
};
 */

/**
exports.viewSettlementTxs = async function (req, res) {
  try {
    //   let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    //   // Create a new file system based wallet for managing identities.
    //   const walletPath = path.join(process.cwd(), 'walletorg2');
    //   const wallet = await Wallets.newFileSystemWallet(walletPath);
    //   console.log(`Wallet path: ${walletPath}`);

    //   // Check to see if we've already enrolled the user.
    //   const identity = await wallet.get(walletUser_org2);
    //   if (!identity) {
    //       console.log("An identity for the user" + walletUser_org2 + "does not exist in the wallet");
    //       console.log('Run the registerUser.js application before retrying');

    //       return;

    //   }

    //   // Create a new gateway for connecting to our peer node.
    //   const gateway = new Gateway();
    //   await gateway.connect(ccp, { wallet, identity: walletUser_org2, discovery: { enabled: true, asLocalhost: true } });

    //   // Get the network (channel) our contract is deployed to.

    //   const network = await gateway.getNetwork(channelName);

    //   // Get the contract from the network.

    //   const contract = network.getContract(contractName);

    //   //Uncomment this code after contract code is finished.

    //   //Rename the function name and also enter the inputs if needed.

    //   //This is just put as a placeholder

    //   //const result = await contract.getTxDetails('getTxDetails');

    //   //res.status(200).json({response: result.toString()});

    console.log(exampleData);

    res.status(200).json({ response: exampleData });

    // Disconnect from the gateway.

    //await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    res.status(500).json({ error: error });
  }
};
 */
