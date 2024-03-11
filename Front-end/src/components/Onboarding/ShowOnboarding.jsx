import React, { useState } from "react";
import "./ShowOnboarding.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader/Loader";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const ShowOnboarding = (props) => {
  const [loading, setLoading] = useState(false);
  const [onboardedMerchantDetails, setOnboardedMerchantDetails] = useState({});
  const [merchantId, setMerchantId] = useState(null);
  const [error, setError] = useState(null);

  const merchantIdSchema = Yup.object().shape({
    merchantId: Yup.string().required("Required"),
  });

  const fetchOnboardedMerchantDetails = async (merchantId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${apiBaseUrl}/lookUpMerchantMetaData/${merchantId}`
      );
      setOnboardedMerchantDetails(response.data.response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error in fetching onboarded merchant details");
      setError("Error fetching onboarded merchant details");
    }
  };

  return merchantId ? (
    <div className="mt-3">
      <div className="container mt-3 mb-3">
        <Form>
          <div className="row cols-md-2 justify-content-center">
            <div className="col m-3 p-5 form-section border border-1 rounded">
              <h6 className="mb-3">A. Transaction Details</h6>
              <Form.Group className="form-group" controlId="TransactionAmount">
                <Form.Label>Transaction Amount :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="TransactionAmount"
                  placeholder="Transaction Amount"
                  value={onboardedMerchantDetails.TransactionAmount}
                />
              </Form.Group>
              <Form.Group
                className="form-group"
                controlId="TransactionCurrency"
              >
                <Form.Label>Transaction Currency :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="TransactionCurrency"
                  placeholder="Transaction Currency"
                  value={onboardedMerchantDetails.TransactionCurrency}
                />
              </Form.Group>
              <Form.Group
                className="form-group"
                controlId="TransactionReferenceNumber"
              >
                <Form.Label>Transaction Reference Number :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="TransactionReferenceNumber"
                  placeholder="Transaction Reference Number"
                  value={onboardedMerchantDetails.TransactionReferenceNumber}
                />
              </Form.Group>

              <Form.Group className="form-group" controlId="TransactionDate">
                <Form.Label>Transaction Date :</Form.Label>
                <Form.Control
                  disabled
                  type="date"
                  name="TransactionDate"
                  placeholder="Transaction Date"
                  value={onboardedMerchantDetails.TransactionDate}
                />
              </Form.Group>

              <Form.Group className="form-group" controlId="merchantId">
                <Form.Label>Merchant ID :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="merchantId"
                  placeholder="Merchant ID"
                  value={onboardedMerchantDetails.merchantId}
                />
              </Form.Group>

              <Form.Group className="form-group" controlId="Location">
                <Form.Label>Location :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="Location"
                  placeholder="Location"
                  value={onboardedMerchantDetails.Location}
                />
              </Form.Group>

              <Form.Group className="form-group" controlId="POSEntryMode">
                <Form.Label>POS Entry Mode :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="POSEntryMode"
                  placeholder="POS Entry Mode"
                  value={onboardedMerchantDetails.POSEntryMode}
                />
              </Form.Group>
            </div>
            <div className="col m-3 p-5 form-section border border-1 rounded">
              <h6 className="mb-3">B. Submission Details</h6>
              <Form.Group className="form-group" controlId="SubmittedBy">
                <Form.Label>Submitted By :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="SubmittedBy"
                  placeholder="Submitted By"
                  value={onboardedMerchantDetails.SubmittedBy}
                />
              </Form.Group>
              <Form.Group
                className="form-group"
                controlId="SubmissionNumberRef"
              >
                <Form.Label>Submission Number Ref. :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="SubmissionNumberRef"
                  placeholder="Submission Number Ref."
                  value={onboardedMerchantDetails.SubmissionNumberRef}
                />
              </Form.Group>
              <Form.Group className="form-group" controlId="ServiceDate">
                <Form.Label>Service Date :</Form.Label>
                <Form.Control
                  disabled
                  type="date"
                  name="ServiceDate"
                  placeholder="Service Date"
                  value={onboardedMerchantDetails.ServiceDate}
                />
              </Form.Group>
              <Form.Group className="form-group" controlId="SubmissionDateTime">
                <Form.Label>Submission Date and Time :</Form.Label>
                <Form.Control
                  disabled
                  type="date"
                  name="SubmissionDateTime"
                  placeholder="Submission Date and Time"
                  value={onboardedMerchantDetails.SubmissionDateTime}
                />
              </Form.Group>
            </div>
          </div>
          <div className="row cols-md-2 justify-content-around">
            <div className="col m-3 p-5 form-section border border-1 rounded">
              <h6 className="mb-3">C. Customer Info</h6>

              <Form.Group className="form-group" controlId="CustomerName">
                <Form.Label>Customer Name :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="CustomerName"
                  placeholder="Customer Name"
                  value={onboardedMerchantDetails.CustomerName}
                />
              </Form.Group>
              <Form.Group className="form-group" controlId="CustomerID">
                <Form.Label>Customer ID :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="CustomerID"
                  placeholder="Customer ID"
                  value={onboardedMerchantDetails.CustomerID}
                />
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
                  disabled
                  type="text"
                  name="LoanReferenceNumber"
                  placeholder="Loan Reference Number"
                  value={onboardedMerchantDetails.LoanReferenceNumber}
                />
              </Form.Group>
              <Form.Group className="form-group" controlId="LoanAccountNumber">
                <Form.Label>Loan Account Number :</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  name="LoanAccountNumber"
                  placeholder="Loan Account Number"
                  value={onboardedMerchantDetails.LoanAccountNumber}
                />
              </Form.Group>
              <Form.Group className="form-group" controlId="DateofLoanApproval">
                <Form.Label>Loan Approval Date :</Form.Label>
                <Form.Control
                  disabled
                  type="date"
                  name="DateofLoanApproval"
                  placeholder="Loan Approval Date"
                  value={onboardedMerchantDetails.DateofLoanApproval}
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </div>
    </div>
  ) : (
    <div className="mt-3 row justify-content-center">
      <div className="col col-6">
        <h5 className="text-center">Enter Merchant Id</h5>
        <Form.Group className="form-group" controlId="TransactionAmount">
          <Form.Label>Merchant Id :</Form.Label>
          <Form.Control
            type="input"
            controlId="merchantId"
            name="merchantId"
            placeholder="Enter Merchant Id"
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default ShowOnboarding;
