import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const UploadISO8583File = ({ roleId }) => {
  const [file, setFile] = useState(null);
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    heading: "",
    reason: "",
  });

  const fileUploadUrl = "http://localhost:3001/api/v1/uploadCSV";

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      console.log("No file selected");
      alert("Choose a file to proceed");
    } else {
      try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("roleId", roleId);

        const response = await axios.post(fileUploadUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setPopup({
          open: true,
          message: response.data.message,
          heading: "File upload successful",
          reason: "",
        });
      } catch (error) {
        console.log(`Error uploading file: ${error}`);
        setPopup({
          open: true,
          message: error.response.data.message,
          heading: "File upload failure",
          reason: error.response.data.reason,
        });
      }
    }
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

  return (
    <div className="container">
      <h5 className="text-center">
        Upload merchant settlement request(s) CSV file
      </h5>

      <div className="d-flex align-items-center justify-content-center mt-3">
        <Form.Control
          type="file"
          style={{ width: "500px" }}
          onChange={(event) => setFile(event.target.files[0])}
        />
        <Button
          className="ms-3"
          onClick={(event) => {
            handleUpload(event);
          }}
        >
          Submit
        </Button>
      </div>
      <div>{renderPopup()}</div>
    </div>
  );
};

export default UploadISO8583File;
