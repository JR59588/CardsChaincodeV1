import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import Footer from "../Footer";
import "./FileComponent.css";

const FileComponent = (props) => {
  const uploadfile_URL = `http://${props.IP}:3001/uploadfile`;
  const [file, setFile] = useState(null);
  const [successTx, setSuccessTx] = useState(false);
  const [failedTx, setFailedTx] = useState(false);
  const [count, setCount] = useState();
  const [txs, setTxs] = useState([]);

  const [updatedRoleId, setUpdatedRoleId] = useState();

  useEffect(() => {
    setUpdatedRoleId(props.roleId);
  }, [props.roleId]);

  const handelUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("filetoupload", file);
    formData.append("roleId", updatedRoleId);
    try {
      const response = await axios({
        method: "post",
        url: uploadfile_URL,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);
      setFailedTx(false);
      setSuccessTx(true);
      setCount(response.data.length);
      setTxs(response.data.result);
    } catch (error) {
      console.log(error);
      setSuccessTx(false);
      setFailedTx(true);
    }
  };
  const handleSelectedFile = (event) => {
    setFile(event.target.files[0]);
  };
  console.log("updatedRoleId-file Component", updatedRoleId);
  return (
    <div className="container">
      <br></br>
      <div className="fileHead">
        Please select the Settlement transactions file to be uploaded
      </div>
      <br></br>
      <div className="row">
        <div className="col-md-12">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <div className="mb-1" style={{ width: "500px" }}>
              <input
                type="file"
                className="form-control"
                onChange={handleSelectedFile}
              />
            </div>
          </div>
          <div className="mb-1 mt-4 d-flex justify-content-center align-items-center">
            {updatedRoleId === "Agg2" ||
            props.roleId === "CAcct" ||
            props.roleId === "EDI" ||
            props.roleId === "AP" ||
            props.roleId === "SA" ? (
              <button className="btn btn-outline-success" disabled>
                Submit
              </button>
            ) : (
              <button
                className="btn btn-outline-success"
                onClick={handelUpload}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className="mt-4"
        style={{ height: "200px", overflow: successTx ? "scroll" : "" }}
      >
        {successTx && (
          <p style={{ color: "seagreen", textAlign: "center" }}>
            Proccessing Details: <br />
            Total S/R Request Uploaded:{count} <br />
            <table
              className="mt-3"
              style={{
                marginLeft: "-250px",
                height: "150px",
                overflow: "auto",
              }}
            >
              {txs.map((value) => {
                return (
                  <tr>
                    <td>
                      For MerchantId {value.merchantId}...Request has been
                      intiated...
                    </td>
                  </tr>
                );
              })}
            </table>
          </p>
        )}
        {failedTx && (
          <p style={{ color: "red", textAlign: "center" }}>
            S/R Request Upload Failed!
          </p>
        )}
      </div>
    </div>
  );
};

export default FileComponent;
