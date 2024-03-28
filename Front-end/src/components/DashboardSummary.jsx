import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { NotificationManager } from "react-notifications";
import Chart from "chart.js/auto";
import "./Merchant.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Modal from "react-bootstrap/Modal";
import { Button, Dropdown, DropdownButton, DropdownItemText } from "react-bootstrap";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const dateFunc = (timestamp) => {
  let datetime = new Date(Date.parse(timestamp)); //new Date(actualTime * 1000);
  return datetime.toDateString();
};

const timeFunc = (timestamp) => {
  let datetime = new Date(Date.parse(timestamp)); //new Date(actualTime * 1000);
  return datetime.toLocaleTimeString();
};


const ChartComponent = (props) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    const myChartRef = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(myChartRef, {
      type: "doughnut",

      data: {
        labels: props.labels,
        datasets: [
          {
            data: props.data,
            backgroundColor: [
              "#FFEA00",
              "#0147AB",
              "#9A7B4F",
              "#FF007F",
              "#68BB59",
            ],
          },
        ],
      },
      options: {
        responsive: true,

        plugins: {
          title: { display: true, text: "Settlement Requests Breakdown" },
          legend: {
            position: "bottom",
          },
        },
      },
    });
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="d-flex justify-content-center col-md-6 p-2">
      <div style={{ width: "300px" }}>

        <canvas ref={chartRef} />
      </div>
    </div>
  );
};
const TransactionAmountTableComponent = (props) => {

  return (
    <div className="d-flex table-responsive-md mt-3 col-md-6">
      <table className="table table-sm table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th colSpan={2}>Settlement Amount Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Settlement  Amount Requested </td>

            <td>
           
                {props.transactionsToday}
              
            </td>
          </tr>
          <tr>
            <td>Total Amount Settled</td>
            <td>{props.pendingTransactionsToday}</td>
          </tr>
        
        </tbody>
      </table>
     
    </div>
    
  );
};
const StatsTableComponent = (props) => {
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const toggleTransactionPopup = () => {
    setShowTransactionDetails(!showTransactionDetails);
  };
  return (
    <div className="d-flex table-responsive-md mt-3 col-md-6">
      <table className="table table-sm table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th colSpan={2}>Settlement Requests Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Number of Settlement Requests </td>

            <td>
              <button
                type="button"
                className="buttonbt4"
                onClick={toggleTransactionPopup}
              >
                {props.transactionsToday}
              </button>
            </td>
          </tr>
          <tr>
            <td>Number of  Settlement Requests in Process</td>
            <td>{props.pendingTransactionsToday}</td>
          </tr>
          <tr>
            <td>Number of Settlement Requests rejected</td>
            <td>{props.rejectedTransactionsToday}</td>
          </tr>
        </tbody>
      </table>
      <Modal
        show={showTransactionDetails}
        fullscreen={true}
        onHide={toggleTransactionPopup}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transactions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TransactionsComponent transactions={props.transactions} />
        </Modal.Body>
      </Modal>
    </div>
    
  );
};


const TransactionStatsComponent = ({
  transactionStatsData,
  toggleTransactionPopup,
}) => {
  const StatusData = transactionStatsData.statusData;
  return (
    <>
      <StatsTableComponent
        transactionsToday={transactionStatsData.transactionsToday}
        pendingTransactionsToday={transactionStatsData.pendingTransactionsToday}
        rejectedTransactionsToday={
          transactionStatsData.rejectedTransactionsToday
        }
        toggleTransactionPopup={toggleTransactionPopup}
        transactions={transactionStatsData.transactions}
      />
      <ChartComponent
        data={[
          StatusData.TxRequested || 0,
          StatusData.TxSubmitted || 0,
          StatusData.TxAuthorized || 0,
          StatusData.TxBalanced || 0,
          StatusData.TxCleared || 0,
        ]}
        labels={["In process", "Completed",  "Rejected"]}
      />
       <TransactionAmountTableComponent
        transactionsToday={TransactionsComponent.transactionAmount} 
        pendingTransactionsToday={transactionStatsData.pendingTransactionsToday}
       
        
       
      />
      <ChartComponent
        data={[
          StatusData.TxRequested || 0,
          StatusData.TxSubmitted || 0,
          StatusData.TxAuthorized || 0,
          StatusData.TxBalanced || 0,
          StatusData.TxCleared || 0,
        ]}
        labels={["In process", "Completed",  "Rejected"]}
      />
    </>
  );
};
const TransactionsComponent = ({ transactions }) => {
  return (
    <div className="mt-3 table-responsive" id="tableRes">
      <table
        className="table table-striped table-hover table-bordered"
        id="myTable"
      >
        <thead className="table-primary">
          <tr>
            <th className="fontSize">No.</th>
            <th style={{ cursor: "pointer" }} className="fontSize">
              S/R Txn Date
            </th>
            <th className="fontSize">S/R Txn ID</th>
            <th className="fontSize">Merchant ID</th>
            <th className="fontSize">STAN</th>

            <th className="fontSize">S/R Txn Amount</th>
            <th className="fontSize">S/R Txn Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item, index) => {
            return (
              <tr key={item.Key}>
                <td>{index + 1}</td>
                <td>
                  {dateFunc(item.Record.txTimestamp)}
                  {/* {" "}
                    {timeFunc(item.Record.txTimestamp)} */}
                </td>
                <td>
                  {item.Record.txID.substr(0, 5) +
                    "..." +
                    item.Record.txID.substr(item.Record.txID.length - 5)}
                </td>
                <td>{item.Record.MerchantId}</td>
                <td></td>

                <td>{item.Record.transactionAmount}</td>
                <td>{item.Record.TxStatus}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DashboardSummary = ({ roleId,orgOptions }) => {
  const [loading, setLoading] = useState(true);
  const [transactionStatsData, setTransactionStatsData] = useState(null);

  useEffect(() => {
    const fetchTransactionStats = async () => {
      try {
        if (roleId) {
          const apiResponse = await axios.get(
            `${apiBaseUrl}/api/v1/dashboard/stats/${roleId}`
          );
          console.log(apiResponse);
          setTransactionStatsData(apiResponse.data.stats);
          setLoading(false);
        } else {
          console.log("Please select a roleId");
        }
      } catch (error) {
        setLoading(false);
        console.log("Error fetching transaction data in dashboard: ", error);
      }
    };

    fetchTransactionStats();
  }, []);
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [transactionStatus, setTransactionStatus] = useState('');
const [merchant, setMerchant] = useState('');

const handleFilterClick = () => {
  console.log('date button clicked');
  console.log('Transaction Status:', transactionStatus);
  console.log('Merchant:', merchant);
};



  if (loading) {
    return <div>Loading transaction data...</div>;
  } else if (!transactionStatsData) {
    return <div>No transactions data found...</div>;
  } else {
    return (
      <div className="ps-3 pe-3 mt-3">
        <div
          className="row"
          style={{ background: "rgb(235, 234, 242)", minHeight: "400px" }}
        >
          <h5 className="text-center">Transaction Summary</h5>
          <br/> <br/> 
          {/* <div className="date-filter" style={{ display: 'flex', alignItems: 'center' }}> */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%' }}>
            <h4>Date:</h4>
            &nbsp;&nbsp;
          
  
            
           
<DatePicker
      selected={dateFilter.startDate}
      onChange={date => setDateFilter({ ...dateFilter, startDate: date })}
      selectsStart
      startDate={dateFilter.startDate}
      endDate={dateFilter.endDate}
      dateFormat="dd/MM/yyyy"
      placeholderText="DD/MM/YYYY"
    />
    &nbsp;&nbsp;
    <DatePicker
      selected={dateFilter.endDate}
      onChange={date => setDateFilter({ ...dateFilter, endDate: date })}
      selectsEnd
      startDate={dateFilter.startDate}
      endDate={dateFilter.endDate}
      minDate={dateFilter.startDate}
      dateFormat="dd/MM/yyyy"
      placeholderText="DD/MM/YYYY"
    />
    &nbsp;&nbsp;&nbsp;&nbsp;
    <DropdownButton id="dropdown-button-dark-example1" variant="secondary" title={transactionStatus || "Transaction Status"}>
      <Dropdown.Item onClick={() => setTransactionStatus('completed')}>Completed</Dropdown.Item>
      <Dropdown.Item onClick={() => setTransactionStatus('inProcess')}>In-process</Dropdown.Item>
      <Dropdown.Item onClick={() => setTransactionStatus('rejected')}>Rejected</Dropdown.Item>
    </DropdownButton>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <DropdownButton id="dropdown-button-dark-example1" variant="secondary" title={merchant || "Merchant Name"}>
      {
        orgOptions.map(org => {
          return <Dropdown.Item onClick = {() => setMerchant(org.orgId)}>{org.orgName}</Dropdown.Item>
        })
      }
 
    </DropdownButton>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <Button onClick={handleFilterClick} style={{ width: '150px',height:'40px' }}>Filter</Button>
          </div>
          <br /> <br/>




          <TransactionStatsComponent
            transactionStatsData={transactionStatsData}
          />
        </div>
      </div>
    );
  }
};

export default DashboardSummary;
