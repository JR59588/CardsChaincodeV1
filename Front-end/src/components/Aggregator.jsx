import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import "./Aggregator.css";
import axios from "axios";
import SuccessModal from "../components/SuccessModal/SuccessModal";

const message = (
  <h6>
    Response 200: Successfully Endorsed by Aggregator, Servicing Agent, Customer
    Accounting, Accounts Payable & EDI. <br /> <br />
    Merchant Successfully Onboarded
  </h6>
);
const header = "Onboarding Succesfully...";
const Aggregator = (props) => {
  const IP = props.IP;
  //setting role message
  const [roleMsg, setRoleMsg] = useState(false);

  const [failureMessage, setFailureMessage] = useState("");
  const [failureHeading, setFailureHeading] = useState("");
  //loading
  const [loading, setLoading] = useState(false);

  //success Modal
  const [modal, setModal] = useState(false);

  //failure Modal
  const [failureModal, setFailureModal] = useState(false);

  const [onboardingFormData, setOnboardingFormData] = useState({
    merchantName: "", //
    merchantID: "", //
    merchantDescription: "", //
    merchantType: "", //
    bnplProductTypes: "", //
    merchantAccountType: "", //
    txcNegotiatedMDR: "", //
    txcMaxTxPerDay: "", //
    txcTxCurrency: "", //
    txcMaxTxAmount: "", //
    txcMinTxAmount: "", //
    locationsAllowed: "", //
    aggName: "", //
    aggID: "", //
    clrOrgName: "Internal", //
    clrOrgID: "CLORG-101", //
    isContractSigned: "", //
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
    roleId: props.roleId,
  });

  //reading roleId from header
  useEffect(() => {
    onboardingFormData.roleId = props.roleId;
  }, [props.roleId]);

  const onChangeHandel = (e) => {
    setOnboardingFormData({
      ...onboardingFormData,
      [e.target.name]: e.target.value,
    });
  };

  const submitForm = (event) => {
    event.preventDefault();
    setLoading(true);
    if (props.roleId.length !== 0) {
      onboardingFormData.customerID = "C" + onboardingFormData.merchantID;
      setRoleMsg(false);
      console.log(onboardingFormData);
      axios
        .post(
          `http://${IP}:3001/api/v1/saveOBMerchantSummary`,
          onboardingFormData,
          {
            header: { "Content-Type": "application/json" },
          }
        )
        .then((response) => {
          console.log(response);
          setLoading(false);
          setModal(true);
        })

        .catch((err) => {
          setLoading(false);
          console.log("Error while onboarding merchant", err);
          setFailureHeading("Error in Merchant Onboarding");
          setFailureMessage(err.response.data.message);
        });

      localStorage.submit = true;
    } else {
      setRoleMsg(true);
    }
  };
  const getState = (state) => {
    setModal(state);
    setFailureModal(state);
  };
  console.log(modal);
  return (
    <div className={modal ? "mainBlur" : "main"} style={{ height: "99vh" }}>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h5
              className="mt-4"
              style={{ textAlign: "center", fontWeight: "500" }}
            >
              Merchant Onboarding (Representative**)
            </h5>
          </div>
          <div className="row">
            <div
              className="col-md-6 mt-3"
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "40px",
                height: "325px",
              }}
            >
              <div className="placing">a. Merchant Profile:</div>
              <div className="container p-3" style={{ marginTop: "-20px" }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-1">
                      <label className="col-form-label">
                        Payment Acceptor Name:
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">
                        Payment Acceptor <br /> Identification Code:{" "}
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">
                        Payment Acceptor <br /> Description:{" "}
                      </label>
                    </div>
                    <br />
                    <br />
                    <div className="mb-1 mt-3">
                      <label className="col-form-label">
                        Merchant Category Code:
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Product:</label>
                    </div>
                    <br />

                    {/* <div className="mb-1">
                      <label className="col-form-label"> IFSC:</label>
                    </div> */}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Payment Acceptor Name"
                        name="merchantName"
                        value={onboardingFormData.merchantName}
                        onChange={onChangeHandel}
                      />
                    </div>
                    <div className="mb-1 mt-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Payment Acceptor Id Code"
                        name="merchantID"
                        value={onboardingFormData.merchantID}
                        onChange={onChangeHandel}
                      />
                    </div>
                    <div className="mb-1 mt-2">
                      <textarea
                        rows="3"
                        cols="60"
                        className="form-control"
                        placeholder="Maximum 100 Characters"
                        name="merchantDescription"
                        value={onboardingFormData.merchantDescription}
                        onChange={onChangeHandel}
                      ></textarea>
                    </div>

                    <div className="mb-1 mt-4">
                      <select
                        style={{ height: "40px", fontSize: "14px" }}
                        name="merchantType"
                        className="form-control"
                        onChange={onChangeHandel}
                        value={onboardingFormData.merchantType}
                      >
                        <option value="select">
                          Select Merchant Category Code
                        </option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Travel">Travel</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Oil and Gas">Oil and Gas</option>
                      </select>
                    </div>

                    <div className="mb-1">
                      <select
                        style={{ height: "40px", fontSize: "14px" }}
                        name="bnplProductTypes"
                        id=""
                        className="form-control"
                        onChange={onChangeHandel}
                        value={onboardingFormData.bnplProductTypes}
                      >
                        <option value="select">Select Product Type</option>
                        <option value="PR1">PR1</option>
                        <option value="PR2">PR2</option>
                        <option value="PR3">PR3</option>
                        <option value="PR4">PR4</option>
                      </select>
                    </div>
                    <br />

                    {/* <div className="mt-1">
                      <label className="col-form-label">AABBCX54321</label>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-6  mt-5" style={{ height: "0px" }}>
              <div
                style={{
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: "40px",
                  position: "relative",
                  top: "-18px",
                  left: "-10px",
                  width: "560px",
                }}
              >
                <div className="placingAggregator">
                  c. Associated Aggregator:
                </div>

                <div className="container p-3" style={{ marginTop: "-20px" }}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-1">
                        <label className="col-form-label">
                          Aggregator Name:{" "}
                        </label>
                      </div>
                      <div className="mb-1">
                        <label className="col-form-label">Aggregator ID:</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Aggregator Name"
                          name="aggName"
                          value={onboardingFormData.aggName}
                          onChange={onChangeHandel}
                        />
                      </div>
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Aggregator ID"
                          name="aggID"
                          value={onboardingFormData.aggID}
                          onChange={onChangeHandel}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <br />
              <br />

              <div className="col md-1"></div>
              <div
                style={{
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: "40px",
                }}
                className="col md-5 mt-5 divB p-2"
              >
                <div className="placingThreshold">
                  b. Transaction Criteria/Thresholds:
                </div>
                <div
                  className="container"
                  style={{ paddingLeft: "20px", marginTop: "-15px" }}
                >
                  <div className="row">
                    <div className="col-md-5">
                      <div className="mb-1">
                        <label className="col-form-label">
                          Negotiated MDR *:
                        </label>
                      </div>
                      <div className="mb-1" style={{ marginTop: "10px" }}>
                        <label
                          style={{ marginTop: "0px" }}
                          className="col-form-label"
                        >
                          Promo Code:
                        </label>
                      </div>
                      <div className="mb-1">
                        <label className="col-form-label">
                          Max Number of Txns/day:
                        </label>
                      </div>
                      <div className="mb-1" style={{ marginTop: "8px" }}>
                        <label className="col-form-label">Currency:</label>
                      </div>
                      <div className="mb-1" style={{ marginTop: "10px" }}>
                        <label className="col-form-label">
                          Min Txn Amount:
                        </label>
                      </div>
                      <div className="mb-1" style={{ marginTop: "10px" }}>
                        <label className="col-form-label">
                          Max Txn Amount:
                        </label>
                      </div>
                      <div className="mb-1">
                        <label className="col-form-label">
                          Locations Allowed:
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-1">
                        <select
                          style={{ height: "40px", fontSize: "14px" }}
                          name="txcNegotiatedMDR"
                          id="txcNegotiatedMDR"
                          className="form-control"
                          onChange={onChangeHandel}
                          value={onboardingFormData.txcNegotiatedMDR}
                        >
                          <option value="select">Select Merchant MDR</option>
                          <option value="1.5">1.5</option>
                          <option value="2.0">2.0</option>
                          <option value="2.5">2.5</option>
                        </select>
                      </div>
                      <div className="mb-1">
                        {/* <label className="col-form-label">PROMO-XXX-YYY</label> */}
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Promo Code"
                          name="promoCode"
                          onChange={onChangeHandel}
                          value={onboardingFormData.promoCode}
                        />
                      </div>
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Max 6 digits"
                          name="txcMaxTxPerDay"
                          value={onboardingFormData.txcMaxTxPerDay}
                          onChange={onChangeHandel}
                        />
                      </div>
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Transaction Currency"
                          name="txcTxCurrency"
                          value={onboardingFormData.txcTxCurrency}
                          onChange={onChangeHandel}
                        />
                      </div>
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Max 6 digits"
                          name="txcMinTxAmount"
                          value={onboardingFormData.txcMinTxAmount}
                          onChange={onChangeHandel}
                        />
                      </div>
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Max 6 digits"
                          name="txcMaxTxAmount"
                          value={onboardingFormData.txcMaxTxAmount}
                          onChange={onChangeHandel}
                        />
                      </div>
                      <div className="mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Location A, Location B"
                          name="locationsAllowed"
                          value={onboardingFormData.locationsAllowed}
                          onChange={onChangeHandel}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-md-6 mt-5 divD"
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "40px",
              }}
            >
              <div className="placingDetails" style={{ width: "240px" }}>
                d. Clearing Organisation Details:
              </div>
              <div className="container p-3" style={{ marginTop: "-20px" }}>
                <div className="row">
                  <div className="col-md-6">
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                      Merchant's Bank Details:
                    </span>
                    <div className="mb-1 mt-2">
                      <label className="col-form-label">Account Number:</label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">ABA Code:</label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">
                        Clearing Organisation Name:{" "}
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Clearing OrgID:</label>
                    </div>
                    <form>
                      <div>
                        <label style={{ fontSize: "14px" }}>
                          Contract signed with Merchant:
                        </label>
                      </div>
                    </form>
                  </div>
                  <div className="col-md-6">
                    <div style={{ marginTop: "27px" }}>
                      {/* <label className="col-form-label">AAAABBCCXXX</label> */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Account Number"
                        name="merchantAccountNumber"
                        onChange={onChangeHandel}
                        value={onboardingFormData.merchantAccountNumber}
                      />
                    </div>

                    <div className="mt-1">
                      {/* <label className="col-form-label">BXXXXXX</label> */}
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ABA Code"
                        name="merchantBankCode"
                        onChange={onChangeHandel}
                        value={onboardingFormData.merchantBankCode}
                      />
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Internal</label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">CLORG-101 </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        name="isContractSigned"
                        value="YES"
                        onChange={onChangeHandel}
                      />
                      &nbsp;Yes
                      <input
                        type="radio"
                        name="isContractSigned"
                        value="NO"
                        style={{ marginLeft: "10px" }}
                      />
                      &nbsp;No
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <p>
                **Representative - attributes shown are examples for this POC
                and would be chosen as per business need.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-12 btAlignA">
          <div className="btSave">
            {loading ? (
              <button className="loaderSubmit"></button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-success bt1"
                onClick={submitForm}
              >
                Save
              </button>
            )}
            <button type="button" className="btn btn-outline-danger bt2">
              Cancel
            </button>
            {roleMsg ? (
              <p style={{ color: "red", textAlign: "center" }}>
                Select the Role*
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {modal ? (
        <SuccessModal getState={getState} message={message} header={header} />
      ) : null}
      {failureModal ? (
        <SuccessModal
          getState={getState}
          message={failureMessage}
          header={failureHeading}
        />
      ) : null}
      <Footer />
    </div>
  );
};

export default Aggregator;
