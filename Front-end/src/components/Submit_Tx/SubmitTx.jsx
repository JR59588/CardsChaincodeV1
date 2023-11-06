import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SubmitTx.module.css";
import SuccessModal from "../SuccessModal/SuccessModal";

const message = "Response 200: S/R Request Submitted";
const header = "S/R Request Submitted Succesfully...";
let failureMsg = "Invalid";
let failureHead = "Invalid";
const SubmitTx = (props) => {
  const merchantTx_URL = `http://${props.IP}:3001/api/v1/merchantTx`;
  const [formFile, setFormFile] = useState("radio1");

  //setting role message
  const [roleMsg, setRoleMsg] = useState(false);

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
    roleId: props.roleId,
  });

  //Handeling the onchange values.
  const onChangeHandel = (e) => {
    setTxFormData({ ...txFormData, [e.target.name]: e.target.value });
  };

  //reading roleId from header
  useEffect(() => {
    console.log("effetct", props.roleId);
    txFormData.roleId = props.roleId;
  }, [props.roleId]);

  //submiting form
  const SubmitMerchant = (event) => {
    setLoading(true);
    event.preventDefault();
    if (selectedOption === '') {
      setError('Please select a demo mode');
      setLoading(false);
  } 

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
    } else {
      setRoleMsg(true);
    }
  };
  const getState = (state) => {
    setModal(state);
    setFailureModal(state);
  };
  console.log(props.roleId);
  const [selectedOption, setSelectedOption] = useState('');
  const [error, setError] = useState('');

  const handleOptionChange = (event) => {
      setSelectedOption(event.target.value);
      setError('');
  };

  const handleSubmit = (event) => {
      event.preventDefault();

      if (selectedOption === '') {
          setError('Please select a demo mode');
      } else {
          alert('')
          // Perform further actions with the selected option
      }
  };
  return (
    <>
      <div className="container">
        <div className="cols2">
          <h4 style={{ textAlign: "center" }} className="mb-4">
            Submit Settlement Tx 
          </h4>
        </div>
        <div
          className={`row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-2 row-cols-xxl-2 ${styles.rowSpacing}`}
        >
          <div className={`col ${styles.cols1}`}>
            <span className={styles.floatingA}>a. Transaction Details:</span>
            <div className={`${styles.placeInputsNames}`}>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Transaction Amount:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Transaction Currency:
                  </label>
                </div>
                <div className="col">
                  <input
                    name="TransactionCurrency"
                    value={txFormData.TransactionCurrency}
                    onChange={onChangeHandel}
                    type="text"
                    className="form-control"
                    placeholder="Transaction Currency"
                    aria-label="Last name"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Transaction Reference Number:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Transaction Date:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Merchant ID:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Location:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    POS Entry Mode:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`col ${styles.cols2}`}>
            <div
              className={`row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-1 row-cols-xxl-1 ${styles.rowSpacingRightBlock}`}
            >
              <div className={`col ${styles.rightCol1}`}>
                <span className={styles.floatingB}>b. Customer Info:</span>
                <div className={`${styles.placeInputsNames}`}>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="name" className="col-form-label">
                        Customer Name:
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
                        onChange={onChangeHandel}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="name" className="col-form-label">
                        Customer ID:
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
                        onChange={onChangeHandel}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={`col ${styles.rightCol2}`}>
                <span className={styles.floatingC}>c. Submission Details:</span>
                <div className={`${styles.placeInputsNames}`}>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="name" className="col-form-label">
                        Submitted By:
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
                        onChange={onChangeHandel}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="name" className="col-form-label">
                        Submission Number/Ref:
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
                        onChange={onChangeHandel}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="name" className="col-form-label">
                        Service Date:
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
                        onChange={onChangeHandel}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="name" className="col-form-label">
                        Submission Date-time:
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
                        onChange={onChangeHandel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`col ${styles.cols3}`}>
            <span className={styles.floatingD}>
              d. Line of Credit (LOC) Details
            </span>
            <div className={styles.placeInputsNames}>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    LoC Reference Number:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    LoC Account Number:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    LoC Approval Date:
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
                    onChange={onChangeHandel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3">
          **Representative - attributes shown are examples for this POC and
          would be chosen as per business need.
        </p>
        <div className="container">
        <h5 style={{ fontWeight: "500" }}>DEMO MODE</h5> <br />
        <div className="column">
          <div className="col-sm-4" >
            <input
              className="form-check-input"
              type={"radio"}
              value="option1"
              id="option1"
              checked={selectedOption === 'option1'}
              onChange={handleOptionChange}
            />{" "}
            <label
              htmlFor="option1"
              style={{ marginLeft: "5px", fontSize: "14px", display: "inline" }}
            >
              Auto Mode
            </label>
          </div>
          <div className="col-sm-4">
            <input
              className="form-check-input"
              type={"radio"}
              value="option2"
              name="radioBtn"
              id="option2"
              checked={selectedOption === 'option2'}
              onChange={handleOptionChange}
            />
            <label
              htmlFor="option2"
              style={{ marginLeft: "5px", fontSize: "14px", display: "inline" }}
            >
              Manual Mode
            </label>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          

        </div>
      </div>

        <div className={`mt-4 d-flex justify-content-center`}>
          {props.roleId === "Agg2" ||
          props.roleId === "CAcct" ||
          props.roleId === "EDI" ||
          props.roleId === "AP" ||
          props.roleId === "SA" ? (
            <button
              type="button"
              
              className={`${styles.buttonbt2} bt2`}
              disabled
            >
              Submit
            </button>
          ) : loading ? (
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
      {failureModal ? (
        <SuccessModal
          getState={getState}
          message={failureMsg}
          header={failureHead}
        />
      ) : null}
    </>
  );
};

export default SubmitTx;
