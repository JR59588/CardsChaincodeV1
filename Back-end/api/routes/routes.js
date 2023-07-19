"use strict";

const viewTxcontroller = require("../controllers/viewTx");
const controller = require("../controllers/controller");
const merchantController = require("../controllers/merchantOnboarding");


module.exports = function (app) {

  app

    .route("/api/v1/merchantTx")

    .post(controller.requestSettlementTx); //merchant App

  // app
  //   .route("/api/v1/GetTxByRange/:roleId")

  //   .get(viewTxcontroller.GetTxByRange);

  app

    .route("/api/v1/retrievePvAODMetaData/:merchantID/:roleId")

    .get(viewTxcontroller.retrievePvAODMetaData);

  app

    .route("/api/v1/retrievePvAADMetaData/:merchantID/:roleId")

    .get(viewTxcontroller.retrievePvAADMetaData); //merchant App

  app

    .route("/api/v1/retrievePvACDMetaData/:merchantID/:roleId")

    .get(viewTxcontroller.retrievePvACDMetaData);

  // app

  //   .route("/api/v1/lookUpMerchantMetaData/:merchantID/:roleId")

  //   .get(viewTxcontroller.lookUpMerchantMetaData);

  app

    .route("/api/v1/retrieveOBMerchantData/:merchantID/:roleId")

    .get(viewTxcontroller.retrieveOBMerchantData);

  app

    .route("/api/v1/savePvAADMetaData")

    .post(merchantController.savePvAADMetaData);

  app

    .route("/api/v1/saveOBMerchantSummary")

    .post(merchantController.saveOBMerchantSummary);

  app

    .route("/api/v1/savePvACDMetaData")

    .post(merchantController.savePvACDMetaData);

  app

    .route("/api/v1/savePvAODMetaData")

    .post(merchantController.savePvAODMetaData);

  app

    .route("/api/v1/verifySubmitTx")

    .post(merchantController.verifySubmitTx);

  app

    .route("/api/v1/verifyBalanceTx")

    .post(merchantController.verifyBalanceTx);

  app

    .route("/api/v1/verifyAuthorizeTx")

    .post(merchantController.verifyAuthorizeTx);

  app

    .route("/api/v1/verifyClearTx")

    .post(merchantController.verifyClearTx);

};
