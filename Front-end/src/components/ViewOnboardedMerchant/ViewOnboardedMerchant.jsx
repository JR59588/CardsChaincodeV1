import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import Footer from "../Footer";
import "../ViewOnboardingStatic/ViewOnboardedMerchant.css";
import Loader from "./Loader/Loader";
import Authorized from "./StaticScreens/Authorized";
import NotAuthorized from "./StaticScreens/NotAuthorized";
import ViewOnboarding from "../View_Onboarding_New/ViewOnboarding";
import Alert from "../Alert";
import NewViewOnboarding from "../View_Onboarding_New/NewViewOnboarding";
const UNA = "Not Authorized";
let msg;
const NewViewOnboardingStatic = (props) => {
  const IP = props.IP;
  const [merchantId, setMerchantId] = useState("");

  const [alertState, setAlertState] = useState(false);

  const [updatedRoleId, setUpdatedRoleId] = useState();

  const [load, setLoad] = useState(false);

  const [loadAnimation, setLoadingAnimatio] = useState(false);

  const [data, setData] = useState({
    merchantName: "",
    merchantID: "",
    merchantDescription: "",
    merchantType: "",
    bnplProductTypes: "",
    merchantAccountType: "",
    txcNegotiatedMDR: "",
    txcMaxTxPerDay: "",
    txcTxCurrency: "",
    txcMaxTxAmount: "",
    txcMinTxAmount: "",
    locationsAllowed: "",
    aggName: "",
    aggID: "",
    clrOrgName: "",
    clrOrgID: "",
    isContractSigned: "",
    customerID: "",
    merchantBankCode: "",
    promoCode: "",
    merchantAccountNumber: "",
    loanExpiryDate: "",
    maxLoanAmount: "",
    currentOutstandingAmount: "",
    totalDisbursedAmount: "",
    isDefaulter: "",
    customerName: "",
    product: "",
    POSID: "",
  });

  const lookUpMerchantId = async (e) => {
    e.preventDefault();
    if (merchantId === "") {
      msg = "Merchat Id Cannot be Empty";
      setAlertState(true);
      return;
    }
    if (updatedRoleId === "Agg2") setLoad(false);
    setLoadingAnimatio(true);
    // demo purpose start
    if (updatedRoleId === "CAcct") {
      try {
        const resMerchant = await axios.get(
          `http://${props.IP}:3001/api/v1/retrievePvMerchantMetaData/${merchantId}/CAcct`
        );
        const resCAcct = await axios.get(
          `http://${props.IP}:3001/api/v1/retrievePvCustomerMetaData/C${merchantId}/CAcct`
        );
        const resOB = await axios.get(
          `http://${props.IP}:3001/api/v1/retrieveOBMerchantData/${merchantId}/CAcct`
        );

        console.log("resMerchant", resMerchant.data.response);
        console.log("resCAcct", JSON.parse(resCAcct.data.response));
        console.log("resOB", resOB.data.responseData);
        let mixedObject = {
          ...resMerchant.data.response,
          ...JSON.parse(resCAcct.data.response),
          ...resOB.data.response,
        };
        console.log(mixedObject);
        setData({
          merchantName: mixedObject.merchantName,
          merchantID: mixedObject.merchantID,
          merchantDescription: mixedObject.merchantDescription,
          merchantType: mixedObject.merchantType,
          bnplProductTypes: mixedObject.bnplProductTypes,
          merchantAccountType: mixedObject.merchantAccountType,
          txcNegotiatedMDR: mixedObject.txcNegotiatedMDR,
          txcMaxTxPerDay: mixedObject.txcMaxTxPerDay,
          txcTxCurrency: mixedObject.txcTxCurrency,
          txcMaxTxAmount: mixedObject.txcMaxTxAmount,
          txcMinTxAmount: mixedObject.txcMinTxAmount,
          locationsAllowed: mixedObject.locationsAllowed,
          aggName: mixedObject.aggName,
          aggID: mixedObject.aggID,
          clrOrgName: mixedObject.clrOrgName,
          clrOrgID: mixedObject.clrOrgID,
          isContractSigned: mixedObject.isContractSigned,
          customerID: mixedObject.customerID,
          merchantBankCode: mixedObject.merchantBankCode,
          promoCode: mixedObject.promoCode,
          merchantAccountNumber: mixedObject.merchantAccountNumber,
          loanExpiryDate: mixedObject.loanExpiryDate,
          maxLoanAmount: mixedObject.maxLoanAmount,
          currentOutstandingAmount: mixedObject.currentOutstandingAmount,
          totalDisbursedAmount: mixedObject.totalDisbursedAmount,
          isDefaulter: mixedObject.isDefaulter,
          customerName: mixedObject.customerName,
          product: mixedObject.product,
          POSID: mixedObject.POSID,
          posTerminalIDs: mixedObject.posTerminalIDs,
        });
        if (resMerchant.status === 200 && resCAcct.status === 200) {
          setTimeout(() => {
            setLoad(true);
            setLoadingAnimatio(false);
          }, 1000);
        }
      } catch (error) {
        setLoadingAnimatio(false);
        console.log(error.response);
        if (error.response.status === 401) {
          msg = "Merchant not found !";
          setAlertState(true);
        }
      }
      //demo purpose end
    } else {
      try {
        const response = await axios.get(
          ` http://${IP}:3001/api/v1/lookUpMerchantMetaData/${merchantId}/${updatedRoleId}`
        );
        console.log(response.data.response);
        const responseData = response.data.response;
        // if (response.data.response.merchantID !== merchantId) {
        //   setLoadingAnimatio(false);
        //   msg = `Merchant not found !`;
        //   setAlertState(true);
        //   return;
        // }
        setData({
          merchantName: responseData.merchantName,
          merchantID: responseData.merchantID,
          merchantDescription: responseData.merchantDescription,
          merchantType: responseData.merchantType,
          bnplProductTypes: responseData.bnplProductTypes,
          merchantCategoryCode: responseData.merchantCategoryCode,
          txcNegotiatedMDR: responseData.txcNegotiatedMDR,
          txcMaxTxPerDay: responseData.txcMaxTxPerDay,
          txcTxCurrency: responseData.txcTxCurrency,
          txcMaxTxAmount: responseData.txcMaxTxAmount,
          txcMinTxAmount: responseData.txcMinTxAmount,
          locationsAllowed: responseData.locationsAllowed,
          aggName: responseData.aggName,
          aggID: responseData.aggID,
          clrOrgName: responseData.clrOrgName,
          clrOrgID: responseData.clrOrgID,
          customerID: responseData.customerID,
          merchantBankCode: responseData.merchantBankCode,
          promoCode: responseData.promoCode,
          merchantAccountNumber: responseData.merchantAccountNumber,
          loanExpiryDate: responseData.loanExpiryDate,
          maxLoanAmount: responseData.maxLoanAmount,
          currentOutstandingAmount: responseData.currentOutstandingAmount,
          totalDisbursedAmount: responseData.totalDisbursedAmount,
          isDefaulter: responseData.isDefaulter,
          customerName: responseData.customerName,
          product: responseData.product,
          POSID: responseData.POSID,
          transactionGeographiesAllowed:
            responseData.transactionGeographiesAllowed,
          numberOfPOSTerminalsRequired:
            responseData.numberOfPOSTerminalsRequired,
          securityDeposits: responseData.securityDeposits,
          isContractSigned: responseData.isContractSigned,
          kycStatus: responseData.kycStatus,
          posTerminalIDs: responseData.posTerminalIDs,
        });
        if (response.status === 200) {
          setTimeout(() => {
            setLoad(true);
            setLoadingAnimatio(false);
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        setLoadingAnimatio(false);
        console.log(error.data.response);
        if (error.data.response.status === 400 && updatedRoleId === "Agg2") {
          msg = "You are Not Authorized to view the Merchant details";
          setAlertState(true);
        }
        if (error.response.status === 401) {
          msg = error.response.data.message;
          setAlertState(true);
        }
      }
    }
  };
  //console.log(data);
  useEffect(() => {
    setUpdatedRoleId(props.roleId);
    setLoad(false);
  }, [props.roleId]);
  const getAlertState = (state) => {
    setAlertState(state);
  };
  const onChangeHandler = (event) => {
    setLoad(false);
    setMerchantId(event.target.value);
  };
  return <></>;
};

export default NewViewOnboardingStatic;
