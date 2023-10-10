import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Routes } from 'react-router-dom'
import Aggregator from './components/Aggregator'
import FileComponent from './components/Merchant-Submit-Deails/FileComponent'
import Header from './components/Header'
import Merchant from './components/Merchant'
import { Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import About from "./components/About";
import DashboardSummary from "./components/DashboardSummary";
import Onboard from './components/Onboarding/Onboard'
import SubmitTx from './components/Submit_Tx/SubmitTx'
import NewViewOnboardingStatic from './components/ViewOnboardingStatic/NewViewOnboardingStatic'
import 'react-notifications/lib/notifications.css';
import { NotificationContainer } from 'react-notifications'
import ViewTx from './components/ViewTx'
import socketIOClient from 'socket.io-client';
import axios from 'axios'
const IP = 'localhost'
const ENDPOINT = 'http://localhost:3001';

function App() {
  //storing the roleId...
  const [roleId, setRoleId] = useState('Org1')
  const [orgOptions, setOrgOptions] = useState([]);

  function fetchOrganizationData() {
    axios
      .get(
        `http://${IP}:3001/api/v1/getOrgs`
      )
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

  const getRoleFromFile = (roleState) => {
    console.log('app', roleState)
    setRoleId(roleState)
  }

  return (
    <div>
      <Header roleId={roleId} setRoleId={setRoleId} orgOptions={orgOptions} />
      <NotificationContainer />
      <Routes>
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
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/Aggregator"
          element={<Onboard roleId={roleId} IP={IP} fetchOrganizationData={fetchOrganizationData} />}
        />
        <Route
          path="/Onboard"
          element={<Onboard roleId={roleId} IP={IP} fetchOrganizationData={fetchOrganizationData} />}
        />
        <Route
          path="/FileComponent"
          element={<FileComponent roleId={roleId} IP={IP} />}
        />
        <Route path="/ViewTx" element={<ViewTx roleId={roleId} IP={IP} socketIOClient={socketIOClient} ENDPOINT={ENDPOINT} />} />
        <Route
          path="/View-Onboarding-Static"
          element={<NewViewOnboardingStatic roleId={roleId} IP={IP} />}
        />
        <Route path="/About" element={<About />} />
        <Route path="/DashboardSummary" element={<DashboardSummary />} />
        <Route path="*" element={<h1>Not found....</h1>} />

        {/* testing routes */}
        <Route path="/o" element={<Onboard IP={IP} roleId={roleId} />} />
        <Route path="/s" element={<SubmitTx IP={IP} roleId={roleId} />} />
      </Routes>
    </div>
  )
}

export default App
