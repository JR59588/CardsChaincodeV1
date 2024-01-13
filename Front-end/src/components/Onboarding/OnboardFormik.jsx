import React, { useState } from "react";
import "./OnboardFormik.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader/Loader";

const OnboardFormik = (props) => {
  const settlementFormUrl = "http://localhost:3001/api/v1/merchantTx";

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({ header: "", content: "" });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleClose = () => setShow(false);

  const ISO8583Schema = Yup.object().shape({
    merchantId: Yup.string().required("Required"),
    merchantName: Yup.string().required("Required"),
    AccountNumber: Yup.string().required("Required"),
    BankIdentifier: Yup.string().required("Required"),
    PaymentAcceptorIdentificationCode: Yup.string().required("Required"),
    PaymentAcceptorName: Yup.string().required("Required"),
    PaymentAcceptorDescription: Yup.string().required("Required"),
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
    PromoCode: Yup.string().required("Required"),
    NumberOfTransactionsAllowedPerDay: Yup.string().required("Required"),
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
        <h3 className="text-center">Merchant Onboarding</h3>
        <Formik
          initialValues={{
            PaymentAcceptorIdentificationCode: "",
            PaymentAcceptorName: "",
            PaymentAcceptorDescription: "",
            TransactionDate: "",
            LoanReferenceNumber: "",
            ProductType: "",
            Product: "",
            NegotiatedMDR: "",
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
            PromoCode: "",
            NumberOfTransactionsAllowedPerDay: "",
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
                  <h6 className="mb-3">A. Merchant Profile</h6>
                  <Form.Group
                    className="form-group"
                    controlId="PaymentAcceptorName"
                  >
                    <Form.Label>Payment Acceptor Name :</Form.Label>
                    <Form.Control
                      type="text"
                      name="PaymentAcceptorName"
                      placeholder="Payment Acceptor Name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.PaymentAcceptorName}
                      className={
                        touched.PaymentAcceptorName &&
                        errors.PaymentAcceptorName
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.PaymentAcceptorName &&
                    errors.PaymentAcceptorName ? (
                      <div className="error-message">
                        {errors.PaymentAcceptorName}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group
                    className="form-group"
                    controlId="PaymentAcceptorIdentificationCode"
                  >
                    <Form.Label>
                      Payment Acceptor Identification Code :
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="PaymentAcceptorIdentificationCode"
                      placeholder="Payment Acceptor Identification Code"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.PaymentAcceptorIdentificationCode}
                      className={
                        touched.PaymentAcceptorIdentificationCode &&
                        errors.PaymentAcceptorIdentificationCode
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.PaymentAcceptorIdentificationCode &&
                    errors.PaymentAcceptorIdentificationCode ? (
                      <div className="error-message">
                        {errors.PaymentAcceptorIdentificationCode}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group
                    className="form-group"
                    controlId="PaymentAcceptorDescription"
                  >
                    <Form.Label>Payment Acceptor Description :</Form.Label>
                    <Form.Control
                      type="text"
                      name="PaymentAcceptorDescription"
                      placeholder="Payment Acceptor Description"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.PaymentAcceptorDescription}
                      className={
                        touched.PaymentAcceptorDescription &&
                        errors.PaymentAcceptorDescription
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.PaymentAcceptorDescription &&
                    errors.PaymentAcceptorDescription ? (
                      <div className="error-message">
                        {errors.PaymentAcceptorDescription}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group controlId="fileType" className="mb-3">
                    <Form.Label>Merchant Category Code:</Form.Label>
                    <Form.Select
                      aria-label="Merchant Category Code"
                      onChange={(event) => {
                        setFieldValue("fileType", event.target.value);
                      }}
                      onBlur={handleBlur}
                      style={{ height: "100%" }}
                    >
                      <option value="">Merchant Category Code</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Travel">Travel</option>
                      <option value="Luxury">Luxury</option>
                      <option value="OilAndGases">Oil {"&"} Gases</option>
                    </Form.Select>
                    {touched.fileType && errors.fileType ? (
                      <div className="error-message">{errors.fileType}</div>
                    ) : null}
                  </Form.Group>

                  <Form.Group controlId="Product" className="mb-3">
                    <Form.Label>Product:</Form.Label>
                    <Form.Select
                      aria-label="Product"
                      onChange={(event) => {
                        setFieldValue("Product", event.target.value);
                      }}
                      onBlur={handleBlur}
                      style={{ height: "100%" }}
                    >
                      <option value="">Select Product Type</option>
                      <option value="PR1">PR1</option>
                      <option value="PR2">PR2</option>
                      <option value="PR3">PR3</option>
                      <option value="PR4">PR4</option>
                    </Form.Select>
                    {touched.Product && errors.Product ? (
                      <div className="error-message">{errors.Product}</div>
                    ) : null}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">C. Transaction criteria/thresholds</h6>
                  <Form.Group controlId="NegotiatedMDR" className="mb-3">
                    <Form.Label>NegotiatedMDR:</Form.Label>
                    <Form.Select
                      aria-label="NegotiatedMDR"
                      onChange={(event) => {
                        setFieldValue("NegotiatedMDR", event.target.value);
                      }}
                      onBlur={handleBlur}
                      style={{ height: "100%" }}
                    >
                      <option value="">Select NegotiatedMDR Type</option>
                      <option value="1.5">1.5</option>
                      <option value="2.0">2.0</option>
                      <option value="2.5">2.5</option>
                    </Form.Select>
                    {touched.NegotiatedMDR && errors.NegotiatedMDR ? (
                      <div className="error-message">
                        {errors.NegotiatedMDR}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="PromoCode">
                    <Form.Label>Promo Code :</Form.Label>
                    <Form.Control
                      type="text"
                      name="PromoCode"
                      placeholder="Promo Code"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.PromoCode}
                      className={
                        touched.PromoCode && errors.PromoCode
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.PromoCode && errors.PromoCode ? (
                      <div className="error-message">{errors.PromoCode}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="NumberOfTransactionsAllowedPerDay"
                  >
                    <Form.Label>
                      Number of Transactions Allowed Per Day :
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="NumberOfTransactionsAllowedPerDay"
                      placeholder="Number of Transactions Allowed Per Day"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.NumberOfTransactionsAllowedPerDay}
                      className={
                        touched.NumberOfTransactionsAllowedPerDay &&
                        errors.NumberOfTransactionsAllowedPerDay
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.NumberOfTransactionsAllowedPerDay &&
                    errors.NumberOfTransactionsAllowedPerDay ? (
                      <div className="error-message">
                        {errors.NumberOfTransactionsAllowedPerDay}
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
                    controlId="TransactionMinimumAmount"
                  >
                    <Form.Label>Transaction Minimum Amount :</Form.Label>
                    <Form.Control
                      type="text"
                      name="TransactionMinimumAmount"
                      placeholder="Transaction Minimum Amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionMinimumAmount}
                      className={
                        touched.TransactionMinimumAmount &&
                        errors.TransactionMinimumAmount
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionMinimumAmount &&
                    errors.TransactionMinimumAmount ? (
                      <div className="error-message">
                        {errors.TransactionMinimumAmount}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="TransactionMaximumAmount"
                  >
                    <Form.Label>Transaction Maximum Amount :</Form.Label>
                    <Form.Control
                      type="text"
                      name="TransactionMaximumAmount"
                      placeholder="Transaction Maximum Amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionMaximumAmount}
                      className={
                        touched.TransactionMaximumAmount &&
                        errors.TransactionMaximumAmount
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionMaximumAmount &&
                    errors.TransactionMaximumAmount ? (
                      <div className="error-message">
                        {errors.TransactionMaximumAmount}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="TransactionGeographiesAllowed"
                  >
                    <Form.Label>Transaction Geographies Allowed :</Form.Label>
                    <Form.Control
                      type="text"
                      name="TransactionGeographiesAllowed"
                      placeholder="Transaction Geographies Allowed"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.TransactionGeographiesAllowed}
                      className={
                        touched.TransactionGeographiesAllowed &&
                        errors.TransactionGeographiesAllowed
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.TransactionGeographiesAllowed &&
                    errors.TransactionGeographiesAllowed ? (
                      <div className="error-message">
                        {errors.TransactionGeographiesAllowed}
                      </div>
                    ) : null}
                  </Form.Group>
                </div>
              </div>
              <div className="row cols-md-2 justify-content-around">
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">B. Merchant Bank Details</h6>

                  <Form.Group className="form-group" controlId="AccountNumber">
                    <Form.Label>Account Number :</Form.Label>
                    <Form.Control
                      type="text"
                      name="AccountNumber"
                      placeholder="Account Number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.AccountNumber}
                      className={
                        touched.AccountNumber && errors.AccountNumber
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.AccountNumber && errors.AccountNumber ? (
                      <div className="error-message">
                        {errors.AccountNumber}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="BankIdentifier">
                    <Form.Label>Bank Identifier :</Form.Label>
                    <Form.Control
                      type="text"
                      name="BankIdentifier"
                      placeholder="Bank Identifier"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.BankIdentifier}
                      className={
                        touched.BankIdentifier && errors.BankIdentifier
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.BankIdentifier && errors.BankIdentifier ? (
                      <div className="error-message">
                        {errors.BankIdentifier}
                      </div>
                    ) : null}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">D. POS Terminal Details</h6>

                  <Form.Group
                    className="form-group"
                    controlId="NumberOfPosTerminals"
                  >
                    <Form.Label>Number of POS Terminals :</Form.Label>
                    <Form.Control
                      type="text"
                      name="NumberOfPosTerminals"
                      placeholder="Number of POS Terminals"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.NumberOfPosTerminals}
                      className={
                        touched.NumberOfPosTerminals &&
                        errors.NumberOfPosTerminals
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.NumberOfPosTerminals &&
                    errors.NumberOfPosTerminals ? (
                      <div className="error-message">
                        {errors.NumberOfPosTerminals}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="SecurityDeposits"
                  >
                    <Form.Label>Security Deposits :</Form.Label>
                    <Form.Control
                      type="text"
                      name="SecurityDeposits"
                      placeholder="Security Deposits"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.SecurityDeposits}
                      className={
                        touched.SecurityDeposits && errors.SecurityDeposits
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.SecurityDeposits && errors.SecurityDeposits ? (
                      <div className="error-message">
                        {errors.SecurityDeposits}
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
              <div className="row justify-content-center">
                <div className="col col-3">
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
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default OnboardFormik;
