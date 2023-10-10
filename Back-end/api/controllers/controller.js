const jwt = require("jsonwebtoken");
var logger = require("../../logger");
const express = require("express");
const bodyParser = require("body-parser");
const data = require("./data.json");
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const ISO8583 = require("../iso8583");
const multer = require('multer');
const csv = require('csv-parser');
const { evaluateTransaction } = require("./utils");

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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'iso8583FileUploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + ".csv")
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Only csv files are allowed'))
    }
    cb(null, true)
  }
}).single('file');


exports.requestSettlementTx = async function (req, res) {
  try {
    let org = req.body.roleId;
    const dataStr = fs.readFileSync(path.join(__dirname, "data.json"));
    console.log(dataStr);
    const data = JSON.parse(dataStr);
    console.log(data);
    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    let stxObj = makeTxObj(req.body.merchantID, req.body.customerID, req.body.loanReferenceNumber, req.body.ISO8583Message);

    console.log("stxObj: ", stxObj);

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
      return res.status(400).json({
        success: false,
        message: `An identity for the organization ${org} doesn't exist in the wallet`
      });
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
    let mode = req.body.mode || "Direct";
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


    console.log(
      "trying to add data in requestsetllmentTx for merchantId",
      stxObj.MerchantId,
      ccFunctionName,
      contract

    );
    console.log("controller line no 108", JSON.stringify(stxObj));
    await contract.submitTransaction(
      ccFunctionName,
      stxObj.MerchantId,
      stxObj.CustomerId,
      stxObj.LoanReferenceNumber,
      stxObj.MerchantName,
      stxObj.primaryAccountNumber,
      stxObj.processingCode,
      stxObj.transactionAmount,
      stxObj.transmissionDateAndTime,
      stxObj.systemsTraceAuditNumber,
      stxObj.timeLocalTransactionHHMMSS,
      stxObj.dateLocalTransactionMMDD,
      stxObj.expirationDate,
      stxObj.merchantCategoryCode,
      stxObj.pointOfServiceEntryMode,
      stxObj.acquiringInstitutionIdentificationCode,
      stxObj.retrievalReferenceNumber,
      stxObj.cardAcceptorTerminalIdentification,
      stxObj.cardAcceptorIdentificationCode,
      stxObj.cardAcceptorNameAndLocation,
      stxObj.currencyCode,
      stxObj.personalIdentificationNumber,
      stxObj.additionalDataPrivate,
      stxObj.posData
    );
    console.log("inside requestsetllmentTx ,Transaction has been submitted");


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

exports.processISO8583CSV = async function (req, res) {
  try {
    upload(req, res, function (err) {
      if (err) {
        console.log("Error uploading file: ", err);
        return res.status(400).json({
          success: false,
          message: "Error in uploading ISO8583 CSV file",
          reason: err.message
        });
      } else {
        const results = [];
        const responses = [];
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            console.log("Results after reading csv: ", results);
            for (let i = 0; i < results.length; i++) {
              const { merchantID, customerID, loanReferenceNumber, ISO8583Message } = results[i];
              const settlementTxObject = makeTxObj(merchantID, customerID, loanReferenceNumber, ISO8583Message);
              console.log("Settlement Tx Object: ", settlementTxObject)
              const { error, result } = await evaluateTransaction(req.body.roleId, 'channel1', 'PYMTUtilsCC', 'requestTx',
                [settlementTxObject.MerchantId,
                settlementTxObject.CustomerId,
                settlementTxObject.LoanReferenceNumber,
                settlementTxObject.MerchantName,
                settlementTxObject.primaryAccountNumber,
                settlementTxObject.processingCode,
                settlementTxObject.transactionAmount,
                settlementTxObject.transmissionDateAndTime,
                settlementTxObject.systemsTraceAuditNumber,
                settlementTxObject.timeLocalTransactionHHMMSS,
                settlementTxObject.dateLocalTransactionMMDD,
                settlementTxObject.expirationDate,
                settlementTxObject.merchantCategoryCode,
                settlementTxObject.pointOfServiceEntryMode,
                settlementTxObject.acquiringInstitutionIdentificationCode,
                settlementTxObject.retrievalReferenceNumber,
                settlementTxObject.cardAcceptorTerminalIdentification,
                settlementTxObject.cardAcceptorIdentificationCode,
                settlementTxObject.cardAcceptorNameAndLocation,
                settlementTxObject.currencyCode,
                settlementTxObject.personalIdentificationNumber,
                settlementTxObject.additionalDataPrivate,
                settlementTxObject.posData]);

              if (error) {
                responses.push({ i, success: false, result });
              } else {
                responses.push({ i, success: true, result });
              }
            }
            return res.status(200).json({
              success: true,
              message: "Successfully uploaded the ISO8583 CSV",
              responses
            });
          });
      }

    });

  } catch (error) {
    console.log("Error in processing submitted ISO8583 CSV");
    return res.status(400).json({
      success: false,
      message: "Error in processing submitted ISO8583 CSV file",
      reason: "Something went wrong in processing the ISO8583 CSV file"
    });
  }
};

exports.getOrgs = async function (req, res) {
  try {
    const jsonStr = fs.readFileSync(path.resolve(__dirname, "..", "orgsAdded.json"));
    const jsonObj = JSON.parse(jsonStr);

    res.status(200).json(jsonObj);
  } catch (error) {
    console.log("Error when reading organizations data: ", error);
    res.status(500).json({
      message: "There was an error fetching organization data"
    });
  }

}

function getChannelName(mode, MSPId) {
  //14.02.23 todo: this logic has to be completed
  var chName;
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
  var fnName;
  if (mode == "PSP") {

    fnName = "initiateTx";
  }

  //direct mode requestTx
  else {
    fnName = "requestTx";

  }

  console.log("WARNING : Function name : ", fnName);
  return fnName;
}

function makeTxObj(merchantID, customerID, loanReferenceNumber, iso8583Message) {
  //TODO: change the property values of the object according to the requirements
  if (iso8583Message != undefined) {
    console.log("ISO8583Message:", iso8583Message);
    try {
      var iso = new ISO8583(iso8583Message, 1);
      var data = iso.parseDataElement();
      const dataObj = data.reduce((obj, item) => ({
        ...obj,
        [item.fieldName]: item.fieldValue
      }), {});
      const iso8583Obj = { ...iso, ...dataObj };
      const tempData = [merchantID, customerID, loanReferenceNumber, "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
      let localTxObj = {
        MerchantId: tempData[0],
        CustomerId: tempData[1],
        LoanReferenceNumber: tempData[2],
        MerchantName: tempData[3],
        primaryAccountNumber: iso8583Obj.primaryAccountNumber || tempData[4],
        processingCode: iso8583Obj.processingCode || tempData[5],
        transactionAmount: iso8583Obj.transactionAmount || tempData[6],
        transmissionDateAndTime: iso8583Obj.transmissionDateAndTime || tempData[7],
        systemsTraceAuditNumber: iso8583Obj.systemsTraceAuditNumber || tempData[8],
        timeLocalTransactionHHMMSS: iso8583Obj.timeLocalTransactionHHMMSS || tempData[9],
        dateLocalTransactionMMDD: iso8583Obj.dateLocalTransactionMMDD || tempData[10],
        expirationDate: iso8583Obj.expirationData || tempData[11],
        merchantCategoryCode: iso8583Obj.MerchantCategoryCode || tempData[12],
        pointOfServiceEntryMode: iso8583Obj.pointOfServiceEntryMode || tempData[13],
        acquiringInstitutionIdentificationCode: iso8583Obj.acquiringInstitutionIdentificationCode || tempData[14],
        retrievalReferenceNumber: iso8583Obj.retrievalReferenceNumber || tempData[15],
        cardAcceptorTerminalIdentification: iso8583Obj.cardAcceptorTerminalIdentification || tempData[16],
        cardAcceptorIdentificationCode: iso8583Obj.cardAcceptorIdentificationCode || tempData[17],
        cardAcceptorNameAndLocation: iso8583Obj.cardAcceptorNameAndLocation || tempData[18],
        currencyCode: iso8583Obj.currencyCode || tempData[19],
        personalIdentificationNumber: iso8583Obj.personalIdentificationNumber || tempData[20],
        additionalDataPrivate: iso8583Obj.additionalDataPrivate || tempData[21],
        posData: iso8583Obj.posData || tempData[22],
      };
      console.log("Constructed tx obj: ", localTxObj);
      return localTxObj;
    } catch (error) {
      console.log("There was an error in decoding the ISO8583 message: ", error);
    }
  }
}

