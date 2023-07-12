import React, { useEffect } from "react";
import Footer from "../Footer";
import "../Merchant.css";
import { useState } from "react";
import axios from "axios";
import SuccessModal from "../SuccessModal/SuccessModal";

const message ='Response 200: S/R Request Submitted'
const header='S/R Request Submitted Succesfully...'
let failureMsg='Invalid'
let failureHead="Invalid"
const SubmitForm = (props) => {
  const merchantTx_URL = `http://${props.IP}:3001/api/v1/merchantTx`;
  const [formFile, setFormFile] = useState("radio1");

  //setting role message
  const [roleMsg, setRoleMsg] = useState(false);

  //loading
  const [loading, setLoading] = useState(false);

   //success Modal
   const [modal, setModal] = useState(false);

   //failure Modal
   const[failureModal,setFailureModal]=useState(false)

  //const [file,setFile] =useState(false)
  const [txFormData, setTxFormData] = useState({
    merchantId: "",
    merchantName: "",
    CustomerName: "",
    CustomerID: "",
    TransactionCurrency: "",
    TransactionAmount: "",
    TransactionReferenceNumber: "",
    TransactionDate: "",
    LoanReferenceNumber: "",
    ProductType: "",
    DateofLoanApproval: "",
    Location: "",
    POSEntryMode: "",
    LoanDisbursementDate: "",
    LoanAmount: "",
    LoanTenure: "",
    LoanStatus: "",
    LoanAccountNumber: "",
    LoCapprovedamount: "",
    LoCAvailableamount: "",
    isContractSigned: "",
    SubmittedBy: "",
    SubmissionNumberRef: "",
    ServiceDate: "",
    SubmissionDateTime: "",
    roleId: props.roleId,
  });

  //Handeling the onchange values.
  const onChangeHandel = (e) => {
    setTxFormData({ ...txFormData, [e.target.name]: e.target.value });
  };

  //reading roleId from header
  useEffect(() => {
    txFormData.roleId = props.roleId;
  }, [props.roleId]);

  //submiting form
  const SubmitMerchant = (event) => {
    setLoading(true);
    event.preventDefault();

    //roleId
    if (props.roleId.length !== 0) {
      console.log(txFormData);
      setRoleMsg(false);
      axios
        .post(merchantTx_URL, txFormData, {
          header: { "Content-Type": "application/json" },
        })
        .then((response) => {
          console.log(response);
          setLoading(false);
          setModal(true)
          // alert("Response 200: S/R Request Submitted");
        })

        .catch((err) => {
          console.log(err.response);
          setLoading(false);

          if (!err?.response) {
            console.log("No Server Response");
          } else if (err.response?.status === 400) {
            console.log(err.message);
            failureHead='Transaction Failed...'
            failureMsg ="Response 400:Transaction Failed / fields should not be empty"
            setFailureModal(true)
          } else if (err.response?.status === 401) {
            console.log("Unauthorized");
            failureHead='Unauthorized'
            failureMsg='Invalid role / fields must not be empty'
            setFailureModal(true)
          } else {
            console.log("error");
          }
        });
    } else {
      setRoleMsg(true);
    }
  };
  const getState = (state) => {
    setModal(state);
    setFailureModal(state)
  };
  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h5
              className="mt-3"
              style={{ textAlign: "center", fontWeight: "500" }}
            >
              Submit Settlement Tx (Representative**)
            </h5>
          </div>
          <div
            className="col-md-6 mt-3"
            style={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
              height: "350px",
            }}
          >
            <div className="placing">a. Transaction Details:</div>
            <div className="container p-3" style={{ marginTop: "-20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">
                      Transaction Amount:
                    </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">
                      Transaction Currency:{" "}
                    </label>
                  </div>
                  <div className="mb-1" style={{ marginTop: "10px" }}>
                    <label className="col-form-label">
                      Transaction Reference Number:
                    </label>
                  </div>
                  <div className="mb-1" style={{ marginTop: "10px" }}>
                    <label className="col-form-label">Transaction Date: </label>
                  </div>
                  {/* <div className="mb-1 mt-2">
                    <label className="col-form-label">
                      Merchant / Aggregator Name :
                    </label>
                  </div> */}
                  <div className="mb-1">
                    <label className="col-form-label">Merchant ID:</label>
                  </div>
                  <div className="mb-1 mt-1">
                    <label className="col-form-label">Location:</label>
                  </div>
                  <div className="mb-1" style={{ marginTop: "10px" }}>
                    <label className="col-form-label">POS Entry Mode:</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <input
                      value={txFormData.TransactionAmount}
                      onChange={onChangeHandel}
                      required
                      type="text"
                      className="form-control"
                      placeholder="Transaction Amount"
                      name="TransactionAmount"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.TransactionCurrency}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="Transaction Currency"
                      name="TransactionCurrency"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.TransactionReferenceNumber}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="Transaction Ref Number"
                      name="TransactionReferenceNumber"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.TransactionDate}
                      onChange={onChangeHandel}
                      type="date"
                      className="form-control"
                      name="TransactionDate"
                    />
                  </div>
                  {/* <div className="mb-1">
                    <select
                      style={{ height: "40px",fontSize:'14px' }}
                      name="merchantName"
                      id=""
                      className="form-control"
                      onChange={onChangeHandel}
                      value={txFormData.merchantName}
                    >
                      <option value="select">Select Merchant Name</option>
                      <option value="Merchant1">Merchant 1</option>
                      <option value="Merchant2">Merchant 2</option>
                      <option value="Merchant3">Merchant 3</option>
                    </select>
                  </div> */}
                  <div className="mb-1">
                    <input
                      value={txFormData.merchantId}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="Merchant ID"
                      name="merchantId"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.Location}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="Location"
                      name="Location"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.POSEntryMode}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="POS Entry Mode"
                      name="POSEntryMode"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col"></div>
          <div className="col-md-5 item mt-3" style={{ width: "500px" }}>
            <div
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "40px",
              }}
            >
              <div className="placingCustomer">b. Customer Info:</div>

              <div className="container p-3" style={{ marginTop: "-20px" }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-1">
                      <label className="col-form-label ">Customer Name: </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Customer ID:</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-1">
                      <input
                        value={txFormData.CustomerName}
                        onChange={onChangeHandel}
                        type="text"
                        className="form-control"
                        placeholder="Customer Name"
                        name="CustomerName"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        value={txFormData.CustomerID}
                        onChange={onChangeHandel}
                        type="text"
                        className="form-control"
                        placeholder="Customer ID"
                        name="CustomerID"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <br />
            <div
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "40px",
              }}
              className="mt-4"
            >
              <div className="placingLoan">c. Submission Details:</div>
              <div className="container p-3" style={{ marginTop: "-20px" }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-1">
                      <label className="col-form-label">Submitted By:</label>
                    </div>
                    <div className="mb-1" style={{ marginTop: "12px" }}>
                      <label className="col-form-label">
                        Submission Number/Ref:
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Service Date:</label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">
                        Submission Date-time:
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-1">
                      <input
                        value={txFormData.SubmittedBy}
                        onChange={onChangeHandel}
                        type="text"
                        className="form-control"
                        placeholder="Submitted By"
                        name="SubmittedBy"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        value={txFormData.SubmissionNumberRef}
                        onChange={onChangeHandel}
                        type="text"
                        className="form-control"
                        placeholder="Submission Number/Ref"
                        name="SubmissionNumberRef"
                      />
                    </div>

                    <div className="mb-1">
                      <input
                        value={txFormData.ServiceDat}
                        onChange={onChangeHandel}
                        type="date"
                        className="form-control"
                        placeholder="Service Date"
                        name="ServiceDate"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        value={txFormData.SubmissionDateTime}
                        onChange={onChangeHandel}
                        type="date"
                        className="form-control"
                        placeholder="Service Date"
                        name="SubmissionDateTime"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="col-md-6 mt-4"
            style={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
            }}
          >
            <div className="placingDetails">
              d. Line of Credit (LOC) Details
            </div>
            <div className="container p-3" style={{ marginTop: "-20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">
                      LoC Reference Number:{" "}
                    </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">
                      LoC Account Number:
                    </label>
                  </div>
                  <div className="mb-1" style={{ marginTop: "10px" }}>
                    <label className="col-form-label">
                      LoC Approval Date:{" "}
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <input
                      value={txFormData.LoanReferenceNumber}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="Loan Ref Number"
                      name="LoanReferenceNumber"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.LoanAccountNumber}
                      onChange={onChangeHandel}
                      type="text"
                      className="form-control"
                      placeholder="Loan Account Number"
                      name="LoanAccountNumber"
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      value={txFormData.LoanApprovalDate}
                      onChange={onChangeHandel}
                      type="date"
                      className="form-control"
                      placeholder="Loan Approval Date"
                      name="LoanApprovalDate"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
      </div>
      <br />
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <p>
              **Representative - attributes shown are examples for this POC and
              would be chosen as per business need.
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-12 btAlign">
        <div className="mt-4">
          {loading ? (
            <button className="loaderSubmit"></button>
          ) : (
            <button
              type="button"
              className="btn btn-outline-success bt1"
              onClick={SubmitMerchant}
            >
              Submit
            </button>
          )}
          <button type="button" className="btn btn-outline-danger bt2">
            Cancel
          </button>
          {roleMsg ? (
            <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
              Select the Role*
            </p>
          ) : null}
        </div>
      </div>
      {modal ? (
        <SuccessModal getState={getState} message={message} header={header} />
      ) : null}
      {
        failureModal ? <SuccessModal getState={getState} message={failureMsg} header={failureHead} /> : null
      }
    </div>
  );
};

export default SubmitForm;
