import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import Footer from "./Footer";
//import { message } from "antd";
import "./ViewTx.css";
import axios from "axios";
import Alert from "./Alert";
let UNAUTHORIZED = "Unauthorized";

//let showVerifyDefault=true;
let msg;
const ViewTx = (props) => {
  const txStages = {
    TxRequested: 0,
    TxSubmitted: 1,
    TxNotSubmitted: -1,
    TxAuthorized: 2,
    TxNotAuthorized: -2,
    TxBalanced: 3,
    TxNotBalanced: -3,
    TxCleared: 4,
    TxNotCleared: -4,
  };
  const txStageVerificationUrls = {
    TxRequested: "verifySubmitTx",
    TxSubmitted: "verifyAuthorizeTx",
    TxAuthorized: "verifyBalanceTx",
    TxBalanced: "verifyClearTx",
  };
  const txStageEndorsers = {
    TxSubmitted: "(ACD)",
    TxAuthorized: "(AAD, AOD)",
    TxBalanced: "(AOD, ACD)",
    TxCleared: "(ACD, AAD)",
  };

  const IP = props.IP;
  const socketIOClient = props.socketIOClient;
  const ENDPOINT = props.ENDPOINT;
  const GetTxByRange_URL = `http://${IP}:3001/api/v1/GetTxByRange`;
  const retrieveOBMerchantData_URL = `http://${IP}:3001/api/v1/retrieveOBMerchantData`;
  const retrievePvCustomerMetaData_URL = `http://${IP}:3001/api/v1/retrievePvCustomerMetaData`;
  //storing the combined response of getTxByRange & retrivePvMerchantData(only aggId) from response.
  const [dataMixed, setDataMixed] = useState([]);

  //storing merged responses for Merchant Details pop-up
  const [mergedMerchantData, setMergedMerchantData] = useState([]);

  //storing merger response for Customer Details Pop-up
  const [mergedCustomerData, setMergerCustomerData] = useState([]);

  //auth
  const [authorization, setAuthorization] = useState(false);

  //for displaying MerchantId in Modal
  const [mrId, setMrId] = useState("");

  //for displaying CustomerId in Modal
  const [crId, setCrId] = useState("");

  //refresh the screen on verify button
  const [refresh, setRefresh] = useState(false);

  //loading
  const [loading, setLoading] = useState(false);

  //records
  const [records, setRecords] = useState(true);

  //alert
  const [alertState, setAlertState] = useState(false);

  //sorting order
  const [sortingOrder, setSortingOrder] = useState(false);

  //loading customer
  const [loadCustomer, setLoadCustomer] = useState(false);

  //reading roleId from header
  const [updatedRoleId, setUpdatedRoleId] = useState("");
  useEffect(() => {
    setUpdatedRoleId(props.roleId);
  }, [props.roleId]);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("status-change", (response) => {
      console.log(
        "inside use effect status change - viewtx.js",
        response,
        response.data.join("-")
      );
      console.log("Data mixed: ", dataMixed);
      const key = response.data.join("-");
      const newDataMixed = dataMixed.map((item) => {
        if (item.Key == key) {
          item.Record.TxStatus = response.data.status;
          return item;
        }
      });
      setDataMixed(newDataMixed);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  //side Effect for loading and mixing GetTxByRange and Pvdmerchat data
  useEffect(() => {
    setLoading(false);
    setRefresh(false);
    setRecords(false);
    let merchantData = "";
    let timer;
    if (updatedRoleId.length !== 0) {
      const fetchData = async () => {
        try {
          const allData = await axios.get(
            `${GetTxByRange_URL}/${updatedRoleId}`
          );
          if (allData.data.response.length === 0) {
            setRecords(true);
          }
          // const mixed = [];
          // const getMerchantData = async () => {
          //   for (let i = 0; i < allData.data.response.length; i++) {
          //     let isauthorized = true;
          //     try {
          //       merchantData = await axios.get(
          //         `${retrieveOBMerchantData_URL}/${allData.data.response[i].Record.MerchantId}/${updatedRoleId}`
          //       );
          //       console.log(
          //         "merchantdata in forloop 65",
          //         merchantData,
          //         isauthorized
          //       );
          //     } catch (error) {
          //       console.log("error from merchantdata--61", error);
          //       if (error.response.status === 401) {
          //         isauthorized = false;
          //       }
          //     }
          //     mixed.push({
          //       ...allData.data.response[i],
          //       aggId: isauthorized
          //         ? merchantData.data.response.aggID
          //         : UNAUTHORIZED,
          //     });
          //   }
          //   return mixed;
          // };
          // const mixedDetails = await getMerchantData();
          // let size = Object.keys(mixedDetails).length;
          // if (size === 0) {
          //   setRecords(true);
          // }
          //for sorting---
          let mixedDate;
          const orderFunc = (timestamp) => {
            const actualTime = timestamp.substring(0, 10);
            let datetime = new Date(actualTime * 1000);
            const timeUT = datetime.toTimeString();
            let UTC = timeUT.substring(0, 8);
            localDate = datetime.toDateString();
            mixedDate = localDate + " " + UTC;
            return mixedDate;
          };
          let forSorting = [];
          for (let i = 0; i < allData.data.response.length; i++) {
            forSorting.push({
              ...allData.data.response[i],
              timestamp: orderFunc(allData.data.response[i].Record.txTimestamp),
              CID: allData.data.response[i].Record.CustomerID,
            });
          }
          timer = setTimeout(() => {
            setLoading(true);
            setDataMixed(forSorting);
            // setDataMixed(allData.data.response);
          }, 2000);
        } catch (error) {
          console.log(error);
          if (!error?.allData) {
            console.log("No Server Response");
          } else if (error.allData?.status === 400) {
            console.log("400 - GetTxByRange");
          } else if (error.allData?.status === 401) {
            console.log("Unauthorized");
          } else {
            console.log("failed - GetTxByRange");
          }
        }
      };
      fetchData();
    }
    return () => clearTimeout(timer);
  }, [updatedRoleId, refresh]);
  //Modifying txId
  const txIdModify = (id) => {
    let modifiedTxId = id.slice(1, 5) + "......" + id.slice(59, 64);
    return modifiedTxId;
  };

  //Onclick Of viewmore for merchantId
  const onClickMerchantId = async (id) => {
    setMrId(id);
    //demo purpose
    if (updatedRoleId === "CAcct") {
      try {
        const res1 = await axios.get(
          `${retrieveOBMerchantData_URL}/${id}/CAcct`
        );
        const res2 = dataMixed.find((item) => item.Record.MerchantId === id);
        //setting the combined response in data for Main table.
        setAuthorization(true);
        console.log("res1 data 137-", res1);
        console.log("res2 data 138-", res2);
        setMergedMerchantData({ ...res1.data.response, ...res2.Record });
      } catch (error) {
        console.log("error for pvMerchant 116", error);
        if (error?.response.status === 401) {
          setAuthorization(false);
          console.log("Unauthorized - PvMerchant");
        }
      }
      //demo purpose end
    } else {
      try {
        const res1 = await axios.get(
          `${retrieveOBMerchantData_URL}/${id}/${updatedRoleId}`
        );
        const res2 = dataMixed.find((item) => item.Record.MerchantId === id);
        //setting the combined response in data for Main table.
        setAuthorization(true);
        console.log("res1 data 186-", res1);
        console.log("res2 data 187-", res2);
        setMergedMerchantData({ ...res1.data.response, ...res2.Record });
      } catch (error) {
        console.log("error for pvMerchant 116", error);
        if (error?.response.status === 401) {
          setAuthorization(false);
          console.log("Unauthorized - PvMerchant");
        }
      }
    }
  };
  //console.log("mergedMerchantData",mergedMerchantData);

  //on Click of CustomerId
  const onClickCustomerId = async (id) => {
    setCrId(id);
    setLoadCustomer(true);
    try {
      const customerResponse = await axios.get(
        `${retrievePvCustomerMetaData_URL}/${id}/${updatedRoleId}`
      );
      //console.log(JSON.parse(customerResponse.data.response));
      const customerParseResponse = JSON.parse(customerResponse.data.response);

      const alldataResponse = dataMixed.find(
        (item) =>
          item.Record.MerchantId === customerParseResponse.merchantID &&
          item.Record.CustomerID === customerParseResponse.customerID
      );
      setAuthorization(true);
      setMergerCustomerData({
        ...customerParseResponse,
        ...alldataResponse.Record,
      });
      setLoadCustomer(false);
      console.log("customerParseResponse", customerParseResponse);
      console.log("alldata", alldataResponse.Record);
    } catch (error) {
      console.log(error);
      if (error?.response.status === 401) {
        if (props.roleId === "CAcct" || props.roleId === "EDI") {
          UNAUTHORIZED = "";
          setAuthorization(false);
          setLoadCustomer(false);
        } else {
          UNAUTHORIZED = "Unauthorized";
          setAuthorization(false);
          setLoadCustomer(false);
        }
      }
    }
  };

  //CONVERTING TIMESTAMP TO DATE
  let localDate;
  const dateFunc = (timestamp) => {
    const actualTime = timestamp.substring(0, 10);
    let datetime = new Date(actualTime * 1000);
    localDate = datetime.toDateString();
    return localDate;
  };

  //CONVERTING TIMESTAMP TO TIME
  let UTC;
  const timeFunc = (timestamp) => {
    const actualTime = timestamp.substring(0, 10);
    let datetime = new Date(actualTime * 1000);
    const timeUT = datetime.toLocaleTimeString();
    UTC = timeUT.substring(0, 12);
    return UTC;
  };
  // console.log( org === null ? null : org  );

  // clearing Id's
  const modalCancle = () => {
    setMrId("");
    setCrId("");
    setMergedMerchantData("");
  };

  //common Object for verifying Confirm Tx, Submit Tx, Balance Tx, Account Tx, Clear Tx
  let verifyData = {
    customerId: "",
    merchantId: "",
    loanReferenceNumber: "",
    roleId: "",
    merchantName: "",
  };

  const onClickVerify = (key, status) => {
    const verificationData = dataMixed.find((customer) => customer.Key === key);
    verifyData.customerId = verificationData.Record.CustomerId;
    verifyData.merchantId = verificationData.Record.MerchantId;
    verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
    verifyData.roleId = updatedRoleId;
    verifyData.merchantName = verificationData.Record.MerchantName;
    axios
      .post(
        `http://${IP}:3001/api/v1/${txStageVerificationUrls[status]}`,
        verifyData,
        {
          header: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        console.log("response for onClickVerify", response);
        if (response.status === 200) {
          setRefresh(true);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error?.response.status === 400) {
          msg = error.response.data.message.split(",");
          console.log(msg);
          setAlertState(true);
        }
      });
  };
  //   //Confirm Tx Verify
  //   const onClickVerifyConfirmTx = (key) => {
  //     const verificationData = dataMixed.find((customer) => customer.Key === key);
  //     console.log("verificationData--218", verificationData);
  //     verifyData.customerId = verificationData.Record.CustomerID;
  //     verifyData.merchantId = verificationData.Record.MerchantId;
  //     verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
  //     verifyData.roleId = updatedRoleId;
  //     verifyData.merchantName = verificationData.Record.MerchantName;
  //     console.log("onClickConfirmTx---208", verifyData);
  //     axios
  //       .post(`http://${IP}:3001/api/v1/verifyAcceptTx`, verifyData, {
  //         header: { "Content-Type": "application/json" },
  //       })
  //       .then((response) => {
  //         console.log("response for onClickVerifyConfirmTx --214", response);
  //         if (response.status === 200) {
  //           setRefresh(true);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         if (error?.response.status === 400) {
  //           msg = error.response.data.message.split(",");
  //           console.log(msg);
  //           setAlertState(true);
  //         }
  //       });
  //   };
  //   // Submit Tx Verify
  //   const onClickVerifySubmitTx = (key) => {
  //     const verificationData = dataMixed.find((customer) => customer.Key === key);
  //     verifyData.customerId = verificationData.Record.CustomerID;
  //     verifyData.merchantId = verificationData.Record.MerchantId;
  //     verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
  //     verifyData.roleId = updatedRoleId;
  //     verifyData.merchantName = verificationData.Record.MerchantName;
  //     console.log("onClickVerifySubmitTx---239", verifyData);
  //     console.log(dataMixed);
  //     axios
  //       .post(`http://${IP}:3001/api/v1/verifySubmitTx`, verifyData, {
  //         header: { "Content-Type": "application/json" },
  //       })
  //       .then((response) => {
  //         console.log("response for onClickVerifySubmitTx --245", response);
  //         if (response.status === 200) {
  //           setRefresh(true);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         if (error?.response.status === 400) {
  //           msg = error.response.data.message;
  //           setAlertState(true);
  //         }
  //       });
  //   };
  //   //Balance Tx Verify
  //   const onClickVerifyBalanceTx = (key) => {
  //     const verificationData = dataMixed.find((customer) => customer.Key === key);
  //     verifyData.customerId = verificationData.Record.CustomerID;
  //     verifyData.merchantId = verificationData.Record.MerchantId;
  //     verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
  //     verifyData.roleId = updatedRoleId;
  //     verifyData.merchantName = verificationData.Record.MerchantName;
  //     console.log("onClickVerifySubmitTx---250", verifyData);
  //     axios
  //       .post(`http://${IP}:3001/api/v1/verifyBalanceTx`, verifyData, {
  //         header: { "Content-Type": "application/json" },
  //       })
  //       .then((response) => {
  //         console.log("response for onClickVerifyBalanceTx --276", response);
  //         if (response.status === 200) {
  //           setRefresh(true);
  //         }
  //       })
  //       .catch((error) => {
  //         if (error?.response.status === 400) {
  //           msg = error.response.data.message;
  //           setAlertState(true);
  //         }
  //         console.log(error);
  //       });
  //   };
  //   //Account Tx Verify
  //   const onClickVerifyAccountTx = (key) => {
  //     const verificationData = dataMixed.find((customer) => customer.Key === key);
  //     verifyData.customerId = verificationData.Record.CustomerID;
  //     verifyData.merchantId = verificationData.Record.MerchantId;
  //     verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
  //     verifyData.roleId = updatedRoleId;
  //     verifyData.merchantName = verificationData.Record.MerchantName;
  //     console.log("onClickVerifyAccountTx---301", verifyData);
  //     axios
  //       .post(`http://${IP}:3001/api/v1/verifyAccountTx`, verifyData, {
  //         header: { "Content-Type": "application/json" },
  //       })
  //       .then((response) => {
  //         console.log("response for onClickVerifyAccountTx --307", response);
  //         if (response.status === 200) {
  //           setRefresh(true);
  //         }
  //       })
  //       .catch((error) => {
  //         if (error?.response.status === 400) {
  //           msg = error.response.data.message;
  //           setAlertState(true);
  //         }
  //         console.log(error);
  //       });
  //   };
  //   //Clear Tx Verify
  //   const onClickVerifyClearTx = (key) => {
  //     const verificationData = dataMixed.find((customer) => customer.Key === key);
  //     verifyData.customerId = verificationData.Record.CustomerID;
  //     verifyData.merchantId = verificationData.Record.MerchantId;
  //     verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
  //     verifyData.roleId = updatedRoleId;
  //     verifyData.merchantName = verificationData.Record.MerchantName;
  //     console.log("onClickVerifyClearTx---332", verifyData);
  //     axios
  //       .post(`http://${IP}:3001/api/v1/verifyClearTx`, verifyData, {
  //         header: { "Content-Type": "application/json" },
  //       })
  //       .then((response) => {
  //         console.log("response for onClickVerifyClearTx --338", response);
  //         if (response.status === 200) {
  //           setRefresh(true);
  //         }
  //       })
  //       .catch((error) => {
  //         if (error?.response.status === 400) {
  //           msg = error.response.data.message;
  //           setAlertState(true);
  //         }
  //         console.log(error);
  //       });
  //   };

  const getAlertState = (state) => {
    setAlertState(state);
  };

  const getStageDisplayComponent = (key, status, expectedStatus) => {
    if (Math.abs(txStages[status]) > txStages[expectedStatus]) {
      return "Endorsed " + txStageEndorsers[expectedStatus];
    } else if (txStages[status] + txStages[expectedStatus] == 0) {
      return "Not Endorsed " + txStageEndorsers[expectedStatus];
    } else if (txStages[status] === txStages[expectedStatus]) {
      return "Endorsed " + txStageEndorsers[expectedStatus];
    } else if (txStages[status] === txStages[expectedStatus] - 1) {
      return (
        <button
          className="verifyButton"
          onClick={() => onClickVerify(key, status)}
        >
          Execute
        </button>
      );
    } else {
      return "-";
    }
  };

  const sorting = (sortFor) => {
    if (sortFor === "txDateTime") {
      const sorted = [...dataMixed].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      console.log("sorted", sorted);
      setDataMixed(sorted);
    }
    if (sortFor === "CID") {
      const sorted = [...dataMixed].sort((a, b) => {
        const numA = parseInt(a.CID.match(/\d+/)[0]);
        const numB = parseInt(b.CID.match(/\d+/)[0]);
        if (numA < numB) {
          return 1;
        }
        if (numA > numB) {
          return -1;
        }
        return 0;
      });
      console.log("sorted", sorted);
      setDataMixed(sorted);
    }
  };
  const loadingMsg = (
    <tr
      key={"loadingMsg"}
      style={{ border: "none", backgroundColor: "white" }}
      className="loadingRecords"
    >
      <td
        style={{
          color: "green",
          border: "none",
          backgroundColor: "transparent",
        }}
        className="msgLoader"
      >
        Loading Submitted Transactions...
      </td>
      <td className="loader" style={{ marginTop: "7px" }}></td>
    </tr>
  );
  return (
    <div className="mainDiv">
      {/* <div className="container"> */}
      {alertState ? <Alert getAlertState={getAlertState} msg={msg} /> : null}
      <div
        className="col-md-12"
        style={{ paddingLeft: "30px", paddingRight: "30px" }}
      >
        <h5 style={{ textAlign: "center", marginTop: "20px" }}>
          View Sales & Returns (S/R) Requests
        </h5>
        {/* Table */}

        <div className="mt-3 table-responsive tableDiv" id="tableRes">
          <table
            className="table table-striped table-hover table-bordered"
            id="myTable"
          >
            <thead className="table-primary">
              <tr>
                <th scope="col" colSpan="1" className="fontSize">
                  No
                </th>
                <th scope="col" colSpan="3" className="fontSize">
                  S/R Txns Summary (Hyperledger)
                </th>
                <th scope="col" colSpan="5" className="fontSize">
                  S/R Submission Details
                </th>
                <th scope="col" colSpan="5" className="fontSize">
                  S/R Txn Verification Summary
                </th>
              </tr>
              <tr>
                <th scope="col" className="fontSize"></th>
                <th
                  style={{ cursor: "pointer" }}
                  scope="col"
                  className="fontSize"
                  onClick={() => sorting("txDateTime")}
                >
                  S/R Txn Date
                </th>
                <th scope="col" className="fontSize">
                  S/R Txn ID
                </th>
                <th scope="col" className="fontSize">
                  S/R Txn Status
                </th>
                <th scope="col" className="fontSize">
                  S/R Txn Amount
                </th>
                <th scope="col" className="fontSize">
                  Merchant <br />
                  Details
                </th>
                <th
                  style={{ cursor: "pointer" }}
                  scope="col"
                  className="fontSize"
                  onClick={() => sorting("CID")}
                >
                  Customer <br />
                  Account Details
                </th>
                <th scope="col" className="fontSize">
                  Loan Ref Number
                </th>
                <th scope="col" className="fontSize">
                  Submission Date
                </th>
                <th scope="col" className="fontSize">
                  Submit S/R Txn (PSP)
                </th>
                <th scope="col" className="fontSize">
                  Authorize S/R Txn (ACD)
                </th>
                <th scope="col" className="fontSize">
                  Balance S/R Txn (AAD)
                </th>
                <th scope="col" className="fontSize">
                  Clear S/R Txn (AOD)
                </th>
              </tr>
            </thead>
            <tbody>
              {dataMixed.length !== 0 && loading ? (
                dataMixed.map((value, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {dateFunc(value.Record["txTimestamp"])} <br />
                        {timeFunc(value.Record["txTimestamp"])}
                      </td>
                      <td>
                        <abbr title={value.Record["txID"]}>
                          {txIdModify(value.Record["txID"])}
                        </abbr>
                      </td>
                      <td>{value.Record["TxStatus"]}</td>
                      <td>
                        {value.Record["TransactionAmount"]}{" "}
                        {value.Record["TransactionCurrency"]}
                      </td>
                      <td>
                        {value.Record["MerchantId"]}
                        <br />
                        <span
                          style={{ color: "blue", cursor: "pointer" }}
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#myModalMD"
                          onClick={(e) => {
                            onClickMerchantId(value.Record["MerchantId"]);
                          }}
                        >
                          <u>View More</u>
                        </span>
                      </td>
                      {/* <td>{value.aggId}</td> */}
                      <td>
                        <strong>{value.Record["CustomerId"]}</strong> <br />
                        <span
                          style={{ color: "blue", cursor: "pointer" }}
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#myModalCD"
                          onClick={() =>
                            onClickCustomerId(value.Record["CustomerId"])
                          }
                        >
                          <u>View More</u>
                        </span>
                      </td>
                      <td>{value.Record["LoanReferenceNumber"]}</td>
                      <td>
                        {value.Record["SubmissionDate"] === "" ||
                        value.Record["SubmissionDate"] === null ||
                        !value.Record["SubmissionDate"] ? (
                          <span>NA</span>
                        ) : (
                          value.Record["SubmissionDate"]
                        )}
                      </td>
                      <td>
                        {getStageDisplayComponent(
                          value.Key,
                          value.Record.TxStatus,
                          "TxSubmitted"
                        )}
                      </td>
                      <td>
                        {getStageDisplayComponent(
                          value.Key,
                          value.Record.TxStatus,
                          "TxAuthorized"
                        )}
                      </td>
                      <td>
                        {getStageDisplayComponent(
                          value.Key,
                          value.Record.TxStatus,
                          "TxBalanced"
                        )}
                      </td>
                      <td>
                        {getStageDisplayComponent(
                          value.Key,
                          value.Record.TxStatus,
                          "TxCleared"
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : records ? (
                <>
                  <tr key={"noRecords"} className="loadingR">
                    <td>No Records......</td>
                  </tr>
                </>
              ) : (
                loadingMsg
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/*  Modal for Merchant Details */}

      <div className="modal" id="myModalMD">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Merchant Details-{mrId}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={modalCancle}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ overflow: "auto" }}>
                <table
                  className="table table-striped table-hover table-bordered"
                  style={{ width: "1800px" }}
                >
                  <thead className="table-primary">
                    <tr>
                      <th scope="col" colSpan="1" className="fontSize">
                        No
                      </th>
                      <th scope="col" colSpan="2" className="fontSize">
                        Merchant Onboarding Summary
                      </th>
                      <th scope="col" colSpan="5" className="fontSize">
                        Merchant Details
                      </th>
                      <th scope="col" colSpan="3" className="fontSize">
                        S/R Transaction Criteria
                      </th>
                      <th scope="col" colSpan="3" className="fontSize">
                        Other details
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="fontSize"></th>
                      <th scope="col" className="fontSize">
                        Onboarding Date
                      </th>
                      <th scope="col" className="fontSize">
                        Merchant Name
                      </th>
                      <th scope="col" className="fontSize">
                        Merchant ID
                      </th>
                      <th scope="col" className="fontSize">
                        Type
                      </th>
                      <th scope="col" className="fontSize">
                        Product Type
                      </th>
                      <th scope="col" className="fontSize">
                        Description
                      </th>
                      <th scope="col" className="fontSize">
                        Signed
                        <br />
                        Contract
                      </th>
                      <th scope="col" className="fontSize">
                        Txn Limit <br />
                        (Max Per Day)
                      </th>
                      <th scope="col" className="fontSize">
                        Txn Amount <br />
                        (Min - Max)
                      </th>
                      <th scope="col" className="fontSize">
                        Txn <br /> Currency
                      </th>
                      <th scope="col" className="fontSize">
                        Aggregator ID
                      </th>
                      <th scope="col" className="fontSize">
                        Clearing Org-ID
                      </th>
                      <th scope="col" className="fontSize">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {authorization && mergedMerchantData.length !== 0 ? (
                      <tr>
                        <td>1</td>
                        <td>
                          {dateFunc(mergedMerchantData.txTimestamp)}
                          <br />
                          {timeFunc(mergedMerchantData.txTimestamp)}
                        </td>
                        <td>{mergedMerchantData.merchantName}</td>
                        <td>{mergedMerchantData.MerchantId}</td>
                        <td>{mergedMerchantData.merchantType}</td>
                        <td>{mergedMerchantData.bnplProductTypes}</td>
                        <td>{mergedMerchantData.merchantDescription}</td>
                        <td>{mergedMerchantData.isContractSigned}</td>
                        <td>{mergedMerchantData.txcMaxTxPerDay}</td>
                        <td>
                          {mergedMerchantData.txcMinTxAmount}-
                          {mergedMerchantData.txcMaxTxAmount}
                        </td>
                        <td>{mergedMerchantData.txcTxCurrency}</td>
                        <td>{mergedMerchantData.aggID}</td>
                        <td>{mergedMerchantData.clrOrgID}</td>
                        <td>{mergedMerchantData.Location}</td>
                      </tr>
                    ) : !authorization ? (
                      <tr>
                        <td>1</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                      </tr>
                    ) : (
                      <div style={{ display: "flex" }}>
                        <h5 className="p-2" style={{ color: "green" }}>
                          Loading...
                        </h5>
                        <div className="loader"></div>
                      </div>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={modalCancle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal design for Customer Details */}

      <div className="modal" id="myModalCD">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Customer Account Details-{crId}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={modalCancle}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ overflow: "auto" }}>
                <table
                  className="table table-striped table-hover table-bordered"
                  style={{ width: "1600px" }}
                >
                  <thead className="table-primary">
                    <tr>
                      <th scope="col" colSpan="1" className="fontSize">
                        No
                      </th>
                      <th scope="col" colSpan="2" className="fontSize">
                        Customer Profile
                      </th>
                      <th scope="col" colSpan="4" className="fontSize">
                        LOC Details
                      </th>
                      {/* <th scope="col" colSpan="3" className="fontSize">
                        Disbursement Details
                      </th> */}
                      {/* <th scope="col" colSpan="1" className="fontSize"></th> */}
                      <th scope="col" colSpan="4" className="fontSize">
                        Other details
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="fontSize"></th>
                      <th scope="col" className="fontSize">
                        Customer <br /> ID
                      </th>
                      <th scope="col" className="fontSize">
                        Customer <br />
                        Name
                      </th>
                      <th scope="col" className="fontSize">
                        LOC <br /> Acct No
                      </th>
                      <th scope="col" className="fontSize">
                        LOC Approval <br />
                        Date
                      </th>
                      <th scope="col" className="fontSize">
                        LOC Authorised
                        <br /> Amount
                      </th>
                      <th scope="col" className="fontSize">
                        Loan <br /> Status
                      </th>
                      <th scope="col" className="fontSize">
                        Negotiated <br /> MDR
                      </th>
                      <th scope="col" className="fontSize">
                        Clearing <br /> Amount
                      </th>
                      <th scope="col" className="fontSize">
                        Is <br />
                        Defaulter?
                      </th>
                      <th scope="col" className="fontSize">
                        Merchant ID <br />
                        (Name)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* comment starts */}
                    {/* <tr>
                      <td>1</td>
                      <td>
                        12-01-23 <br /> 13:56:00
                      </td>
                      <td>
                        abcde9999 <br /> 9…....... <br /> abfgh8888
                      </td>
                      <td>
                        C101 <br />
                        (John Doe)
                      </td>
                      <td>
                        M101 <br />
                        (Banana Inc) <br />
                        <br />{" "}
                      </td>
                      <td>12345678910</td>
                      <td>dd/mm/yyy</td>
                      <td>10,000 USD</td>
                      <td>1000 USD</td>
                      <td>200 USD</td>
                      <td>N</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr> */}
                    {/* comment ends */}
                    {loadCustomer ? (
                      <tr>
                        <td>loading....</td>
                      </tr>
                    ) : authorization && mergedCustomerData.length !== 0 ? (
                      <tr>
                        <td>1</td>
                        <td>{mergedCustomerData.CustomerID}</td>
                        <td>{mergedCustomerData.CustomerName}</td>
                        <td>{mergedCustomerData.LoanAccountNumber}</td>
                        <td>{mergedCustomerData.DateofLoanApproval}</td>
                        <td>{mergedCustomerData.LoCAvailableamount}</td>
                        <td>{mergedCustomerData.LoanStatus}</td>
                        <td>{mergedCustomerData.txcNegotiatedMDR}</td>
                        <td>{mergedCustomerData.txSettledMDR}</td>
                        <td>
                          {mergedCustomerData.isDefaulter === ""
                            ? "No"
                            : mergedCustomerData.isDefaulter}
                        </td>
                        <td>
                          {mergedCustomerData.merchantID} <br />{" "}
                          {mergedCustomerData.MerchantName}
                        </td>
                      </tr>
                    ) : !authorization ? (
                      <tr>
                        <td>1</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                        <td>{UNAUTHORIZED}</td>
                      </tr>
                    ) : (
                      <div style={{ display: "flex" }}>
                        <h5 className="p-2" style={{ color: "green" }}>
                          Loading...
                        </h5>
                        <div className="loader"></div>
                      </div>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={modalCancle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
      <Footer />
    </div>
  );
};

export default ViewTx;
