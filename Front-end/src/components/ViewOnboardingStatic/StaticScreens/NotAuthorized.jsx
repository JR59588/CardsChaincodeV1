import React from "react";
import "../ViewOnboardingStatic.css";
const NotAuthorized = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h5 style={{ textAlign: "center", fontWeight: "500" }}>
            Merchant Onboarding (Representative**)
          </h5>
        </div>
        <br />
        <br />
        <div className="row">
          <div
            className="col-md-6 mt-3"
            style={{
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
            }}
          >
            <div className="placing">a. Merchant Profile:</div>
            <span className="messageA">Sorry, you are not authorized to access these details. Pls
                contact your administrator</span>
            <div className="blrHidden"></div>
            <div className="container p-3" style={{ marginTop: "-20px" }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">Merchant Id:</label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label"> Merchant Name: </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">
                      Merchant Description:{" "}
                    </label>
                  </div>
                  <br />
                  <br />
                  <br />
                  <div className="mb-1">
                    <label className="col-form-label">Merchant Type:</label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">Product:</label>
                  </div>
                  <br />
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Merchant's Bank Details:
                  </span>
                  <div className="mb-1">
                    <label className="col-form-label">
                      Business ID Code (BIC):
                    </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">Bank Code:</label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label"> IFSC:</label>
                  </div>
                  </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Merchant ID"
                      value={'M101'}
                    />
                  </div>
                  <div className="mb-1">
                    <input
                      disabled
                      type="text"
                      className="form-control"
                      placeholder="Merchant Name"
                      value={'Banana'}
                    />
                  </div>
                  <div className="mb-1">
                    <textarea
                      disabled
                      rows="3"
                      cols="60"
                      className="form-control"
                      placeholder="maximum 3 sentences"
                    ></textarea>
                  </div>


                  <div className="mb-1">
                    <select
                      style={{ height: "40px", fontSize: "14px" }}
                      name="merchantType"
                      className="form-control"
                      disabled
                    >
                      <option value="oilandgas">Oil and Gas</option>
                      <option value="Travel">Travel</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>

                  <div className="mb-1">
                    <select
                      style={{ height: "40px", fontSize: "14px" }}
                      name="bnplProductTypes"
                      id=""
                      className="form-control"
                      disabled
                    >
                      <option value="PR1"><strong>PR1</strong></option>
                      <option value="PR2">PR2</option>
                      <option value="PR3">PR3</option>
                      <option value="PR4">PR4</option>
                    </select>
                  </div>
                  <br />
                  <br />
                  <div className="mt-">
                    <label className="col-form-label">AAAABBCCXXX</label>
                  </div>

                  <div className="mt-1">
                    <label className="col-form-label">BXXXXXX</label>
                  </div>

                  <div className="mt-1">
                    <label className="col-form-label">AABBCX54321</label>
                  </div>
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
                borderRadius: "40px",
              }}
            >
              <div className="placingAggregator">c. Associated Aggregator:</div>
              <span className="authMsgC">
                Sorry, you are not authorized to access these details. Pls
                contact your administrator
              </span>
              <div style={{padding:'10px'}}>
              <div className="container p-3 blr" style={{ marginTop: "-20px" }}>
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
                        style={{
                          backgroundColor: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        style={{
                          backgroundColor: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
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
                marginTop:'30px'
              }}
              className="col md-5 divB p-2"
            >
              <div className="placingThreshold">
                b. Transaction Criteria/Thresholds:
              </div>
              <span className="authMsgB">
                Sorry, you are not authorized to access these details. Pls
                contact your administrator
              </span>
              <div
                className="container blr"
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
                        Max Txns per day (max):
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
                    <div className="mb-1 blrBox">
                      <select
                        style={{
                          height: "40px",
                          fontSize: "14px",
                          background: "#008555",
                          color: "#008555",
                          border: "0px",
                        }}
                        name="txcNegotiatedMDR"
                        id="txcNegotiatedMDR"
                        className="form-control"
                        disabled
                      >
                        <option value="select">Select Merchant MDR</option>
                        <option value="1.5">1.5</option>
                        <option value="2.0">2.0</option>
                        <option value="2.5">2.5</option>
                      </select>
                    </div>
                    <div className="mb-1" style={{ color: "" }}>
                      <label
                        className="col-form-label"
                        style={{ color: "#008555" }}
                      >
                        PROMO-XXX-YYY
                      </label>
                    </div>
                    <div className="mb-1">
                      <input
                        style={{
                          backgroundColor: "#008555",
                          color: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control blrBox"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        style={{
                          backgroundColor: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        style={{
                          backgroundColor: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        style={{
                          backgroundColor: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control"
                      />
                    </div>
                    <div className="mb-1">
                      <input
                        style={{
                          backgroundColor: "#008555",
                          border: "0px",
                        }}
                        disabled
                        type="text"
                        className="form-control"
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
              borderStyle: "solid",
              borderWidth: "1px",
              borderRadius: "40px",
            }}
          >
            <div className="placingDetails" style={{ width: "240px" }}>
              d. Clearing Organisation Details:
            </div>
            <span className="authMsgD">
              Sorry, you are not authorized to access these details. Pls contact
              your administrator
            </span>
            <div className="container p-3 blr" style={{ marginTop: "-15px" }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">
                      Clearing Organisation Name:{" "}
                    </label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">Clearing OrgID:</label>
                  </div>
                  <form>
                    <div>
                      <label style={{ fontSize: "14px" }}>
                        Contract signed with Merchant:
                      </label>
                    </div>
                  </form>
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="col-form-label">Internal</label>
                  </div>
                  <div className="mb-1">
                    <label className="col-form-label">CLORG-101 </label>
                  </div>

                  <div>
                    <input
                      style={{
                        backgroundColor: "#008555",
                        border: "0px",
                        borderColor: "#008555",
                      }}
                      disabled
                      type="radio"
                      hidden
                      name="contractSignedWithMerchant"
                      value="yes"
                    />
                    Yes
                    <input
                      style={{
                        backgroundColor: "#008555",
                        border: "0px",
                        marginLeft: "40px",
                      }}
                      disabled
                      type="radio"
                      hidden
                      name="gender"
                      value="no"
                    />
                    No
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container" >
          <div className="row">
            <div className="col-md-12">
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

export default NotAuthorized;
