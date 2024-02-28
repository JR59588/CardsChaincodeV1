import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "./UploadISO8583File.css";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const UploadISO8583File = ({ roleId }) => {
  const [file, setFile] = useState(null);
  //loader state
  const [loader, setLoader] = useState(false);

  const [txFormData, setTxFormData] = useState({
    executionMode: "",
  });

  const [popup, setPopup] = useState({
    open: false,
    message: "",
    heading: "",
    reason: "",
  });

  const fileUploadUrl = `${apiBaseUrl}/api/v1/uploadCSV`;

  const handleUpload = async (event) => {
    event.preventDefault();
    if (selectedOption === "") {
      setError("Please select a demo mode");
    }
    if (!file) {
      setLoader(false);
      console.log("No file selected");
      alert("Choose a file to proceed");
    } else {
      try {
        setLoader(true);

        const formData = new FormData();

        formData.append("file", file);
        formData.append("roleId", roleId);
        formData.append("executionMode", txFormData.executionMode);

        const response = await axios.post(fileUploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setPopup({
          open: true,
          message: response.data.message,
          heading: "File upload successful",
          reason: "",
        });
        setLoader(false);
      } catch (error) {
        console.log(`Error uploading file: ${error}`);
        setLoader(false);
        setPopup({
          open: true,
          message: error.response.data.message,
          heading: "File upload failure",
          reason: error.response.data.reason,
        });
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setTxFormData({ ...txFormData, [e.target.name]: e.target.value });
  };

  const closePopup = () => {
    setPopup((popup) => ({
      ...popup,
      open: false,
    }));
  };

  const renderPopup = () => {
    if (popup.open) {
      return (
        <Modal
          show={popup.open}
          onHide={closePopup}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              {popup.heading}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{popup.message}</p>
            {popup.reason ? <i>Reason: {popup.reason}</i> : ""}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={closePopup}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }
  };
  const [selectedOption, setSelectedOption] = useState("");
  const [error, setError] = useState("");

  return (
    <div>
      <h5 className="mt-3" style={{ textAlign: "center", fontWeight: "500" }}>
        Upload file
      </h5>
      <div className="form-container container">
        <div className="row row-cols-1 row-cols-lg-2 justify-content-center">
          <div className="col p-3">
            <div className="form-section  p-3 border border-1 rounded">
              <h6>Upload merchant settlement request(s) CSV file</h6>
              <Form.Control
                type="file"
                onChange={(event) => setFile(event.target.files[0])}
              />
              <div>
                <div className="row form-field">
                  <h6>Demo mode</h6>
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

        <div className={`mt-4 d-flex justify-content-center`}>
          <Button className="buttonbt3" onClick={handleUpload}>
            Submit
          </Button>
        </div>
      </div>
      <div>{renderPopup()}</div>
      {loader && (
        <div className="blur">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "40px",
            }}
          >
            <div id="wifi-loader">
              <svg className="circle-outer" viewBox="0 0 86 86">
                <circle className="back" cx="43" cy="43" r="40"></circle>
                <circle className="front" cx="43" cy="43" r="40"></circle>
                <circle className="new" cx="43" cy="43" r="40"></circle>
              </svg>
              <svg className="circle-middle" viewBox="0 0 60 60">
                <circle className="back" cx="30" cy="30" r="27"></circle>
                <circle className="front" cx="30" cy="30" r="27"></circle>
              </svg>
              <svg className="circle-inner" viewBox="0 0 34 34">
                <circle className="back" cx="17" cy="17" r="14"></circle>
                <circle className="front" cx="17" cy="17" r="14"></circle>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadISO8583File;
