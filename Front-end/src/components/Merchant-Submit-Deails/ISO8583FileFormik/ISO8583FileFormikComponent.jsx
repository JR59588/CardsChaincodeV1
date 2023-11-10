import React, { useState } from "react";
import "./ISO8583FileFormikComponent.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";

const ISO8583FileFormikComponent = (props) => {
  const iso8583filerequesturl = `http://localhost:3001/api/v1/uploadCSV`;
  const { roleId } = props;

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({ header: "", content: "" });

  const handleClose = () => setShow(false);

  const ISO8583Schema = Yup.object().shape({
    file: Yup.mixed().required("Required"),
    roleId: Yup.string().required("Required"),
  });

  return (
    <div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{popupData.header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{popupData.content}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary">Okay</Button>
        </Modal.Footer>
      </Modal>
      <h5 className="mt-3" style={{ textAlign: "center", fontWeight: "500" }}>
        Submit ISO8583 Message
      </h5>
      <div className="container mt-3 mb-3">
        <div className="row cols-1 justify-content-center">
          <div className="col col-md-6 p-5 form-section border border-1 rounded">
            <Formik
              initialValues={{
                file: null,
                roleId,
              }}
              validationSchema={ISO8583Schema}
              onSubmit={async (values, { setSubmitting, setFieldError }) => {
                console.log("Inside onsubmit", values);
                if (values.file == null) {
                  setFieldError("file", "Required");
                } else {
                  try {
                    setSubmitting(true);
                    const formData = new FormData();
                    formData.append("file", values.file);
                    formData.append("roleId", values.roleId);
                    formData.append("executionMode", values.executionMode);
                    const response = await axios.post(
                      iso8583filerequesturl,
                      formData,
                      {
                        headers: { "Content-Type": "multipart/form-data" },
                      }
                    );
                    console.log(response);
                    setShow(true);
                    setPopupData({
                      header: "Success",
                      content: "Form submitted successfully",
                    });
                  } catch (error) {
                    console.log(error);
                    setShow(true);
                    setPopupData({
                      header: "Failed",
                      content: "Form submission failed",
                    });
                  }
                  setSubmitting(false);
                }
              }}
            >
              {({
                errors,
                touched,
                handleBlur,
                handleSubmit,
                isSubmitting,
                setFieldValue,
                getFieldMeta,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="form-group" controlId="file">
                    <Form.Label>Upload file :</Form.Label>
                    <Form.Control
                      type="file"
                      name="file"
                      accept=".csv"
                      onChange={(event) => {
                        setFieldValue("file", event.target.files[0]);
                      }}
                      onBlur={handleBlur}
                    />
                    {touched.file && errors.file ? (
                      <div className="error-message">{errors.file}</div>
                    ) : null}
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Please wait..." : "Submit"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISO8583FileFormikComponent;
