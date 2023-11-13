import React, { useState } from "react";
import "./FileRequest.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader/Loader";

const FileRequest = (props) => {
  const iso8583filerequesturl = "http://localhost:3001/api/v1/uploadCSV";
  const { roleId } = props;

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({ header: "", content: "" });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const handleClose = () => setShow(false);

  const ISO8583Schema = Yup.object().shape({
    file: Yup.mixed().required("Required"),
    roleId: Yup.string().required("Required"),
    executionMode: Yup.string().required("Required"),
  });

  return (
    <div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{popupData.header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{popupData.content}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={isFormSubmitting}
        backdrop="static"
        keyboard={false}
        centered
        animation={false}
      >
        <Modal.Body className="bg-transparent">
          <Loader message={"Please wait as your form is being submitted"} />
        </Modal.Body>
      </Modal>
      <div className="container mt-3 mb-3">
        <div className="row cols-1 justify-content-center">
          <div className="col col-md-6 p-5 form-section border border-1 rounded">
            <Formik
              initialValues={{
                file: null,
                roleId,
                executionMode: "auto",
              }}
              validationSchema={ISO8583Schema}
              onSubmit={async (values, { setSubmitting, setFieldError }) => {
                console.log("Inside onsubmit", values);
                if (values.file == null) {
                  setFieldError("file", "Required");
                } else {
                  try {
                    console.log("Inside form onsubmit");
                    setSubmitting(true);
                    setIsFormSubmitting(true);
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
                  setIsFormSubmitting(false);
                }
              }}
            >
              {({
                errors,
                touched,
                handleChange,
                values,
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
                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>Execution Mode :</Form.Label>

                    <Form.Check
                      type="radio"
                      name="executionMode"
                      id="fileExecutionModeManual"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      checked={values.executionMode === "manual"}
                      label="Manual"
                      value="manual"
                      inline
                    />
                    <Form.Check
                      type="radio"
                      name="executionMode"
                      id="fileExecutionModeAuto"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      checked={values.executionMode === "auto"}
                      label="Auto"
                      value="auto"
                      inline
                    />
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

export default FileRequest;
