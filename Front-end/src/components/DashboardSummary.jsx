import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const DashboardSummary = ({ roleId }) => {
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

  const NoStatsComponent = () => <div>No Statistics data found...</div>;

  const TransactionsComponent = () => {
    const [loading, setLoading] = useState(true);
    const [transactionsData, setTransactionsData] = useState([]);

    useEffect(() => {
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

  const ChartComponent = (props) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    useEffect(() => {
      if (chartInstance.current) {
        chartInstance.current.destry();
      }
      const myChartRef = chartRef.current.getContext("2d");

      chartInstance.current = new Chart(myChartRef, {
        type: "pie",
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
      });
      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, []);

    return (
      <div
        className="d-flex justify-content-center col-md-6"
        style={{ background: "#ebeaf2" }}
      >
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
              <th colSpan={2}>Transaction Summary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total No. of Transactions</td>
              <td>{props.totalTransactions}</td>
            </tr>
            <tr>
              <td>Total No. of Transactions Today</td>
              <td>{props.transactionsToday}</td>
            </tr>
            <tr>
              <td>Pending Transactions</td>
              <td>{props.pendingTransactions}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const TransactionStatsComponent = () => {
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
      return <LoadingComponent />;
    } else if (Object.keys(transactionStatsData).length == 0) {
      return <NoStatsComponent />;
    } else {
      const StatusData = transactionStatsData.statusData;
      return (
        <>
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
          <StatsTableComponent
            totalTransactions={transactionStatsData.totalTransactions}
            transactionsToday={transactionStatsData.transactionsToday}
            pendingTransactions={transactionStatsData.pendingTransactions}
          />
        </>
      );
    }
  };

  return (
    <div className="ps-3 pe-3 mt-3">
      <div className="row">
        <h5 style={{ textAlign: "center" }}>Transaction Statistics</h5>
        <TransactionStatsComponent />
      </div>
      <div className="row">
        <h5 style={{ textAlign: "center" }}>Transactions</h5>
        <TransactionsComponent />
      </div>
    </div>
  );
};

export default DashboardSummary;
