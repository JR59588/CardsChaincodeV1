import React, { useState } from "react";
import "./OnboardFormik.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader/Loader";

const OnboardFormik = (props) => {
  const settlementFormUrl =
    "http://localhost:3001/api/v1/saveOBMerchantSummary";

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({ header: "", content: "" });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleClose = () => setShow(false);

  const onboardingSchema = Yup.object().shape({
    kycStatus: Yup.string().required("Required"),
    isContractSigned: Yup.string().required("Required"),
    securityDeposits: Yup.string().required("Required"),
    numberOfPOSTerminalsRequired: Yup.string().required("Required"),
    merchantBankCode: Yup.string().required("Required"),
    merchantAccountNumber: Yup.string().required("Required"),
    transactionGeographiesAllowed: Yup.string().required("Required"),
    txcMaxTxAmount: Yup.string().required("Required"),
    txcMinTxAmount: Yup.string().required("Required"),
    txcTxCurrency: Yup.string().required("Required"),
    txcMaxTxPerDay: Yup.string().required("Required"),
    promoCode: Yup.string().required("Required"),
    txcNegotiatedMDR: Yup.string().required("Required"),
    product: Yup.string().required("Required"),
    merchantCategoryCode: Yup.string().required("Required"),
    merchantDescription: Yup.string().required("Required"),
    merchantID: Yup.string().required("Required"),
    merchantName: Yup.string().required("Required"),
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
        <Modal.Body>
          <div>
            <div>{popupData.content}</div>
            <div>{popupData.reason}</div>
          </div>
        </Modal.Body>
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
            kycStatus: "",
            isContractSigned: "",
            securityDeposits: "",
            numberOfPOSTerminalsRequired: "",
            merchantBankCode: "",
            merchantAccountNumber: "",
            transactionGeographiesAllowed: "",
            txcMaxTxAmount: "",
            txcMinTxAmount: "",
            txcTxCurrency: "",
            txcMaxTxPerDay: "",
            promoCode: "",
            txcNegotiatedMDR: "",
            product: "",
            merchantCategoryCode: "",
            merchantDescription: "",
            merchantCategoryCode: "",
            merchantName: "",
            MerchantId: "MID",
            CustomerId: "CID",
          }}
          validationSchema={onboardingSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            console.log("Inside onsubmit");
            try {
              setSubmitting(true);
              setIsFormSubmitting(true);
              const response = await axios.post(
                settlementFormUrl,
                {
                  ...values,
                  customerID: "C" + values.merchantID,
                  roleId: props.roleId,
                },
                {
                  header: { "Content-Type": "application/json" },
                }
              );
              setSubmitting(false);
              resetForm();
              console.log(response);
              setShow(true);
              setPopupData({
                header: "Success",
                content: `Merchant ${values.merchantName} Onboarded successfully`,
                reason: "",
              });
            } catch (error) {
              console.log(error);
              setSubmitting(false);
              setShow(true);
              setPopupData({
                header: "Sorry",
                content: "Form submission failed",
                reason: error.response.data.message,
              });
            }
            setIsFormSubmitting(false);
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
                  <Form.Group className="form-group" controlId="merchantName">
                    <Form.Label>Payment Acceptor Name :</Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantName"
                      placeholder="Payment Acceptor Name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.merchantName}
                      className={
                        touched.merchantName && errors.merchantName
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.merchantName && errors.merchantName ? (
                      <div className="error-message">{errors.merchantName}</div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group" controlId="merchantID">
                    <Form.Label>
                      Payment Acceptor Identification Code :
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantID"
                      placeholder="Payment Acceptor Identification Code"
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

                  <Form.Group
                    className="form-group"
                    controlId="merchantDescription"
                  >
                    <Form.Label>Payment Acceptor Description :</Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantDescription"
                      placeholder="Payment Acceptor Description"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.merchantDescription}
                      className={
                        touched.merchantDescription &&
                        errors.merchantDescription
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.merchantDescription &&
                    errors.merchantDescription ? (
                      <div className="error-message">
                        {errors.merchantDescription}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group controlId="merchantCategoryCode" className="mb-3">
                    <Form.Label>Merchant Category Code :</Form.Label>
                    <Form.Select
                      aria-label="Merchant Category Code"
                      onChange={(event) => {
                        setFieldValue(
                          "merchantCategoryCode",
                          event.target.value
                        );
                      }}
                      onBlur={handleBlur}
                      style={{ height: "100%" }}
                      className={
                        touched.merchantCategoryCode &&
                        errors.merchantCategoryCode
                          ? "has-error"
                          : null
                      }
                    >
                      <option value="">Select Merchant Category Code</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Travel">Travel</option>
                      <option value="Luxury">Luxury</option>
                      <option value="OilAndGases">Oil {"&"} Gases</option>
                    </Form.Select>
                    {touched.merchantCategoryCode &&
                    errors.merchantCategoryCode ? (
                      <div className="error-message">
                        {errors.merchantCategoryCode}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group controlId="product" className="mb-3">
                    <Form.Label>product:</Form.Label>
                    <Form.Select
                      aria-label="product"
                      onChange={(event) => {
                        setFieldValue("product", event.target.value);
                      }}
                      onBlur={handleBlur}
                      style={{ height: "100%" }}
                      className={
                        touched.product && errors.product ? "has-error" : null
                      }
                    >
                      <option value="">Select product Type</option>
                      <option value="PR1">PR1</option>
                      <option value="PR2">PR2</option>
                      <option value="PR3">PR3</option>
                      <option value="PR4">PR4</option>
                    </Form.Select>
                    {touched.product && errors.product ? (
                      <div className="error-message">{errors.product}</div>
                    ) : null}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">C. Transaction criteria/thresholds</h6>
                  <Form.Group controlId="txcNegotiatedMDR" className="mb-3">
                    <Form.Label>Negotiated MDR :</Form.Label>
                    <Form.Select
                      aria-label="Negotiated MDR"
                      onChange={(event) => {
                        setFieldValue("txcNegotiatedMDR", event.target.value);
                      }}
                      onBlur={handleBlur}
                      style={{ height: "100%" }}
                      className={
                        touched.txcNegotiatedMDR && errors.txcNegotiatedMDR
                          ? "has-error"
                          : null
                      }
                    >
                      <option value="">Select Negotiated MDR</option>
                      <option value="1.5">1.5</option>
                      <option value="2.0">2.0</option>
                      <option value="2.5">2.5</option>
                    </Form.Select>
                    {touched.txcNegotiatedMDR && errors.txcNegotiatedMDR ? (
                      <div className="error-message">
                        {errors.txcNegotiatedMDR}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="promoCode">
                    <Form.Label>Promo Code :</Form.Label>
                    <Form.Control
                      type="text"
                      name="promoCode"
                      placeholder="Promo Code"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.promoCode}
                      className={
                        touched.promoCode && errors.promoCode
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.promoCode && errors.promoCode ? (
                      <div className="error-message">{errors.promoCode}</div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcMaxTxPerDay">
                    <Form.Label>
                      Number of Transactions Allowed Per Day :
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="txcMaxTxPerDay"
                      placeholder="Number of Transactions Allowed Per Day"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.txcMaxTxPerDay}
                      className={
                        touched.txcMaxTxPerDay && errors.txcMaxTxPerDay
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.txcMaxTxPerDay && errors.txcMaxTxPerDay ? (
                      <div className="error-message">
                        {errors.txcMaxTxPerDay}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcTxCurrency">
                    <Form.Label>Transaction Currency :</Form.Label>
                    <Form.Control
                      type="text"
                      name="txcTxCurrency"
                      placeholder="Transaction Currency"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.txcTxCurrency}
                      className={
                        touched.txcTxCurrency && errors.txcTxCurrency
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.txcTxCurrency && errors.txcTxCurrency ? (
                      <div className="error-message">
                        {errors.txcTxCurrency}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcMinTxAmount">
                    <Form.Label>Transaction Minimum Amount :</Form.Label>
                    <Form.Control
                      type="text"
                      name="txcMinTxAmount"
                      placeholder="Transaction Minimum Amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.txcMinTxAmount}
                      className={
                        touched.txcMinTxAmount && errors.txcMinTxAmount
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.txcMinTxAmount && errors.txcMinTxAmount ? (
                      <div className="error-message">
                        {errors.txcMinTxAmount}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcMaxTxAmount">
                    <Form.Label>Transaction Maximum Amount :</Form.Label>
                    <Form.Control
                      type="text"
                      name="txcMaxTxAmount"
                      placeholder="Transaction Maximum Amount"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.txcMaxTxAmount}
                      className={
                        touched.txcMaxTxAmount && errors.txcMaxTxAmount
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.txcMaxTxAmount && errors.txcMaxTxAmount ? (
                      <div className="error-message">
                        {errors.txcMaxTxAmount}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="transactionGeographiesAllowed"
                  >
                    <Form.Label>Transaction Geographies Allowed :</Form.Label>
                    <Form.Control
                      type="text"
                      name="transactionGeographiesAllowed"
                      placeholder="Transaction Geographies Allowed"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.transactionGeographiesAllowed}
                      className={
                        touched.transactionGeographiesAllowed &&
                        errors.transactionGeographiesAllowed
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.transactionGeographiesAllowed &&
                    errors.transactionGeographiesAllowed ? (
                      <div className="error-message">
                        {errors.transactionGeographiesAllowed}
                      </div>
                    ) : null}
                  </Form.Group>
                </div>
              </div>
              <div className="row cols-md-2 justify-content-around">
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">B. Merchant Bank Details</h6>

                  <Form.Group
                    className="form-group"
                    controlId="merchantAccountNumber"
                  >
                    <Form.Label>Account Number :</Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantAccountNumber"
                      placeholder="Account Number"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.merchantAccountNumber}
                      className={
                        touched.merchantAccountNumber &&
                        errors.merchantAccountNumber
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.merchantAccountNumber &&
                    errors.merchantAccountNumber ? (
                      <div className="error-message">
                        {errors.merchantAccountNumber}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="merchantBankCode"
                  >
                    <Form.Label>Bank Identifier :</Form.Label>
                    <Form.Control
                      type="text"
                      name="merchantBankCode"
                      placeholder="Bank Identifier"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.merchantBankCode}
                      className={
                        touched.merchantBankCode && errors.merchantBankCode
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.merchantBankCode && errors.merchantBankCode ? (
                      <div className="error-message">
                        {errors.merchantBankCode}
                      </div>
                    ) : null}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">D. POS Terminal Details</h6>

                  <Form.Group
                    className="form-group"
                    controlId="numberOfPOSTerminalsRequired"
                  >
                    <Form.Label>Number of POS Terminals :</Form.Label>
                    <Form.Control
                      type="text"
                      name="numberOfPOSTerminalsRequired"
                      placeholder="Number of POS Terminals"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.numberOfPOSTerminalsRequired}
                      className={
                        touched.numberOfPOSTerminalsRequired &&
                        errors.numberOfPOSTerminalsRequired
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.numberOfPOSTerminalsRequired &&
                    errors.numberOfPOSTerminalsRequired ? (
                      <div className="error-message">
                        {errors.numberOfPOSTerminalsRequired}
                      </div>
                    ) : null}
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="securityDeposits"
                  >
                    <Form.Label>Security Deposits :</Form.Label>
                    <Form.Control
                      type="text"
                      name="securityDeposits"
                      placeholder="Security Deposits"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.securityDeposits}
                      className={
                        touched.securityDeposits && errors.securityDeposits
                          ? "has-error"
                          : null
                      }
                    />
                    {touched.securityDeposits && errors.securityDeposits ? (
                      <div className="error-message">
                        {errors.securityDeposits}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>Contract Signed With Merchant :</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        name="isContractSigned"
                        id="isContractSignedYes"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        checked={values.isContractSigned === "yes"}
                        label="Yes"
                        value="yes"
                        inline
                      />
                      <Form.Check
                        type="radio"
                        name="isContractSigned"
                        id="isContractSignedNo"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        checked={values.isContractSigned === "no"}
                        label="No"
                        value="no"
                        inline
                      />
                    </div>

                    {touched.isContractSigned && errors.isContractSigned ? (
                      <div className="error-message">
                        {errors.isContractSigned}
                      </div>
                    ) : null}
                  </Form.Group>

                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>KYC Status :</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        name="kycStatus"
                        id="kycStatusYes"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        checked={values.kycStatus === "yes"}
                        label="Yes"
                        value="yes"
                        inline
                      />
                      <Form.Check
                        type="radio"
                        name="kycStatus"
                        id="kycStatusNo"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        checked={values.kycStatus === "no"}
                        label="No"
                        value="no"
                        inline
                      />
                    </div>

                    {touched.kycStatus && errors.kycStatus ? (
                      <div className="error-message">{errors.kycStatus}</div>
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
