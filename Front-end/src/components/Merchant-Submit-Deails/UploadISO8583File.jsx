import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const UploadISO8583File = ({ roleId }) => {
  const [file, setFile] = useState(null);
  //loader state
  const [loader, setLoader] = useState(false);

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
      setLoader(false);
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
          className="buttonbt3"
          onClick={(event) => {
            handleUpload(event);
            // setLoader(true);
          }}
        >
          Submit
        </Button>
      </div>
      <div>{renderPopup()}</div>
      {loader && <div className="blur">
       
           <div  style={{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            flexDirection:'column',
            marginTop:'40px'
           }}>
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

      </div>}
    </div>
  );
};

export default UploadISO8583File;
