import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { NotificationManager } from "react-notifications";
import Chart from "chart.js/auto";
import "./Merchant.css"
import Modal from 'react-bootstrap/Modal';

const NoStatsComponent = () => <div>No Statistics data found...</div>;

const LoadingStatsComponent = () => (
  <div className="text-center">
    <div className="spinner-border" role="status">
      {/* <span className="sr-only">Loading...</span> */}
    </div>
  </div>
);

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

            <td><button type="button" className="buttonbt4" onClick={props.toggleShowTransactionDetails}>{props.transactionsToday}</button></td>
          </tr>
          <tr>
            <td>Number of Pending Settlement Requests Today</td>
            <td>{props.pendingTransactions}</td>
          </tr>
          <tr>
            <td>Number of Rejected Settlement Requests Today</td>
            <td>{props.rejectedTransactions}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const TransactionStatsComponent = React.memo(({ roleId, toggleShowTransactionDetails }) => {
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
    return <LoadingStatsComponent />;
  } else if (Object.keys(transactionStatsData).length == 0) {
    return <NoStatsComponent />;
  } else {
    const StatusData = transactionStatsData.statusData;
    return (
      <>
        <StatsTableComponent
          transactionsToday={transactionStatsData.transactionsToday}
          pendingTransactions={transactionStatsData.pendingTransactionsToday}
          rejectedTransactions={
            transactionStatsData.rejectedTransactionsToday
          }
          toggleShowTransactionDetails={toggleShowTransactionDetails}
        />
        <ChartComponent
          data={[
            StatusData.TxRequested || 0,
            StatusData.TxSubmitted || 0,
            StatusData.TxAuthorized || 0,
            StatusData.TxBalanced || 0,
            StatusData.TxCleared || 0,
          ]}
          labels={[
            "Requested",
            "Submitted",
            "Authorized",
            "Balanced",
            "Cleared",
          ]}
        />
      </>
    );
  }
});

const DashboardSummary = ({ roleId }) => {
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);


  const dateFunc = (timestamp) => {
    let datetime = new Date(Date.parse(timestamp)); //new Date(actualTime * 1000);
    return datetime.toDateString();
  };

  const timeFunc = (timestamp) => {
    let datetime = new Date(Date.parse(timestamp)); //new Date(actualTime * 1000);
    return datetime.toLocaleTimeString();
  };

  const LoadingComponent = () => <div>Loading transaction data...</div>;



  const NoTransactionsComponent = () => (
    <div>No transactions data found...</div>
  );



  const TransactionsComponent = () => {
    const [loading, setLoading] = useState(true);
    const [transactionsData, setTransactionsData] = useState([]);

    useEffect(() => {
      console.log("effect running inside transactions component")
      const fetchTransactionData = async () => {
        try {
          if (roleId) {
            const apiResponse = await axios.get(
              `http://localhost:3001/api/v1/GetTxByRange/${roleId}`
            );
            setTransactionsData(apiResponse.data.response);
            setLoading(false);
          } else {
            console.log("Please select a roleId");
          }
        } catch (error) {
          setLoading(false);
          console.log("Error fetching transaction data in dashboard: ", error);
        }
      };

      fetchTransactionData();
    }, []);

    if (loading) {
      return <LoadingComponent />;
    } else if (transactionsData.length == 0) {
      return <NoTransactionsComponent />;
    } else {
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
              {transactionsData.map((item, index) => {
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
    }
  };


  const TransactionDetails = () => {

    return (

      <div className="modal" id="myModalMD">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                settlement Transaction details for today
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              // onClick={modalCancle}
              ></button>
            </div>
            <div className="modal-body">
              <div style={{ overflow: "auto" }}>
                <table
                  className="table table-striped table-hover table-bordered"
                  style={{ width: "1800px" }}
                >
                  <thead className="table-primary">
                    <tr>
                      <th scope="col" colSpan="1" className="fontSize">
                        No
                      </th>
                      <th scope="col" colSpan="2" className="fontSize">
                        Settlement Txns Summary
                      </th>
                      <th scope="col" colSpan="5" className="fontSize">
                        Settelement Submission Details
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="fontSize"></th>
                      <th scope="col" className="fontSize">
                        Settelement Txn Date
                      </th>
                      <th scope="col" className="fontSize">
                        Settelement Txn ID
                      </th>
                      <th scope="col" className="fontSize">
                        Settelement Txn Status
                      </th>
                      <th scope="col" className="fontSize">
                        Settelement Txn Amount
                      </th>
                      <th scope="col" className="fontSize">
                        Merchant Details
                      </th>
                      <th scope="col" className="fontSize">
                        Customer Details
                      </th>
                      <th scope="col" className="fontSize">
                        Transaction
                        <br />
                        Reference Number
                      </th>
                      <th scope="col" className="fontSize">
                        Submission Date
                      </th>
                    </tr>
                  </thead>
                  {/* <tbody>
               
                <div style={{ display: "flex" }}>
                  <h5 className="p-2" style={{ color: "#10005d" }}>
                    Loading...
                  </h5>
                  <div className="loader"></div>
                </div>

              </tbody> */}
                </table>
              </div>
            </div>
            <div className="modal-footer">

            </div>
          </div>
        </div>
      </div>
    )

  }






  return (
    <div className="ps-3 pe-3 mt-3">
      <div
        className="row"
        style={{ background: "rgb(235, 234, 242)", minHeight: "400px" }}
      >
        <h5 className="text-center">Settlement Requests Stats</h5>
        <TransactionStatsComponent roleId={roleId} toggleShowTransactionDetails={() => setShowTransactionDetails(true)} />
        {showTransactionDetails && <TransactionsComponent />}

        <Modal show={showTransactionDetails} fullscreen={true} onHide={() => setShowTransactionDetails(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Transactions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TransactionsComponent />
          </Modal.Body>
        </Modal>
      </div>
      {/* <div className="row pt-3">
        <h5 style={{ textAlign: "center" }}>Transactions</h5>
        <TransactionsComponent />
      </div> */}
    </div>
  );
};

export default DashboardSummary;
