import React, { useEffect } from "react";
import Footer from "../Footer";
import "./ISO8583Component.css";
import { useState } from "react";
import axios from "axios";
import SuccessModal from "../SuccessModal/SuccessModal";

const message = "Response 200: S/R Request Submitted";
const header = "S/R Request Submitted Succesfully...";
let failureMsg = "Invalid";
let failureHead = "Invalid";
const ISO8583Component = (props) => {
  const settlementRequest_URL = `http://${props.IP}:3001/api/v1/merchantTx`;

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
    ISO8583Message: "",
    merchantID: "",
    customerID: "",
    loanReferenceNumber: "",
    roleId: props.roleId,
  });

  //Handeling the onchange values.
  const handleChange = (e) => {
    setTxFormData({ ...txFormData, [e.target.name]: e.target.value });
  };

  //reading roleId from header
  useEffect(() => {
    txFormData.roleId = props.roleId;
  }, [props.roleId]);

  //submiting form
  const SubmitISO8583 = (event) => {
    console.log("Hello from submit 8583");
    setLoading(true);
    event.preventDefault();

    //roleId
    if (props.roleId.length !== 0) {
      console.log(txFormData);
      setRoleMsg(false);
      axios
        .post(
          settlementRequest_URL,
          { ...txFormData, roleId: "Org1" },
          {
            header: { "Content-Type": "application/json" },
          }
        )
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
            failureHead = "Transaction Failed...";
            failureMsg =
              "Response 400:Transaction Failed / fields should not be empty";
            setFailureModal(true);
          } else if (err.response?.status === 401) {
            console.log("Unauthorized");
            failureHead = "Unauthorized";
            failureMsg = "Invalid role / fields must not be empty";
            setFailureModal(true);
          } else {
            console.log("error");
          }
        });
    } else {
      setRoleMsg(true);
    }
    if (selectedOption === "") {
      setError("Please select a demo mode");
      setLoading(false);
    }
  };
  const getState = (state) => {
    setModal(state);
    setFailureModal(state);
  };
  const [selectedOption, setSelectedOption] = useState("");
  const [error, setError] = useState("");

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (selectedOption === "") {
      setError("Please select a demo mode");
    } else {
      alert("");
      // Perform further actions with the selected option
    }
  };
  return (
    <div>
      <h5 className="mt-3" style={{ textAlign: "center", fontWeight: "500" }}>
        Submit ISO8583 Message
      </h5>
      <div className="form-container container">
        <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <h6>ISO8583 Details</h6>
              <div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      ISO8583 message
                    </label>
                  </div>
                  <div className="col">
                    <input
                      value={txFormData.ISO8583Message}
                      onChange={handleChange}
                      required
                      type="text"
                      className="form-control"
                      placeholder="Enter ISO8583 message here"
                      name="ISO8583Message"
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Merchant Id
                    </label>
                  </div>
                  <div className="col">
                    <input
                      value={txFormData.merchantID}
                      onChange={handleChange}
                      required
                      type="text"
                      className="form-control"
                      placeholder="Enter Merchant ID here"
                      name="merchantID"
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Customer Id
                    </label>
                  </div>
                  <div className="col">
                    <input
                      value={txFormData.customerID}
                      onChange={handleChange}
                      required
                      type="text"
                      className="form-control"
                      placeholder="Enter Customer ID here"
                      name="customerID"
                    />
                  </div>
                </div>
                <div className="row form-field">
                  <div className="col">
                    <label htmlFor="name" className="col-form-label">
                      Loan Reference Number
                    </label>
                  </div>
                  <div className="col">
                    <input
                      value={txFormData.loanReferenceNumber}
                      onChange={handleChange}
                      required
                      type="text"
                      className="form-control"
                      placeholder="Enter Loan Reference Number here"
                      name="loanReferenceNumber"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
          <div className="col p-3">
            <div className="form-section p-3 border border-1 rounded">
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
      </div>

      <p className="text-center">
        <i>
          Note : Attributes shown are examples for this POC and would be chosen
          as per business need.
        </i>
      </p>
      <div className="col-md-12 btAlign">
        <div className="mt-4">
          {loading ? (
            <button className="loaderSubmit"></button>
          ) : (
            <button type="button" className="buttonbt3" onClick={SubmitISO8583}>
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
    </div>
  );
};

export default ISO8583Component;
