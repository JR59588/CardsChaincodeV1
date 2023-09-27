import React, { useEffect } from "react";
import { useState } from "react";
import "./Merchant.css";
import FileComponent from "./Merchant-Submit-Deails/FileComponent";
import SubmitForm from "./Merchant-Submit-Deails/SubmitForm";
import Footer from "./Footer";
import SubmitTx from "./Submit_Tx/SubmitTx";
import ISO8583Component from "./Merchant-Submit-Deails/ISO8583Component";
import ISO8583Decoded from "./Merchant-Submit-Deails/ISO8583Decoded";

const Merchant = ({ roleId, IP, getRoleFromFile }) => {
  //storing the radio value and rendering & by default it will display the radio1
  const [formFile, setFormFile] = useState("radio1");
  const [updatedRoleId, setUpdatedRoleId] = useState();

  //rendering based on radio btn
  const handelOnchange = (event) => {
    setFormFile(event.target.value);
  };

  //setting up filecomponent roleId
  const onCilckFileCOmponent = () => {
    const element = document.getElementById("dropdown");
    const value = (element.selectedIndex = "1");
    let selectedOption = element.options[value];
    console.log(selectedOption.value);
    getRoleFromFile(selectedOption.value);
    setUpdatedRoleId(selectedOption.value);
  };

  return (
    <div>
      <div className="container">
        <h5 style={{ fontWeight: "500" }}>I want to*</h5> <br />
        <div className="row">
          <div className="col-sm-4">
            <input
              className="form-check-input"
              type={"radio"}
              value="radio1"
              id="radio1"
              checked={formFile === "radio1"}
              name="radioBtn"
              onChange={handelOnchange}
            />{" "}
            <label
              htmlFor="radio1"
              style={{ marginLeft: "5px", fontSize: "14px" }}
            >
              Initiate a single merchant settlement request
            </label>
          </div>
          <div className="col-sm-4">
            <input
              className="form-check-input"
              type={"radio"}
              value="radio2"
              checked={formFile === "radio2"}
              name="radioBtn"
              id="radio2"
              onChange={handelOnchange}
              onClick={onCilckFileCOmponent}
            />
            <label
              htmlFor="radio2"
              style={{ marginLeft: "5px", fontSize: "14px" }}
            >
              Upload a file with multiple merchant settlment requests
            </label>
          </div>
          <div className="col-sm-4">
            <input
              className="form-check-input"
              type={"radio"}
              value="radio3"
              checked={formFile === "radio3"}
              name="radioBtn"
              id="radio3"
              onChange={handelOnchange}
              onClick={onCilckFileCOmponent}
            />
            <label
              htmlFor="radio3"
              style={{ marginLeft: "5px", fontSize: "14px" }}
            >
              Submit a merchant settlment request (ISO 8583)
            </label>
          </div>
          {/* <div className="col-sm-4">
            <br />
            <input
              className="form-check-input"
              type={"radio"}
              value="radio4"
              checked={formFile === "radio4"}
              name="radioBtn"
              id="radio4"
              onChange={handelOnchange}
              onClick={onCilckFileCOmponent}
            />
            <span
              htmlFor="file"
              
              style={{ marginLeft: "10px", fontSize: "16px" }}
            >
              Submit Decoded ISO 8583 message
            </span>
          </div> */}
        </div>
      </div>
      <div style={{ marginLeft: "230px", marginTop: "20px" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          <div className="mb-1"></div>
          <div className="mb-1" style={{ marginLeft: "100px" }}></div>
        </div>
        <div className="placeHeads"></div>
      </div>
      {/* Submit form */}
      {formFile === "radio1" && <SubmitTx roleId={roleId} IP={IP} />}
      {/* File Input*/}
      {formFile === "radio2" && <FileComponent roleId={roleId} IP={IP} />}
      {formFile === "radio3" && <ISO8583Component roleId={roleId} IP={IP} />}
      {formFile === "radio4" && <ISO8583Decoded roleId={roleId} IP={IP} />}
      <Footer />
    </div>
  );
};

export default Merchant;
