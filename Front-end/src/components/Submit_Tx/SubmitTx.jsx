import React, { useState, useEffect } from "react";
import axios from "axios";
import SuccessModal from "../SuccessModal/SuccessModal";
import "./SubmitTx.css";

const message = "Response 200: S/R Request Submitted";
const header = "S/R Request Submitted Succesfully...";
let failureMsg = "Invalid";
let failureHead = "Invalid";
const SubmitTx = (props) => {
  const merchantTx_URL = `http://${props.IP}:3001/api/v1/merchantTx`;

  //loading
  const [loading, setLoading] = useState(false);

  //success Modal
  const [modal, setModal] = useState(false);

  //failure Modal
  const [failureModal, setFailureModal] = useState(false);

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
    executionMode: "",
    roleId: props.roleId,
  });

  //Handling the onchange values.
  const handleChange = (e) => {
    setTxFormData({ ...txFormData, [e.target.name]: e.target.value });
  };

  //submiting form
  const SubmitMerchant = (event) => {
    setLoading(true);
    event.preventDefault();

    //roleId
    if (props.roleId.length !== 0) {
      console.log(txFormData);
      axios
        .post(merchantTx_URL, txFormData, {
          header: { "Content-Type": "application/json" },
        })
        .then((response) => {
          console.log(response);
          setLoading(false);
          setModal(true);
          // alert("Response 200: S/R Request Submitted");
        })

        .catch((err) => {
          console.log(err.response);
          setLoading(false);
          if (!err?.response) {
            console.log("No Server Response");
          } else if (err.response?.status === 400) {
            console.log(err.message);
            failureHead = "Transaction Failed status 400";
            failureMsg =
              "Response 400:Transaction Failed / fields details not correct";
            setFailureModal(true);
          } else if (err.response?.status === 401) {
            console.log("Unauthorized");
            failureHead = "Unauthorized";
            failureMsg = "Invalid role / fields details not correct";
            setFailureModal(true);
          } else if (err.response?.status === 503) {
            failureHead = "Transaction Failed...";
            failureMsg = "No Server Response";
            setFailureModal(true);
          } else {
            console.log("error");
          }
        });
    }
  };
  const getState = (state) => {
    setModal(state);
    setFailureModal(state);
  };
  console.log(props.roleId);
  return (
    <div className="mt-3">
      <h5 style={{ textAlign: "center" }} className="mb-4">
        Merchant Settlement Request
      </h5>
      <div className="form-container container">
        <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <h6>Transaction Details</h6>
              <div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Transaction Amount
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Transaction Amount"
                      aria-label="Last name"
                      name="TransactionAmount"
                      value={txFormData.TransactionAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Transaction Currency
                    </label>
                  </div>
                  <div className="col">
                    <input
                      name="TransactionCurrency"
                      value={txFormData.TransactionCurrency}
                      onChange={handleChange}
                      type="text"
                      className="form-control"
                      placeholder="Transaction Currency"
                      aria-label="Last name"
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Transaction Reference Number
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Transaction Ref Number"
                      aria-label="Last name"
                      name="TransactionReferenceNumber"
                      value={txFormData.TransactionReferenceNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Transaction Date
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Payment Acceptor Id Code"
                      aria-label="Last name"
                      name="TransactionDate"
                      value={txFormData.TransactionDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Merchant ID
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Merchant ID"
                      aria-label="Last name"
                      name="merchantId"
                      value={txFormData.merchantId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Location
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Location"
                      aria-label="Last name"
                      name="Location"
                      value={txFormData.Location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      POS Entry Mode
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="POS Entry Mode"
                      aria-label="Last name"
                      name="POSEntryMode"
                      value={txFormData.POSEntryMode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <h6>Submission Details</h6>
              <div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Submitted By
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Submitted By"
                      aria-label="Last name"
                      name="SubmittedBy"
                      value={txFormData.SubmittedBy}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Submission Number/Ref
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Submission Number/Ref"
                      aria-label="Last name"
                      name="SubmissionNumberRef"
                      value={txFormData.SubmissionNumberRef}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Service Date
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Service Date"
                      aria-label="Last name"
                      name="ServiceDate"
                      value={txFormData.ServiceDat}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Submission Date-time
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Submission Date"
                      aria-label="Last name"
                      name="SubmissionDateTime"
                      value={txFormData.SubmissionDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <h6>Customer Info</h6>
              <div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Customer Name
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer Name"
                      aria-label="Last name"
                      name="CustomerName"
                      value={txFormData.CustomerName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Customer ID
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Customer ID"
                      aria-label="Last name"
                      name="CustomerID"
                      value={txFormData.CustomerID}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <h6>Line of Credit (LOC) Details</h6>
              <div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      LoC Reference Number
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Loan Ref Number"
                      aria-label="Last name"
                      name="LoanReferenceNumber"
                      value={txFormData.LoanReferenceNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      LoC Account Number
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Loan Account Number"
                      aria-label="Last name"
                      name="LoanAccountNumber"
                      value={txFormData.LoanAccountNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      LoC Approval Date
                    </label>
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Payment Acceptor Id Code"
                      aria-label="Last name"
                      name="LoanApprovalDate"
                      value={txFormData.LoanApprovalDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <div>
                <h6>Demo mode</h6>
                <div className="row form-field">
                  <div className="col">
                    <input
                      className="form-check-input me-2"
                      type={"radio"}
                      value="auto"
                      id="demoModeOption1"
                      name="executionMode"
                      checked={txFormData.executionMode === "auto"}
                      onChange={handleChange}
                    />
                    <label htmlFor="demoModeOption1">Auto</label>
                  </div>
                  <div className="col">
                    <input
                      className="form-check-input me-2"
                      type={"radio"}
                      value="manual"
                      name="executionMode"
                      id="demoModeOption2"
                      checked={txFormData.executionMode === "manual"}
                      onChange={handleChange}
                    />
                    <label htmlFor="demoModeOption2">Manual</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center">
          <i>
            **Representative - attributes shown are examples for this POC and
            would be chosen as per business need.
          </i>
        </p>

        <div className={`mt-4 d-flex justify-content-center`}>
          {loading ? (
            <button className="loaderSubmit"></button>
          ) : (
            <button
              type="button"
              className="buttonbt3"
              onClick={SubmitMerchant}
            >
              Submit
            </button>
          )}
          <button type="button" className="btn btn-outline-danger bt2">
            Cancel
          </button>
        </div>
      </div>
      {modal ? (
        <SuccessModal getState={getState} message={message} header={header} />
      ) : null}
      {failureModal ? (
        <SuccessModal
          getState={getState}
          message={failureMsg}
          header={failureHead}
        />
      ) : null}
    </div>
  );
};

export default SubmitTx;
