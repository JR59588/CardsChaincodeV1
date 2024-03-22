const jwt = require("jsonwebtoken");
var logger = require("../../logger");
const express = require("express");
const bodyParser = require("body-parser");
const data = require("./data.json");
const { Wallets, Gateway } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const ISO8583 = require("../iso8583");
const multer = require("multer");
const csv = require("csv-parser");
const { evaluateTransaction } = require("./utils");
const { evaluateTransactionWithEndorsingOrganizations } = require("./utils");

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
    cb(null, path.join(__dirname, "iso8583FileUploads"));
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${file.originalname}-${Date.now()}`;
    cb(null, uniqueFileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== ".csv") {
      return cb(new Error("Only csv files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

const storageWithType = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let filePath = "";
      switch (req.body.fileType) {
        case "settlementRequest":
          filePath = "SettlementRequestFiles";
          break;
        case "authorizationRequest":
          filePath = "AuthorizationRequestFiles";
          break;
        case "authorizationResponse":
          filePath = "AuthorizationResponseFiles";
          break;
        default:
          throw new Error(
            "Ensure you are using proper file type when uploading the file"
          );
      }
      cb(null, path.join(__dirname, filePath));
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueFileName = Date.now() + file.originalname;
    cb(null, uniqueFileName);
  },
});

const uploadWithType = multer({
  storage: storageWithType,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== ".csv") {
      return cb(new Error("Only csv files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

const getParsedData = (iso8583Message) => {
  var iso = new ISO8583(iso8583Message, 1);
  var data = iso.parseDataElement();
  const dataObj = data.reduce(
    (obj, item) => ({
      ...obj,
      [item.fieldName]: item.fieldValue,
    }),
    {}
  );
  console.log("Inside get parsed data: ", dataObj);
  return dataObj;
}


const getArgsArray = (msg, type, executionMode) => {

  try {

    console.log("iso 8583 message is: ", msg.iso8583Message);

    const isoData = getParsedData(msg.iso8583Message);

    if (type == "authorizationRequest") {
      return [
        msg.MerchantId,
        msg.CustomerId,
        msg.LoanReferenceNumber,
        msg.MerchantName,
        isoData.primaryAccountNumber,
        isoData.processingCode,
        isoData.transactionAmount,
        isoData.transmissionDateAndTime,
        isoData.systemsTraceAuditNumber,
        isoData.expirationDate,
        isoData.merchantCategoryCode,
        isoData.pointOfServiceEntryMode,
        isoData.acquiringInstitutionIdentificationCode,
        isoData.retrievalReferenceNumber,
        isoData.cardAcceptorTerminalIdentification,
        isoData.cardAcceptorIdentificationCode,
        isoData.cardAcceptorNameAndLocation,
        isoData.currencyCode,
        isoData.additionalDataISO,
        msg.batchNumber,
        msg.messageType,
        executionMode,
      ];
    } else if (type == "authorizationResponse") {
      return [
        msg.MerchantId,
        msg.CustomerId,
        msg.LoanReferenceNumber,
        msg.MerchantName,
        isoData.primaryAccountNumber,
        isoData.processingCode,
        isoData.transactionAmount,
        isoData.transmissionDateAndTime,
        isoData.systemsTraceAuditNumber,
        isoData.expirationDate,
        isoData.merchantCategoryCode,
        isoData.pointOfServiceEntryMode,
        isoData.acquiringInstitutionIdentificationCode,
        isoData.retrievalReferenceNumber,
        isoData.cardAcceptorTerminalIdentification,
        isoData.cardAcceptorIdentificationCode,
        isoData.cardAcceptorNameAndLocation,
        isoData.currencyCode,
        isoData.additionalDataISO,
        msg.batchNumber,
        msg.approverCode,
        isoData.authorizationIdentificationResponse,
        msg.messageType,
        executionMode
      ];
    } else if (type == "settlementRequest") {
      return [
        msg.MerchantId,
        msg.CustomerId,
        msg.LoanReferenceNumber,
        msg.MerchantName,
        // isoData.primaryAccountNumber,
        // isoData.processingCode,
        isoData.transactionAmount,
        isoData.systemsTraceAuditNumber,
        isoData.networkInternationalId,
        isoData.cardAcceptorTerminalIdentification,
        isoData.cardAcceptorIdentificationCode,
        msg.transactionCurrencyCode,
        isoData.amountNetSettlement,
        msg.batchNumber,
        msg.totalNumberOfTransactions,
        msg.messageType,
        executionMode
      ];
    }
  } catch (error) {
    console.log("Error in processing submitted ISO8583 CSV with type", error);
    return res.status(400).json({
      success: false,
      message: "Error in processing submitted ISO8583 CSV file",
    });
  }
};

exports.processISO8583CSVWithType = async function (req, res) {
  try {
    uploadWithType(req, res, function (err) {
      if (err) {
        console.log("Error uploading file: ", err);
        return res.status(400).json({
          success: false,
          message: "Error in uploading ISO8583 CSV file with type",
          reason: err.message,
        });
      } else {
        console.log("There is no error in uploading the file with type");
        console.log(
          "request body is: ",
          req.body,
          " fileType in request body is: ",
          req.body.fileType,
          " file path is: ",
          req.file.path
        );
        const executionMode = req.body.executionMode;
        const results = [];
        const responses = [];

        const orgsDataStr = fs.readFileSync(
          path.resolve(__dirname, "..", "orgsAdded.json")
        );
        console.log("Orgs data str is : ", orgsDataStr);
        const orgsData = JSON.parse(orgsDataStr);
        console.log("Orgs data is : ", orgsData);
        orgs = orgsData.orgs.map(orgData => orgData.orgId);
        console.log("Orgs are: ", orgs);

        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", async () => {
            console.log("Results after reading csv: ", results);
            let invokedFunc = "";
            let org = "";
            let endorsers = [];
            switch (req.body.fileType) {
              case "settlementRequest":
                invokedFunc = "requestX500Tx";
                // orgs = ["AAD"];
                // endorsers = ["ACDMSP", "AODMSP"]
                break;
              case "authorizationRequest":
                invokedFunc = "requestX100Tx";
                break;
              case "authorizationResponse":
                invokedFunc = "requestX110Tx";
                // orgs = ["ACD"];
                // endorsers = ["AADMSP", "AODMSP"]
                break;
              default:
                throw new Error(
                  "Ensure you are using proper message type when uploading the file"
                );
            }

            if (!orgs.includes(req.body.roleId)) {
              return res.status(400).json({
                success: false,
                message: `Please select one of these org(s) for this operation: ${orgs.join("/")}`,
              })
            }

            if (executionMode === "auto") {
              for (let i = 0; i < results.length; i++) {
                console.log("Result " + i, results[i]);

                const { error, result } = await

                  evaluateTransactionWithEndorsingOrganizations
                    // evaluateTransaction
                    (
                      req.body.roleId,
                      "channel1",
                      "PYMTUtilsCC",
                      invokedFunc,
                      getArgsArray(results[i], req.body.fileType, req.body.executionMode),
                      endorsers
                    );
                if (error) {
                  console.log("error in uploadwithtype is: ", error)
                  responses.push({
                    key: [
                      results[i].MerchantId,
                      results[i].CustomerId,
                      results[i].LoanReferenceNumber,
                      results[i].systemsTraceAuditNumber,
                    ],
                    index: i,
                    success: false,
                    result,
                  });
                } else {
                  console.log("Result in uploadwithtype is: ", result.toString())

                  responses.push({
                    key: [
                      results[i].MerchantId,
                      results[i].CustomerId,
                      results[i].LoanReferenceNumber,
                      results[i].systemsTraceAuditNumber,

                    ],
                    index: i,
                    success: true,
                    result,
                  });
                }
              }
            }


            return res.status(200).json({
              success: true,
              message: "File upload successful",
              responses,
            });
          });
      }
    });
  } catch (error) {
    console.log("Error in processing submitted ISO8583 CSV with type", error);
    return res.status(400).json({
      success: false,
      message: "Error in processing submitted ISO8583 CSV file",
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
          reason: err.message,
        });
      } else {
        console.log("Filer parser: ", req.body.executionMode);
        const executionMode = req.body.executionMode;
        const results = [];
        const responses = [];
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", async () => {
            console.log("Results after reading csv: ", results);
            for (let i = 0; i < results.length; i++) {
              const {
                merchantID,
                customerID,
                loanReferenceNumber,
                ISO8583Message,
              } = results[i];
              const settlementTxObject = makeTxObj(
                merchantID,
                customerID,
                loanReferenceNumber,
                ISO8583Message,
                executionMode ?? "manual"
              );
              console.log("Settlement Tx Object: ", settlementTxObject);
              const { error, result } = await evaluateTransaction(
                req.body.roleId,
                "channel1",
                "PYMTUtilsCC",
                "requestTx",
                [
                  settlementTxObject.MerchantId,
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
                  settlementTxObject.executionMode,
                ]
              );

              if (error) {
                responses.push({ i, success: false, result });
              } else {
                responses.push({ i, success: true, result });
              }
            }
            return res.status(200).json({
              success: true,
              message: "Successfully uploaded the ISO8583 CSV",
              responses,
            });
          });
      }
    });
  } catch (error) {
    console.log("Error in processing submitted ISO8583 CSV");
    return res.status(400).json({
      success: false,
      message: "Error in processing submitted ISO8583 CSV file",
      reason: "Something went wrong in processing the ISO8583 CSV file",
    });
  }
};

exports.requestSettlementTx = async function (req, res) {
  try {
    let org = req.body.roleId;
    const dataStr = fs.readFileSync(path.join(__dirname, "data.json"));

    const data = JSON.parse(dataStr);

    if (!data[org]) {
      res.status(400).send("Error!. Invalid role name");
    }

    let stxObj = makeTxObj(
      req.body.merchantID,
      req.body.customerID,
      req.body.loanReferenceNumber,
      req.body.ISO8583Message,
      req.body.executionMode ?? "manual"
    );

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
        message: `An identity for the organization ${org} doesn't exist in the wallet`,
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
      ccFunctionName
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
      stxObj.executionMode
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

exports.getOrgs = async function (req, res) {
  try {
    const jsonStr = fs.readFileSync(
      path.resolve(__dirname, "..", "orgsAdded.json")
    );
    const jsonObj = JSON.parse(jsonStr);

    res.status(200).json(jsonObj);
  } catch (error) {
    console.log("Error when reading organizations data: ", error);
    res.status(500).json({
      message: "There was an error fetching organization data",
    });
  }
};

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




function makeTxObj(
  merchantID,
  customerID,
  loanReferenceNumber,
  iso8583Message,
  executionMode
) {
  //TODO: change the property values of the object according to the requirements
  if (iso8583Message != undefined) {
    try {
      var iso = new ISO8583(iso8583Message, 1);
      var data = iso.parseDataElement();
      const dataObj = data.reduce(
        (obj, item) => ({
          ...obj,
          [item.fieldName]: item.fieldValue,
        }),
        {}
      );
      const iso8583Obj = { ...iso, ...dataObj };
      let localTxObj = {
        MerchantId: merchantID,
        CustomerId: customerID,
        LoanReferenceNumber: loanReferenceNumber,
        MerchantName: "Merchant Name",
        primaryAccountNumber: iso8583Obj.primaryAccountNumber,
        processingCode: iso8583Obj.processingCode,
        transactionAmount: iso8583Obj.transactionAmount,
        transmissionDateAndTime: iso8583Obj.transmissionDateAndTime,
        systemsTraceAuditNumber: iso8583Obj.systemsTraceAuditNumber,
        timeLocalTransactionHHMMSS: iso8583Obj.timeLocalTransactionHHMMSS,
        dateLocalTransactionMMDD: iso8583Obj.dateLocalTransactionMMDD,
        expirationDate: iso8583Obj.expirationDate,
        merchantCategoryCode: iso8583Obj.merchantCategoryCode,
        pointOfServiceEntryMode: iso8583Obj.pointOfServiceEntryMode,
        acquiringInstitutionIdentificationCode:
          iso8583Obj.acquiringInstitutionIdentificationCode,
        retrievalReferenceNumber: iso8583Obj.retrievalReferenceNumber,
        cardAcceptorTerminalIdentification:
          iso8583Obj.cardAcceptorTerminalIdentification,
        cardAcceptorIdentificationCode:
          iso8583Obj.cardAcceptorIdentificationCode,
        cardAcceptorNameAndLocation: iso8583Obj.cardAcceptorNameAndLocation,
        currencyCode: iso8583Obj.currencyCode,
        personalIdentificationNumber: iso8583Obj.personalIdentificationNumber,
        additionalDataPrivate: iso8583Obj.additionalDataPrivate,
        executionMode,
      };
      console.log("Constructed tx obj: ", localTxObj);
      return localTxObj;
    } catch (error) {
      console.log(
        "There was an error in decoding the ISO8583 message: ",
        error
      );
    }
  }
}
