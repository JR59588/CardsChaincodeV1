import React from "react";
import classes from "../View_Onboarding_New/ViewOnboarding.module.css";
import Footer from "../Footer";

const NewViewOnboarding = (props) => {
  return (
    <>
      <div className="container">
        <div className="cols2">
          <h4 style={{ textAlign: "center" }} className="mt-4 mb-4">
            View Onboarded Merchant 
          </h4>
        </div>
        <div
          className={`row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-2 row-cols-xxl-2 ${classes.rowSpacingStatic}`}
        >
          <div className={`col ${classes.col1}`}>
            <span className={classes.floatingA}>a. Merchant Profile:</span>
            <div className={`${classes.placeInputsNames}`}>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Payment Acceptor Name:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Payment Acceptor Name"
                    name="merchantName"
                    value={props.data.merchantName}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Payment Acceptor <br /> Identification Code:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Payment Acceptor Id Code"
                    name="merchantID"
                    value={props.data.merchantID}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Payment Acceptor Description:{" "}
                  </label>
                </div>
                <div className="col">
                  <textarea
                    disabled
                    rows="3"
                    cols="60"
                    className="form-control"
                    placeholder="Maximum 100 Characters"
                    name="merchantDescription"
                    value={props.data.merchantDescription}
                  ></textarea>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Merchant Category Code:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Merchant Category Code"
                    aria-label="Last name"
                    value={props.data.merchantCategoryCode}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Product:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    // placeholder="Product"
                    aria-label="Last name"
                    value={props.data.POSID}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`col ${classes.col2}`}>
            <span className={classes.floatingB}>
              c. Transaction Criteria/Thresholds:
            </span>
            <div className={`${classes.placeInputsNames}`}>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Negotiated MDR *:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Negotiated"
                    aria-label="Last name"
                    name="txcNegotiatedMDR"
                    value={props.data.txcNegotiatedMDR}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Promo Code:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Promo Code"
                    aria-label="Last name"
                    name="promoCode"
                    value={props.data.promoCode}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Number of Transactions allowed per day:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Max 6 digits"
                    aria-label="Last name"
                    name="txcMaxTxPerDay"
                    value={props.data.txcMaxTxPerDay}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Transaction Currency:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Transaction Currency"
                    aria-label="Last name"
                    name="txcTxCurrency"
                    value={props.data.txcTxCurrency}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Min Txn Amount:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Max 6 digits"
                    aria-label="Last name"
                    name="txcMinTxAmount"
                    value={props.data.txcMinTxAmount}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Max Txn Amount:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Max 6 digits"
                    aria-label="Last name"
                    name="txcMaxTxAmount"
                    value={props.data.txcMaxTxAmount}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Locations Allowed:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Location A, Location B"
                    aria-label="Last name"
                    name="transactionGeographiesAllowed"
                    value={props.data.transactionGeographiesAllowed}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`col ${classes.col3}`}>
            <span className={classes.floatingC}>b. Merchant Bank Details:</span>
            <div className={`${classes.placeInputsNames}`}>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Account Number:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Account Number"
                    aria-label="Account Number"
                    name="merchantAccountNumber"
                    value={props.data.merchantAccountNumber}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Bank Identifier:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Bank Identifier"
                    aria-label="Last name"
                    name="merchantBankCode"
                    value={props.data.merchantBankCode}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`col ${classes.col4}`}>
            <span className={classes.floatingD}>d. POS Terminal Details</span>
            <div className={`${classes.placeInputsNames}`}>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Number of POS Terminals :
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="No of POS Terminals"
                    aria-label="Last name"
                    name="numberOfPOSTerminalsRequired"
                    value={props.data.numberOfPOSTerminalsRequired}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    POS ID:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="POS ID"
                    aria-label="Last name"
                    name="POSID"
                    value={props.data.POSID}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Security Deposits:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Clearing Organisation Name:"
                    aria-label="Last name"
                    value={props.data.securityDeposits}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    Contract signed with Merchant:
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="Is Contract Signed"
                    aria-label="Is Contract Signed"
                    value={props.data.isContractSigned}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="name" className="col-form-label">
                    KYC Status(Completed/Not Completed):
                  </label>
                </div>
                <div className="col">
                  <input
                    disabled
                    type="text"
                    className="form-control"
                    placeholder="YES / NO"
                    aria-label="KYC Status"
                    value={props.data.kycStatus}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p>
          Note : attributes shown are examples for this POC and
          would be chosen as per business need.
        </p>
      </div>
    </>
  );
};

export default NewViewOnboarding;
