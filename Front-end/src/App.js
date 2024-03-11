import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Routes } from "react-router-dom";
import FileComponent from "./components/Merchant-Submit-Deails/FileComponent";
import Header from "./components/Header";
import Merchant from "./components/Merchant";
import { Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import DashboardSummary from "./components/DashboardSummary";
import Onboard from "./components/Onboarding/Onboard";
import NewViewOnboardingStatic from "./components/ViewOnboardingStatic/NewViewOnboardingStatic";
import "react-notifications/lib/notifications.css";
import { NotificationContainer } from "react-notifications";
import ViewTx from "./components/ViewTx";
// import ViewSettlementRequests from "./components/ViewSettlementRequests";
import socketIOClient from "socket.io-client";
import axios from "axios";
import ISO8583FormikComponent from "./components/Merchant-Submit-Deails/ISO8583Formik/ISO8583FormikComponent";
import ISO8583FileFormikComponent from "./components/Merchant-Submit-Deails/ISO8583FileFormik/ISO8583FileFormikComponent";
import Settlement from "./components/SettlementRequests/Settlement";
import Footer from "./components/Footer";
import OnboardFormik from "./components/Onboarding/OnboardFormik";
import ViewAuthorizationTxnRequests from "./components/ViewAuthorizationTxnRequests";
import ViewAuthorizationTxnResponses from "./components/ViewAuthorizationTxnResponses";
import ViewSettlementTxnRequests from "./components/ViewSettlementTxnRequests";
import ShowOnboarding from "./components/Onboarding/ShowOnboarding";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const apiIP = process.env.REACT_APP_API_IP;
const socketEndpointUrl = `${apiBaseUrl}`;
const IP = `${apiIP}`;
function App() {
  //storing the roleId...
  const [roleId, setRoleId] = useState("Org1");
  const [orgOptions, setOrgOptions] = useState([]);
  const socket = socketIOClient(socketEndpointUrl);

  function fetchOrganizationData() {
    axios
      .get(`${apiBaseUrl}/api/v1/getOrgs`)
      .then((response) => {
        setOrgOptions([...response.data.orgs]);
      })
      .catch((err) => {
        console.log("Error fetching organization data: ", err);
      });
  }

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  useEffect(() => {
    socket.on("status-change", (response) => {
      console.log("Status change: ", response);
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const getRoleFromFile = (roleState) => {
    console.log("app", roleState);
    setRoleId(roleState);
  };

  return (
    <div>
      <Header roleId={roleId} setRoleId={setRoleId} orgOptions={orgOptions} />
      <NotificationContainer />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/Merchant"
          element={
            <Merchant
              roleId={roleId}
              IP={IP}
              getRoleFromFile={getRoleFromFile}
            />
          }
        />
        <Route
          path="/settlement-request"
          element={<Settlement roleId={roleId} />}
        />
        <Route
          path="/Aggregator"
          element={
            // <Onboard
            //   roleId={roleId}
            //   IP={IP}
            //   fetchOrganizationData={fetchOrganizationData}
            // />
            <OnboardFormik
              roleId={roleId}
              IP={IP}
              fetchOrganizationData={fetchOrganizationData}
            />
          }
        />
        <Route
          path="/OnboardFormik"
          element={
            <OnboardFormik
              roleId={roleId}
              IP={IP}
              fetchOrganizationData={fetchOrganizationData}
            />
          }
        />
        <Route
          path="/Onboard"
          element={
            <Onboard
              roleId={roleId}
              IP={IP}
              fetchOrganizationData={fetchOrganizationData}
            />
          }
        />
        <Route
          path="/FileComponent"
          element={<FileComponent roleId={roleId} IP={IP} />}
        />
        <Route
          path="/ViewTx"
          element={<ViewTx roleId={roleId} IP={IP} socket={socket} />}
        />
        <Route
          path="/ViewAuthorizationTxnRequests"
          element={<ViewAuthorizationTxnRequests roleId={roleId} IP={IP} socket={socket} />}
        />
        <Route
          path="/ViewAuthorizationTxnResponses"
          element={<ViewAuthorizationTxnResponses roleId={roleId} IP={IP} socket={socket} />}
        />
        <Route
          path="/ViewSettlementTxnRequests"
          element={<ViewSettlementTxnRequests roleId={roleId} IP={IP} socket={socket} />}
        />
        {/* <Route
          path="/ViewSettlementRequests"
          element={<ViewSettlementRequests roleId={roleId} IP={IP} socket={socket} />}
        /> */}
        <Route
          path="/View-Onboarding-Static"
          element={<NewViewOnboardingStatic roleId={roleId} IP={IP} />}
        />

        <Route
          path="/show-onboarding"
          element={<ShowOnboarding roleId={roleId} IP={IP} />}
        />

        <Route path="/About" element={<About />} />
        <Route
          path="/isoformik"
          element={<ISO8583FormikComponent roleId={roleId} />}
        />
        <Route
          path="/isofileformik"
          element={<ISO8583FileFormikComponent roleId={roleId} />}
        />
        <Route
          path="/DashboardSummary"
          element={<DashboardSummary roleId={roleId} />}
        />
        <Route path="*" element={<h1>Not found....</h1>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
