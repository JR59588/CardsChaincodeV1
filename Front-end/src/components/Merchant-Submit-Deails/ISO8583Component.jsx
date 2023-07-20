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
const ISO8583Component = (props) => {
  const settlementRequest_URL = `http://${props.IP}:3001/api/v1/merchantTx`;
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
    ISO8583Message: "",
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
  const SubmitISO8583 = (event) => {
      console.log("Hello from submit 8583")
    setLoading(true);
    event.preventDefault();

    //roleId
    if (props.roleId.length !== 0) {
      console.log(txFormData);
      setRoleMsg(false);
      axios
        .post(settlementRequest_URL, txFormData, {
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
              Submit ISO8583 Message (Representative**)
            </h5>
          </div>
          <div className="col-md-3"></div>
          <div
            className="col-md-6 mt-3"
            style={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
            }}
          >
            <div className="placing">a. Settlement Request:</div>
            <div className="container p-3" style={{ marginTop: "-20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">
                      ISO8583 Message:
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <input
                      value={txFormData.ISO8583Message}
                      onChange={onChangeHandel}
                      required
                      type="text"
                      className="form-control"
                      placeholder="Enter ISO8583 message here"
                      name="ISO8583Message"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              onClick={SubmitISO8583}
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

export default ISO8583Component;
