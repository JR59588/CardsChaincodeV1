"use strict";

const viewTxcontroller = require("../controllers/viewTx");
const controller = require("../controllers/controller");
const merchantController = require("../controllers/merchantOnboarding");

//const aggregatorController=require('../controllers/aggregatorController')

module.exports = function (app) {
  // app

  //    .route('/api/v1/aggregator')
  //    .post(controller.aggregatorPost)

  // app

  //   .route("/api/v1/aggregatorDetails")

  //   .get(controller.addTxbyAggregator);

  // app

  //   .route("/api/v1/getsettlmentDetails")

  //   .get(controller.viewSettlementTxs);

  app

    .route("/api/v1/merchantTx")

    .post(controller.requestSettlementTx); //merchant App

  // app
  //   .route("/api/v1/getMerchantDetails")
  //   .get(controller.getSettlementTxDetails);

  app
    .route("/api/v1/GetTxByRange/:roleId")

    .get(viewTxcontroller.GetTxByRange);

  // app

  //   .route("/api/v1/validationSA")

  //   .post(controller.validateSettlementTx);

  app
    
  .route("/api/v1/verifyAcceptTx")

  .post(merchantController.verifyAcceptTx);


  app
    
  .route("/api/v1/verifySubmitTx")

  .post(merchantController.verifySubmitTx);


  app
    
  .route("/api/v1/verifyBalanceTx")

  .post(merchantController.verifyBalanceTx);


  app
    
  .route("/api/v1/verifyAccountTx")                              

  .post(merchantController.verifyAccountTx);


  app
    
  .route("/api/v1/verifyClearTx")

  .post(merchantController.verifyClearTx);


  app

  .route("/api/v1/retrievePvCustomerMetaData/:customerID/:roleId")

    .get(viewTxcontroller.retrievePvCustomerMetaData);

  app

    .route("/api/v1/retrievePvMerchantMetaData/:merchantID/:roleId")

    .get(viewTxcontroller.retrievePvMerchantMetaData); //merchant App

  app

    .route("/api/v1/retrieveEDIPvMerchantMetaData/:merchantID/:roleId")

    .get(viewTxcontroller.retrieveEDIPvMerchantMetaData);

  app

    .route("/api/v1/lookUpMerchantMetaData/:merchantID/:roleId")

    .get(viewTxcontroller.lookUpMerchantMetaData);

  app

    .route("/api/v1/retrieveOBMerchantData/:merchantID/:roleId")

    .get(viewTxcontroller.retrieveOBMerchantData);

  app

    .route("/api/v1/checkPvMerchantMetaData")

    .get(merchantController.checkPvMerchantMetaData);

  app

    .route("/api/v1/saveOBMerchantSummary")

    .post(merchantController.saveOBMerchantSummary);

  app

    .route("/api/v1/addCustomerDetails")

    .post(merchantController.saveCustomerInfo);

};
