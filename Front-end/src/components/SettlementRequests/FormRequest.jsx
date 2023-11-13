import React, { useState } from "react";
import "./FormRequest.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";

const FormRequest = (props) => {
  const settlementFormUrl = "http://localhost:3001/api/v1/merchantTx";

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({ header: "", content: "" });

  const handleClose = () => setShow(false);

  const ISO8583Schema = Yup.object().shape({
    merchantId: Yup.string().required("Required"),
    merchantName: Yup.string().required("Required"),
    CustomerName: Yup.string().required("Required"),
    CustomerID: Yup.string().required("Required"),
    TransactionCurrency: Yup.string().required("Required"),
    TransactionAmount: Yup.string().required("Required"),
    TransactionReferenceNumber: Yup.string().required("Required"),
    TransactionDate: Yup.date().required("Required"),
    LoanReferenceNumber: Yup.string().required("Required"),
    ProductType: Yup.string().required("Required"),
    DateofLoanApproval: Yup.date().required("Required"),
    Location: Yup.string().required("Required"),
    POSEntryMode: Yup.string().required("Required"),
    LoanDisbursementDate: Yup.string().required("Required"),
    LoanAmount: Yup.string().required("Required"),
    LoanTenure: Yup.string().required("Required"),
    LoanStatus: Yup.string().required("Required"),
    LoanAccountNumber: Yup.string().required("Required"),
    LoCapprovedamount: Yup.string().required("Required"),
    LoCAvailableamount: Yup.string().required("Required"),
    isContractSigned: Yup.string().required("Required"),
    SubmittedBy: Yup.string().required("Required"),
    SubmissionNumberRef: Yup.string().required("Required"),
    ServiceDate: Yup.date().required("Required"),
    SubmissionDateTime: Yup.date().required("Required"),
    executionMode: Yup.string().required("Required"),
    roleId: Yup.string().required("Required"),
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
      <div className="container mt-3 mb-3">
        <Formik
          initialValues={{
            merchantId: "",
            merchantName: "",
            CustomerName: "",
            CustomerID: "",
            TransactionCurrency: "",
            TransactionAmount: "",
            TransactionReferenceNumber: "",
            TransactionDate: "",
            LoanReferenceNumber: "",
            ProductType: "",
            DateofLoanApproval: "",
            Location: "",
            POSEntryMode: "",
            LoanDisbursementDate: "",
            LoanAmount: "",
            LoanTenure: "",
            LoanStatus: "",
            LoanAccountNumber: "",
            LoCapprovedamount: "",
            LoCAvailableamount: "",
            isContractSigned: "",
            SubmittedBy: "",
            SubmissionNumberRef: "",
            ServiceDate: "",
            SubmissionDateTime: "",
            executionMode: "auto",
            roleId: props.roleId,
          }}
          validationSchema={ISO8583Schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            console.log("Inside onsubmit");
            try {
              setSubmitting(true);
              const response = await axios.post(settlementFormUrl, values, {
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
              <div className="row cols-md-2 justify-content-center">
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">A. Transaction Details</h6>
                  <Form.Group
                    className="form-group"
                    controlId="TransactionAmount"
                  >
                    <Form.Label>Transaction Amount :</Form.Label>
                    <Form.Control
                      type="text"
                      name="TransactionAmount"
                      placeholder="Transaction Amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionAmount}
                      className={
                        touched.TransactionAmount && errors.TransactionAmount
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionAmount && errors.TransactionAmount ? (
                      <div className="error-message">
                        {errors.TransactionAmount}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="TransactionCurrency"
                  >
                    <Form.Label>Transaction Currency :</Form.Label>
                    <Form.Control
                      type="text"
                      name="TransactionCurrency"
                      placeholder="Transaction Currency"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionCurrency}
                      className={
                        touched.TransactionCurrency &&
                        errors.TransactionCurrency
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionCurrency &&
                    errors.TransactionCurrency ? (
                      <div className="error-message">
                        {errors.TransactionCurrency}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="TransactionReferenceNumber"
                  >
                    <Form.Label>Transaction Reference Number :</Form.Label>
                    <Form.Control
                      type="text"
                      name="TransactionReferenceNumber"
                      placeholder="Transaction Reference Number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionReferenceNumber}
                      className={
                        touched.TransactionReferenceNumber &&
                        errors.TransactionReferenceNumber
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionReferenceNumber &&
                    errors.TransactionReferenceNumber ? (
                      <div className="error-message">
                        {errors.TransactionReferenceNumber}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group
                    className="form-group"
                    controlId="TransactionDate"
                  >
                    <Form.Label>Transaction Date :</Form.Label>
                    <Form.Control
                      type="date"
                      name="TransactionDate"
                      placeholder="Transaction Date"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionDate}
                      className={
                        touched.TransactionDate && errors.TransactionDate
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionDate && errors.TransactionDate ? (
                      <div className="error-message">
                        {errors.TransactionDate}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group" controlId="merchantId">
                    <Form.Label>Merchant ID :</Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantId"
                      placeholder="Merchant ID"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.merchantId}
                      className={
                        touched.merchantId && errors.merchantId
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.merchantId && errors.merchantId ? (
                      <div className="error-message">{errors.merchantId}</div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group" controlId="Location">
                    <Form.Label>Location :</Form.Label>
                    <Form.Control
                      type="text"
                      name="Location"
                      placeholder="Location"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.Location}
                      className={
                        touched.Location && errors.Location ? "has-error" : null
                      }
                    />
                    {touched.Location && errors.Location ? (
                      <div className="error-message">{errors.Location}</div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group" controlId="POSEntryMode">
                    <Form.Label>POS Entry Mode :</Form.Label>
                    <Form.Control
                      type="text"
                      name="POSEntryMode"
                      placeholder="POS Entry Mode"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.POSEntryMode}
                      className={
                        touched.POSEntryMode && errors.POSEntryMode
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.POSEntryMode && errors.POSEntryMode ? (
                      <div className="error-message">{errors.POSEntryMode}</div>
                    ) : null}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">B. Submission Details</h6>
                  <Form.Group className="form-group" controlId="SubmittedBy">
                    <Form.Label>Submitted By :</Form.Label>
                    <Form.Control
                      type="text"
                      name="SubmittedBy"
                      placeholder="Submitted By"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.SubmittedBy}
                      className={
                        touched.SubmittedBy && errors.SubmittedBy
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.SubmittedBy && errors.SubmittedBy ? (
                      <div className="error-message">{errors.SubmittedBy}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="SubmissionNumberRef"
                  >
                    <Form.Label>Submission Number Ref. :</Form.Label>
                    <Form.Control
                      type="text"
                      name="SubmissionNumberRef"
                      placeholder="Submission Number Ref."
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.SubmissionNumberRef}
                      className={
                        touched.SubmissionNumberRef &&
                        errors.SubmissionNumberRef
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.SubmissionNumberRef &&
                    errors.SubmissionNumberRef ? (
                      <div className="error-message">
                        {errors.SubmissionNumberRef}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="ServiceDate">
                    <Form.Label>Service Date :</Form.Label>
                    <Form.Control
                      type="date"
                      name="ServiceDate"
                      placeholder="Service Date"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.ServiceDate}
                      className={
                        touched.ServiceDate && errors.ServiceDate
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.ServiceDate && errors.ServiceDate ? (
                      <div className="error-message">{errors.ServiceDate}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="SubmissionDateTime"
                  >
                    <Form.Label>Submission Date and Time :</Form.Label>
                    <Form.Control
                      type="date"
                      name="SubmissionDateTime"
                      placeholder="Submission Date and Time"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.SubmissionDateTime}
                      className={
                        touched.SubmissionDateTime && errors.SubmissionDateTime
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.SubmissionDateTime && errors.SubmissionDateTime ? (
                      <div className="error-message">
                        {errors.SubmissionDateTime}
                      </div>
                    ) : null}
                  </Form.Group>
                </div>
              </div>
              <div className="row cols-md-2 justify-content-around">
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">C. Customer Info</h6>

                  <Form.Group className="form-group" controlId="CustomerName">
                    <Form.Label>Customer Name :</Form.Label>
                    <Form.Control
                      type="text"
                      name="CustomerName"
                      placeholder="Customer Name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.CustomerName}
                      className={
                        touched.CustomerName && errors.CustomerName
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.CustomerName && errors.CustomerName ? (
                      <div className="error-message">{errors.CustomerName}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="CustomerID">
                    <Form.Label>Customer ID :</Form.Label>
                    <Form.Control
                      type="text"
                      name="CustomerID"
                      placeholder="Customer ID"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.CustomerID}
                      className={
                        touched.CustomerID && errors.CustomerID
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.CustomerID && errors.CustomerID ? (
                      <div className="error-message">{errors.CustomerID}</div>
                    ) : null}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">D. Line of Credit (LOC) Details</h6>

                  <Form.Group
                    className="form-group"
                    controlId="LoanReferenceNumber"
                  >
                    <Form.Label>Loan Reference Number :</Form.Label>
                    <Form.Control
                      type="text"
                      name="LoanReferenceNumber"
                      placeholder="Loan Reference Number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.LoanReferenceNumber}
                      className={
                        touched.LoanReferenceNumber &&
                        errors.LoanReferenceNumber
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.LoanReferenceNumber &&
                    errors.LoanReferenceNumber ? (
                      <div className="error-message">
                        {errors.LoanReferenceNumber}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="LoanAccountNumber"
                  >
                    <Form.Label>Loan Account Number :</Form.Label>
                    <Form.Control
                      type="text"
                      name="LoanAccountNumber"
                      placeholder="Loan Account Number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.LoanAccountNumber}
                      className={
                        touched.LoanAccountNumber && errors.LoanAccountNumber
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.LoanAccountNumber && errors.LoanAccountNumber ? (
                      <div className="error-message">
                        {errors.LoanAccountNumber}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="DateofLoanApproval"
                  >
                    <Form.Label>Loan Approval Date :</Form.Label>
                    <Form.Control
                      type="date"
                      name="DateofLoanApproval"
                      placeholder="Loan Approval Date"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.DateofLoanApproval}
                      className={
                        touched.DateofLoanApproval && errors.DateofLoanApproval
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.DateofLoanApproval && errors.DateofLoanApproval ? (
                      <div className="error-message">
                        {errors.DateofLoanApproval}
                      </div>
                    ) : null}
                  </Form.Group>
                </div>
              </div>
              <div className="row cols-md-1 justify-content-around">
                <div className="col col-6 m-3 p-5 form-section border border-1 rounded">
                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>Execution Mode :</Form.Label>

                    <Form.Check
                      type="radio"
                      name="executionMode"
                      id="executionModeManual"
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
                      id="executionModeAuto"
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
                  {isSubmitting && <button className="loaderSubmit"></button>}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FormRequest;
