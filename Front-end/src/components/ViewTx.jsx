import React from "react";
import { useEffect } from "react";
import { useState } from "react";
//import { message } from "antd";
import "./ViewTx.css";
import axios from "axios";
import Alert from "./Alert";
import { NotificationManager } from "react-notifications";
let UNAUTHORIZED = "Unauthorized";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
//let showVerifyDefault=true;

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

  const GetTxByRange_URL = `${apiBaseUrl}/api/v1/GetTxByRange`;
  //storing the combined response of getTxByRange & retrivePvMerchantData(only aggId) from response.
  const [transactionsData, setTransactionsData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
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
  // const [refresh, setRefresh] = useState(false);

  //loading
  const [loading, setLoading] = useState(false);

  //alert
  const [alertState, setAlertState] = useState(false);

  //loading customer
  const [loadCustomer, setLoadCustomer] = useState(false);

  //reading roleId from header
  const [updatedRoleId, setUpdatedRoleId] = useState("");
  useEffect(() => {
    setUpdatedRoleId(props.roleId);
  }, [props.roleId]);

  useEffect(() => {
    const socket = props.socket;
    if (socket) {
      socket.on("status-change", (response) => {
        console.log("Status change: ", response);
        setTransactionsData((transactionsData) => {
          const key = response.data.join("-");
          const newDataMixed = transactionsData.map((item) => {
            if (item.Key === key) {
              item.Record.TxStatus = response.status;
            }
            return item;
          });
          console.log("new data mixed: ", newDataMixed);
          return newDataMixed;
        });
        const messages = response.verifications.map((verification, index) => (
          <div key={"verification" + index}>
            <p>
              <b>{verification.org}</b>: <i>{verification.attribute}</i>
            </p>
          </div>
        ));
        NotificationManager.success(
          <div>{messages}</div>,
          "Status Updated",
          5000
        );
      });
    }
  }, [props]);

  //side Effect for loading and mixing GetTxByRange and Pvdmerchat data
  useEffect(() => {
    const orderFunc = (timestamp) => {
      const actualTime = timestamp.substring(0, 10);
      let datetime = new Date(actualTime * 1000);
      return datetime.toDateString();
    };

    if (updatedRoleId.length !== 0) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setTransactionsData([]);
          const allData = await axios.get(
            `${GetTxByRange_URL}/${updatedRoleId}`
          );
          const viewTxData = allData.data.response.map((item) => {
            return {
              ...item,
              timestamp: orderFunc(item.Record.txTimestamp),
              CID: item.Record.CustomerID,
            };
          });
          setTransactionsData(viewTxData);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          console.log(error);
          setErrorMessage(error.response.data.message);
          setAlertState(true);
        }
      };
      fetchData();
    }
  }, [updatedRoleId, GetTxByRange_URL]);
  //Modifying txId
  const txIdModify = (id) => {
    let modifiedTxId = id.slice(1, 5) + "......" + id.slice(59, 64);
    return modifiedTxId;
  };

  //CONVERTING TIMESTAMP TO DATE
  const dateFunc = (timestamp) => {
    // const actualTime = timestamp.substring(0, 10);
    let datetime = new Date(Date.parse(timestamp)); //new Date(actualTime * 1000);
    return datetime.toDateString();
  };

  //CONVERTING TIMESTAMP TO TIME
  const timeFunc = (timestamp) => {
    // const actualTime = timestamp.substring(0, 10);
    let datetime = new Date(Date.parse(timestamp)); //new Date(actualTime * 1000);
    const timeUT = datetime.toLocaleTimeString();
    // UTC = timeUT.substring(0, 12);
    return timeUT;
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
    const verificationData = transactionsData.find(
      (customer) => customer.Key === key
    );
    verifyData.customerId = verificationData.Record.CustomerId;
    verifyData.merchantId = verificationData.Record.MerchantId;
    verifyData.loanReferenceNumber = verificationData.Key.split("-")[2];
    verifyData.roleId = updatedRoleId;
    verifyData.merchantName = verificationData.Record.MerchantName;
    axios
      .post(
        `${apiBaseUrl}/api/v1/${txStageVerificationUrls[status]}`,
        verifyData,
        {
          header: { "Content-Type": "application/json" },
        }
      )
      .then((response) => {
        console.log("response for onClickVerify", response);
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(error.response.data.message);
        setAlertState(true);
      });
  };

  const getStageDisplayComponent = (
    key,
    status,
    expectedStatus,
    manualExecution
  ) => {
    if (Math.abs(txStages[status]) > txStages[expectedStatus]) {
      return "Endorsed " + txStageEndorsers[expectedStatus];
    } else if (txStages[status] + txStages[expectedStatus] === 0) {
      return "Not Endorsed " + txStageEndorsers[expectedStatus];
    } else if (txStages[status] === txStages[expectedStatus]) {
      return "Endorsed " + txStageEndorsers[expectedStatus];
    } else if (
      txStages[status] === txStages[expectedStatus] - 1 &&
      manualExecution
    ) {
      // return null;
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
      const sorted = [...transactionsData].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      console.log("sorted", sorted);
      setTransactionsData(sorted);
    }
    if (sortFor === "CID") {
      const sorted = [...transactionsData].sort((a, b) => {
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
      setTransactionsData(sorted);
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
          color: "#10005d",
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
      {alertState ? (
        <Alert msg={errorMessage} closeAlert={() => setAlertState(false)} />
      ) : null}
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
                  Transaction Ref Number
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
              {loading ? (
                loadingMsg
              ) : transactionsData.length > 0 ? (
                transactionsData.map((value, index) => {
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
                        {parseInt(value.Record.transactionAmount)}{" "}
                        {value.Record.currencyCode}
                      </td>
                      <td>
                        {value.Record["MerchantId"]}
                        <br />
                        {/* <span
                          style={{ color: "blue", cursor: "pointer" }}
                          href="#"
                          data-bs-toggle="modal"
                          data-bs-target="#myModalMD"
                          onClick={(e) => {
                            onClickMerchantId(value.Record["MerchantId"]);
                          }}
                        >
                          <u>View More</u>
                        </span> */}
                      </td>
                      {/* <td>{value.aggId}</td> */}
                      <td>{value.Record["CustomerId"]}</td>
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
                          "TxSubmitted",
                          value.Record.executionMode === "manual"
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
              ) : (
                <>
                  <tr key={"noRecords"} className="loadingR">
                    <td>No Records......</td>
                  </tr>
                </>
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
                        <h5 className="p-2" style={{ color: "#10005d" }}>
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
                        <h5 className="p-2" style={{ color: "#10005d" }}>
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
    </div>
  );
};

export default ViewTx;
