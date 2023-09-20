import React from "react";
import { NavLink } from "react-router-dom";
import "../App.css";
import { useState } from "react";
import { useEffect } from "react";
import pdf from "../assets/Admin_User_guide.pdf";

const Header = ({ roleId, setRoleId, orgOptions }) => {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        height: "70px",
        backgroundColor: "rgb(7, 78, 125)",
        color: "white",
      }}
    >
      <div className="container-fluid" style={{ color: "white" }}>
        <a className="navbar-brand" href="#" style={{ color: "white" }}>
          HLF-CARDS Proof-of-Concept
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/About" className="ani">
                {/* About{" "}
                <span style={{ color: "white" }} className="gapLine">
                  |
                </span> */}
              </NavLink>{" "}
            </li>
            <li className="nav-item">
              {/* {roleId === 'Agg' || roleId === 'Agg2' ? (
                <> */}
              <NavLink to="/Aggregator" className="ani">
                New Onboarding{" "}
                <span className="gapLine" style={{ color: "white" }}>
                  |
                </span>
              </NavLink>
              {/* </>
              ) : (
                <>
                  <div
                    className="ani"
                    style={{ cursor: 'not-allowed', color: 'lightgrey' }}
                  >
                    New Onboarding{' '}
                    <span className="gapLine" style={{ color: 'white' }}>
                      |
                    </span>
                  </div>
                </>
              ) 
              }*/}
            </li>
            <li className="nav-item">
              <NavLink to="/View-Onboarding-Static" className="ani">
                View Onboarding{" "}
                <span className="gapLine" style={{ color: "white" }}>
                  |
                </span>
              </NavLink>
            </li>

            <li className="nav-item">
              {/* {roleId === 'Agg' || roleId === 'Agg2' ? (
                <> */}
              <NavLink to="/Merchant" className="ani">
                Sales/Return Request{" "}
                <span className="gapLine" style={{ color: "white" }}>
                  |
                </span>
              </NavLink>
              {/* </>
              ) : (
                <>
                  <div
                    className="ani"
                    style={{ cursor: 'not-allowed', color: 'lightgrey' }}
                  >
                    Sales/Return Request{' '}
                    <span className="gapLine" style={{ color: 'white' }}>
                      |
                    </span>
                  </div>
                </>
              )} */}
            </li>
            <li className="nav-item">
              <NavLink to="/ViewTx" className="ani">
                View Sales/Return Requests{" "}
              </NavLink>{" "}
            </li>
          </ul>
          <div className="d-flex">
            <div style={{ display: "flex" }}>
              <label
                htmlFor="dropdown"
                style={{ color: "white", lineHeight: "35px" }}
                className="dropLable"
              >
                Role*: &nbsp;
              </label>
              <select
                style={{
                  width: "210px",
                  backgroundColor: "#1fa1f8",
                  height: "36px",
                  color: "white",
                }}
                className="form-select"
                id="dropdown"
                required
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
              >
                {orgOptions.map((orgOption, index) => (
                  <option
                    value={orgOption.orgId}
                    id={orgOption.orgId}
                    key={"org" + index}
                    className="dropdown-item"
                  >
                    {orgOption.orgName}
                  </option>
                ))}
                {/* <option value="AP" id="AP" className="dropdown-item">
                  Select Role
                </option>
                <option value="Org1" id="Org1" className="dropdown-item">
                  Merchant Org 1
                </option>
                <option value="Org2" id="Org2" className="dropdown-item">
                  Merchant Org 2
                </option>
                <option value="PSP" id="PSP" className="dropdown-item">
                  Payment Service Provider
                </option>
                <option value="ACD" id="ACD" className="dropdown-item">
                  Acquirer Customer Department
                </option>
                <option value="AAD" id="AAD" className="dropdown-item">
                  Acquirer Accounts Department
                </option>
                <option value="AOD" id="AOD" className="dropdown-item">
                  Acquirer Operations Department
                </option> */}
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
