import React, { useState } from "react";
import "./SingleRequest.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";

const SingleRequest = (props) => {
  const iso8583requesturl = `http://localhost:3001/api/v1/merchantTx`;
  const { roleId } = props;

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({ header: "", content: "" });

  const handleClose = () => setShow(false);

  const ISO8583Schema = Yup.object().shape({
    ISO8583Message: Yup.string().required("Required"),
    merchantID: Yup.string().required("Required"),
    customerID: Yup.string().required("Required"),
    loanReferenceNumber: Yup.string().required("Required"),
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
      <div className="container mt-3 mb-3">
        <div className="row cols-1 justify-content-center">
          <div className="col col-md-6 p-5 form-section border border-1 rounded">
            <Formik
              initialValues={{
                ISO8583Message: "",
                merchantID: "",
                customerID: "",
                loanReferenceNumber: "",
                executionMode: "auto",
                roleId,
              }}
              validationSchema={ISO8583Schema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                console.log("Inside onsubmit");
                try {
                  setSubmitting(true);
                  const response = await axios.post(iso8583requesturl, values, {
                    header: { "Content-Type": "application/json" },
                  });
                  setSubmitting(false);
                  resetForm();
                  console.log(response);
                  setShow(true);
                  setPopupData({
                    header: "Success",
                    content: "Form submitted successfully",
                  });
                } catch (error) {
                  console.log(error);
                  setSubmitting(false);
                  setShow(true);
                  setPopupData({
                    header: "Failed",
                    content: "Form submission failed",
                  });
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                resetForm,
                setFieldValue,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="form-group" controlId="ISO8583Message">
                    <Form.Label>ISO8583 Message :</Form.Label>
                    <Form.Control
                      type="text"
                      name="ISO8583Message"
                      placeholder="ISO8583 Message"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.ISO8583Message}
                      className={
                        touched.ISO8583Message && errors.ISO8583Message
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.ISO8583Message && errors.ISO8583Message ? (
                      <div className="error-message">
                        {errors.ISO8583Message}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="merchantID">
                    <Form.Label>Merchant ID :</Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantID"
                      placeholder="Merchant ID"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.merchantID}
                      className={
                        touched.merchantID && errors.merchantID
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.merchantID && errors.merchantID ? (
                      <div className="error-message">{errors.merchantID}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="customerID">
                    <Form.Label>Customer ID :</Form.Label>
                    <Form.Control
                      type="text"
                      name="customerID"
                      placeholder="Customer ID"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.customerID}
                      className={
                        touched.customerID && errors.customerID
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.customerID && errors.customerID ? (
                      <div className="error-message">{errors.customerID}</div>
                    ) : null}
                  </Form.Group>

                  <Form.Group
                    className="form-group"
                    controlId="loanReferenceNumber"
                  >
                    <Form.Label>Loan Reference Number :</Form.Label>
                    <Form.Control
                      type="text"
                      name="loanReferenceNumber"
                      placeholder="Loan Reference Number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.loanReferenceNumber}
                      className={
                        touched.loanReferenceNumber &&
                        errors.loanReferenceNumber
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.loanReferenceNumber &&
                    errors.loanReferenceNumber ? (
                      <div className="error-message">
                        {errors.loanReferenceNumber}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>Execution Mode :</Form.Label>

                    <Form.Check
                      type="radio"
                      name="executionMode"
                      id="executioModeManual"
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
                      id="executioModeAuto"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      checked={values.executionMode === "auto"}
                      label="Auto"
                      value="auto"
                      inline
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-between">
                    <Button
                      className="bg-light text-primary"
                      type="button"
                      onClick={resetForm}
                    >
                      Reset
                    </Button>
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

export default SingleRequest;
