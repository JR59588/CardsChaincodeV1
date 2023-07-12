import React from "react";
import "../ViewOnboardingStatic.css";
const Authorized = (props) => {
  //console.log(props.data);
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h5 style={{ textAlign: "center", fontWeight: "500" }}>
            View Onboarded Merchant (Representative**)
          </h5>
        </div>
        <div className="row">
          <div
            className="col-md-6 mt-3"
            style={{
              height:'300px',
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
            }}
          >
            <div className="placing">a. Merchant Profile:</div>

            <div className="container p-3" style={{ marginTop: "-20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">
                      Payment Acceptor Name:
                    </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">
                      Payment Acceptor <br />
                      Identification Code:
                    </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">
                      Payment Acceptor <br /> Description:{" "}
                    </label>
                  </div>
                  <br />
                  <div
                    className="mb-1"
                    style={{ position: "relative", top: "10px" }}
                  >
                    <label className="col-form-label">
                      Merchant Category Code:
                    </label>
                  </div>
                  <div className="mb-1 mt-3">
                    <label className="col-form-label">Product:</label>
                  </div>
                  <br />

                  {/* <div className="mb-1">
                    <label className="col-form-label"> IFSC:</label>
                  </div> */}
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Payment Acceptor Name"
                      value={props.data.merchantName}
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Payment Acceptor Id Code"
                      value={props.data.merchantID}
                    />
                  </div>
                  <div className="mb-1 mt-3">
                    <textarea
                      disabled
                      rows="3"
                      cols="60"
                      className="form-control"
                      placeholder="Maximum 100 Characters"
                      value={props.data.merchantDescription}
                    ></textarea>
                  </div>

                  <div className="mb-1">
                  <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Select Merchant Category Code"
                      value={props.data.merchantType}
                    />
                  </div>

                  <div className="mb-1">
                  <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Select Product Type"
                      value={props.data.bnplProductTypes}
                    />
                  </div>
                  <br />
                  <br />

                  {/* <div className="mt-1">
                    <label className="col-form-label">AABBCX54321</label>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-1"></div>
          <div className="col-md-6  mt-5" style={{ height: "0px" }}>
            <div
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                width: "545px",
                borderRadius: "40px",
                position: "relative",
                left: "-20px",
              }}
            >
              <div className="placingAggregator">c. Associated Aggregator:</div>

              <div className="container p-3" style={{ marginTop: "-20px" }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-1">
                      <label className="col-form-label">
                        Aggregator Name:{" "}
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Aggregator ID:</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Aggregator Name"
                        value={props.data.aggName}
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Aggregator ID"
                        value={props.data.aggID}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <br />

            <div className="col md-1"></div>
            <div
              style={{
                borderStyle: "solid",
                borderWidth: "1px",
                borderRadius: "40px",
                position: "relative",
                top: "-515px",
              }}
              className="col md-5 divB p-2"
            >
              <div className="placingThreshold">
                b. Transaction Criteria/Thresholds:
              </div>
              <div
                className="container"
                style={{ paddingLeft: "20px", marginTop: "-15px" }}
              >
                <div className="row">
                  <div className="col-md-5">
                    <div className="mb-1">
                      <label className="col-form-label">
                        Negotiated MDR *:
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Promo Code:</label>
                    </div>
                    <div className="mb-1" style={{ marginTop: "10px" }}>
                      <label className="col-form-label">
                        Max Number of Txns/day:
                      </label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">Currency:</label>
                    </div>
                    <div className="mb-1" style={{ marginTop: "10px" }}>
                      <label className="col-form-label">Min Txn Amount:</label>
                    </div>
                    <div className="mb-1" style={{ marginTop: "10px" }}>
                      <label className="col-form-label">Max Txn Amount:</label>
                    </div>
                    <div className="mb-1">
                      <label className="col-form-label">
                        Locations Allowed:
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                  <div className="mb-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Negotiated MDR"
                        name=""
                        value={props.data.txcNegotiatedMDR}
                        disabled
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Promo Code"
                        name=""
                        value={props.data.promoCode}
                        disabled
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Max 6 digits"
                        value={props.data.txcMaxTxPerDay}
                        // value={"300"}
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Transaction Currency"
                        value={props.data.txcTxCurrency}
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Max 6 digits"
                        value={props.data.txcMinTxAmount}
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Max 6 digits"
                        value={props.data.txcMaxTxAmount}
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        placeholder="Location A, Location B"
                        value={props.data.locationsAllowed}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="col-md-6 mt-5 divD"
            style={{
              height:'270px',
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
              position: "relative",
              top: "2px",
              left: "66px",
            }}
          >
            <div className="placingDetails" style={{ width: "240px" }}>
              d. Clearing Organisation Details:
            </div>

            <div className="container p-3" style={{ marginTop: "-20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Merchant's Bank Details:
                  </span>
                  <div className="mb-1 mt-2">
                    <label className="col-form-label">Account Number:</label>
                  </div>
                  <div className="mb-1 mt-2">
                    <label className="col-form-label">ABA:</label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">
                      Clearing Organisation Name:{" "}
                    </label>
                  </div>
                  <div className="mb-1 mt-2">
                    <label className="col-form-label">Clearing OrgID:</label>
                  </div>
                  <form>
                    <div className="mt-3 mt-2">
                      <label style={{ fontSize: "14px" }}>
                        Contract signed with Merchant:
                      </label>
                    </div>
                  </form>
                </div>
                <div className="col-md-6">
                  <div className="mb-1" style={{marginTop:'30px'}}>
                    {/* <label className="col-form-label">AAAABBCCXXX</label> */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Business ID"
                      name=""
                      disabled
                      value={props.data.merchantAccountNumber}
                    />
                  </div>

                  <div className="mb-1">
                    {/* <label className="col-form-label">BXXXXXX</label> */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter ABA"
                      name=""
                      value={props.data.merchantBankCode}
                      disabled
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Yes/No"
                      value={props.data.clrOrgName}
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Yes/No"
                      clrOrgName
                      value={props.data.clrOrgID}
                    />
                  </div>
                  <div
                    className="mb-1"
                    style={{ position: "relative", top: "-20px" }}
                  >
                    <label className="col-form-label"></label>
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Yes/No"
                      value={props.data.isContractSigned}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <p>Not Authorized: Restricted data, only visible to authorized orgs</p>
              <p>
                **Representative - attributes shown are examples for this POC
                and would be chosen as per business need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authorized;
