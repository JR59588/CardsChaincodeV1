import React, { useState } from "react";
import "./ShowOnboarding.css";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Loader from "../Loader/Loader";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const ShowOnboarding = ({ roleId }) => {
  const [loading, setLoading] = useState(true);
  const [onboardedMerchantDetails, setOnboardedMerchantDetails] = useState({});
  const [merchantId, setMerchantId] = useState(null);
  const [error, setError] = useState(null);

  const merchantIdSchema = Yup.object().shape({
    merchantId: Yup.string().required("Required"),
  });

  return (
    <div style={{ minHeight: "550px" }}>
      <div className="mt-3 row justify-content-center">
        <div className="col col-4">
          <h5 className="text-center">View onboarded merchant details</h5>
          <Formik
            initialValues={{
              merchantId: "",
            }}
            validationSchema={merchantIdSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                  `${apiBaseUrl}/api/v1/merchantDetails/${values.merchantId}/${roleId}`
                );
                setOnboardedMerchantDetails(response.data.response);
                setLoading(false);
              } catch (error) {
                setLoading(false);
                console.log("Error in fetching onboarded merchant details");
                setError("Error fetching onboarded merchant details");
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
                <div className="row align-items-baseline">
                  <div className="col col-8">
                    <Form.Group
                      className="form-group mb-0 mt-3"
                      controlId="TransactionAmount"
                    >
                      {/* <Form.Label>Merchant Id :</Form.Label> */}
                      <Form.Control
                        type="input"
                        controlId="merchantId"
                        name="merchantId"
                        placeholder="Enter Merchant Id"
                        value={values.merchantId}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </div>

                  <div className="col col-4">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Please wait..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {loading === false && (
        <div className="mt-3">
          <div className="container mt-3 mb-3">
            <Form>
              <div className="row cols-md-2 justify-content-center">
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">A. Merchant Profile</h6>
                  <Form.Group className="form-group" controlId="merchantName">
                    <Form.Label>Payment Acceptor Name :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="merchantName"
                      placeholder="Payment Acceptor Name"
                      value={onboardedMerchantDetails.merchantName}
                    />
                  </Form.Group>

                  <Form.Group className="form-group" controlId="merchantID">
                    <Form.Label>
                      Payment Acceptor Identification Code :
                    </Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="merchantID"
                      placeholder="Payment Acceptor Identification Code"
                      value={onboardedMerchantDetails.merchantID}
                    />
                  </Form.Group>

                  <Form.Group
                    className="form-group"
                    controlId="merchantDescription"
                  >
                    <Form.Label>Payment Acceptor Description :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="merchantDescription"
                      placeholder="Payment Acceptor Description"
                      value={onboardedMerchantDetails.merchantDescription}
                    />
                  </Form.Group>

                  <Form.Group controlId="merchantCategoryCode" className="mb-3">
                    <Form.Label>Merchant Category Code :</Form.Label>

                    <Form.Control
                      disabled
                      type="text"
                      name="merchantCategoryCode"
                      placeholder="Merchant Category Code"
                      value={onboardedMerchantDetails.merchantCategoryCode}
                    />
                  </Form.Group>

                  <Form.Group controlId="product" className="mb-3">
                    <Form.Label>Product :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="product"
                      placeholder="Product"
                      value={onboardedMerchantDetails.product}
                    />
                    {/* <Form.Select
                      aria-label="product"
                      style={{ height: "100%" }}
                    >
                      <option value="">Select product Type</option>
                      <option value="PR1">PR1</option>
                      <option value="PR2">PR2</option>
                      <option value="PR3">PR3</option>
                      <option value="PR4">PR4</option>
                    </Form.Select> */}
                  </Form.Group>
                </div>
                <div className="col m-3 p-5 form-section border border-1 rounded">
                  <h6 className="mb-3">C. Transaction criteria/thresholds</h6>
                  <Form.Group controlId="txcNegotiatedMDR" className="mb-3">
                    <Form.Label>Negotiated MDR :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="negotiatedMDR"
                      placeholder="Negotiated MDR"
                      value={onboardedMerchantDetails.txcNegotiatedMDR}
                    />
                    {/* <Form.Select
                      aria-label="Negotiated MDR"
                      style={{ height: "100%" }}
                      value = {}
                    >
                      <option value="">Select Negotiated MDR</option>
                      <option value="1.5">1.5</option>
                      <option value="2.0">2.0</option>
                      <option value="2.5">2.5</option>
                    </Form.Select> */}
                  </Form.Group>
                  <Form.Group className="form-group" controlId="promoCode">
                    <Form.Label>Promo Code :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="promoCode"
                      placeholder="Promo Code"
                      value={onboardedMerchantDetails.promoCode}
                    />
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcMaxTxPerDay">
                    <Form.Label>
                      Number of Transactions Allowed Per Day :
                    </Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="txcMaxTxPerDay"
                      placeholder="Number of Transactions Allowed Per Day"
                      value={onboardedMerchantDetails.txcMaxTxPerDay}
                    />
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcTxCurrency">
                    <Form.Label>Transaction Currency :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="txcTxCurrency"
                      placeholder="Transaction Currency"
                      value={onboardedMerchantDetails.txcTxCurrency}
                    />
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcMinTxAmount">
                    <Form.Label>Transaction Minimum Amount :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="txcMinTxAmount"
                      placeholder="Transaction Minimum Amount"
                      value={onboardedMerchantDetails.txcMinTxAmount}
                    />
                  </Form.Group>
                  <Form.Group className="form-group" controlId="txcMaxTxAmount">
                    <Form.Label>Transaction Maximum Amount :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="txcMaxTxAmount"
                      placeholder="Transaction Maximum Amount"
                      value={onboardedMerchantDetails.txcMaxTxAmount}
                    />
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="transactionGeographiesAllowed"
                  >
                    <Form.Label>Transaction Geographies Allowed :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="transactionGeographiesAllowed"
                      placeholder="Transaction Geographies Allowed"
                      value={
                        onboardedMerchantDetails.transactionGeographiesAllowed
                      }
                    />
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
                      disabled
                      type="text"
                      name="merchantAccountNumber"
                      placeholder="Account Number"
                      value={onboardedMerchantDetails.merchantAccountNumber}
                    />
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="merchantBankCode"
                  >
                    <Form.Label>Bank Identifier :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="merchantBankCode"
                      placeholder="Bank Identifier"
                      value={onboardedMerchantDetails.merchantBankCode}
                    />
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
                      disabled
                      type="text"
                      name="numberOfPOSTerminalsRequired"
                      placeholder="Number of POS Terminals"
                      value={
                        onboardedMerchantDetails.numberOfPOSTerminalsRequired
                      }
                    />
                  </Form.Group>
                  <Form.Group
                    className="form-group"
                    controlId="securityDeposits"
                  >
                    <Form.Label>Security Deposits :</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="securityDeposits"
                      placeholder="Security Deposits"
                      value={onboardedMerchantDetails.securityDeposits}
                    />
                  </Form.Group>

                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>Contract Signed With Merchant :</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        name="isContractSigned"
                        id="isContractSignedYes"
                        checked={
                          onboardedMerchantDetails.isContractSigned === "yes"
                        }
                        label="Yes"
                        value="yes"
                        inline
                      />
                      <Form.Check
                        type="radio"
                        name="isContractSigned"
                        id="isContractSignedNo"
                        checked={
                          onboardedMerchantDetails.isContractSigned === "no"
                        }
                        label="No"
                        value="no"
                        inline
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="form-group d-flex justify-content-between">
                    <Form.Label>KYC Status :</Form.Label>
                    <div>
                      <Form.Check
                        type="radio"
                        name="kycStatus"
                        id="kycStatusYes"
                        checked={onboardedMerchantDetails.kycStatus === "yes"}
                        label="Yes"
                        value="yes"
                        inline
                      />
                      <Form.Check
                        type="radio"
                        name="kycStatus"
                        id="kycStatusNo"
                        checked={onboardedMerchantDetails.kycStatus === "no"}
                        label="No"
                        value="no"
                        inline
                      />
                    </div>
                  </Form.Group>
                </div>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowOnboarding;
