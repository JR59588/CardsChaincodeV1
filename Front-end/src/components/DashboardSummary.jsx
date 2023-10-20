import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { NotificationManager } from "react-notifications";
import Chart from "chart.js/auto";
import "./Merchant.css";
import Modal from "react-bootstrap/Modal";

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
            <td>Number of Settlement Requests Today</td>

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
            <td>Number of Pending Settlement Requests Today</td>
            <td>{props.pendingTransactionsToday}</td>
          </tr>
          <tr>
            <td>Number of Rejected Settlement Requests Today</td>
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
          <TransactionsComponent
            transactions={props.transactionStatsData.transactions}
          />
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
      />
      <ChartComponent
        data={[
          StatusData.TxRequested || 0,
          StatusData.TxSubmitted || 0,
          StatusData.TxAuthorized || 0,
          StatusData.TxBalanced || 0,
          StatusData.TxCleared || 0,
        ]}
        labels={["Requested", "Submitted", "Authorized", "Balanced", "Cleared"]}
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
            <th className="fontSize">Customer ID</th>
            <th className="fontSize">Loan Ref Number</th>
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
                <td>{item.Record.CustomerId}</td>
                <td>{item.Record.LoanReferenceNumber}</td>
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

const DashboardSummary = ({ roleId }) => {
  const [loading, setLoading] = useState(true);
  const [transactionStatsData, setTransactionStatsData] = useState(null);

  useEffect(() => {
    const fetchTransactionStats = async () => {
      try {
        if (roleId) {
          const apiResponse = await axios.get(
            `http://localhost:3001/api/v1/dashboard/stats/${roleId}`
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
          <h5 className="text-center">Settlement Requests Stats</h5>
          <TransactionStatsComponent
            transactionStatsData={transactionStatsData}
          />
        </div>
      </div>
    );
  }
};

export default DashboardSummary;
