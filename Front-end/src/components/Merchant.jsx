import React, { useEffect } from "react";
import { useState } from "react";
import "./Merchant.css";
import FileComponent from "./Merchant-Submit-Deails/FileComponent";
import SubmitForm from "./Merchant-Submit-Deails/SubmitForm";
import Footer from "./Footer";
import SubmitTx from "./Submit_Tx/SubmitTx";

const Merchant = ({ roleId, IP,getRoleFromFile }) => {
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
    getRoleFromFile(selectedOption.value)
    setUpdatedRoleId(selectedOption.value);
  };

  return (
    <div>
      <div className="container">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-2 row-cols-xxl-2 mt-2">
          <div className="col">
          <label style={{ fontWeight: "500" }}>I want to*</label> <br />
          <input
              className="form-check-input"
              type={"radio"}
              value="radio1"
              id="radio1"
              checked={formFile === "radio1"}
              name="radioBtn"
              onChange={handelOnchange}
            /> <span
            htmlFor="submit"
            className="form-check-label"
            style={{ marginLeft: "10px", fontSize: "16px" }}
          >
            Initiate a Single Sales/Return transaction
          </span>
          {/* <h6 className="headItem">(Merchant - Direct Mode)</h6> */}
          </div>
          <div className="col">
            <br />
          <input
              className="form-check-input"
              type={"radio"}
              value="radio2"
              checked={formFile === "radio2"}
              name="radioBtn"
              id="radio2"
              onChange={handelOnchange}
              onClick={onCilckFileCOmponent}
            /><span
            htmlFor="file"
            className="form-check-label"
            style={{ marginLeft: "10px", fontSize: "16px" }}
          >
            Upload a file with multiple Sales/Return transactions
          </span>
          <h6 className="headItem">(Aggregator Mode)</h6>
          </div>
        </div>
      </div>
      <div style={{ marginLeft: "230px", marginTop: "20px" }}>
       
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          <div className="mb-1">
            
           
          </div>
          <div className="mb-1" style={{ marginLeft: "100px" }}>
            
            
          </div>
        </div>
        <div className="placeHeads">
          
         
        </div>
      </div>
      {/* Submit form */}
      {formFile === "radio1" && (
        <SubmitTx roleId={roleId}  IP={IP} />
      )}
      {/* File Input*/}
      {formFile === "radio2" && (
        <FileComponent roleId={roleId} IP={IP} />
      )}
      <Footer />
    </div>
  );
};

export default Merchant;
