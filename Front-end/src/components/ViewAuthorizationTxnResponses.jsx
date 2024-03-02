import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const ViewAuthorizationTxnResponses = ({ roleId }) => {
  const [loading, setLoading] = useState(true);
  const [x110Msgs, setX110Msgs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const orderFunc = (timestamp) => {
    const actualTime = timestamp.substring(0, 10);
    let datetime = new Date(actualTime * 1000);
    return datetime.toDateString();
  };

  useEffect(() => {
    const fetchX110Msgs = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const allMsgResponse = await axios.get(
          `${apiBaseUrl}/api/v1/GetTxByRange/${roleId}`
        );
        console.log("allmsgresponse", allMsgResponse);
        const allMsgs = allMsgResponse.data.response;
        const x110Msgs = allMsgs.filter(
          (msg) => msg.Record.messageType === "x110"
        );
        setX110Msgs(x110Msgs);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching authorization requests: ", error);
        setX110Msgs([]);
        setLoading(false);
        setErrorMsg("Error fetching data");
      }
    };

    fetchX110Msgs();
  }, []);

  return (
    <>
      {loading || !roleId ? (
        <Loading />
      ) : (
        <div className="mt-3">
          <h5 className="text-center mb-3">Authorization requests (X110)</h5>
          <div style={{ overflow: "auto" }}>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>No</th>
                  <th colSpan={3}>Txn Summary (Hyperledger)</th>
                  <th colSpan={4}>Txn Submission Details</th>
                  <th colSpan={1}>Txn Verification Summary</th>
                </tr>
                <tr>
                  <th></th>
                  <th>Txn Date</th>
                  <th>Txn ID</th>
                  <th>Status</th>
                  <th>Merchant Details</th>
                  <th>Merchant Name</th>
                  <th>Customer Details</th>
                  <th>Txn Reference Number</th>
                  <th>Request Txn</th>
                </tr>
              </thead>
              <tbody>
                {/* {JSON.stringify(x110Msgs)} */}
                {x110Msgs.map((x110Msg, idx) => (
                  <tr key={x110Msg.Key}>
                    <td>{idx + 1}</td>
                    <td>{x110Msg.Record.txTimestamp}</td>
                    {/* <td>{20 / 10 / 2019}</td> */}
                    <td>{x110Msg.Record.txID}</td>
                    <td>{x110Msg.Record.TxStatus}</td>
                    <td>{x110Msg.Record.MerchantId}</td>
                    <td>{x110Msg.Record.MerchantName}</td>
                    <td>{x110Msg.Record.CustomerId}</td>
                    <td>{x110Msg.Record.LoanReferenceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

const Loading = () => {
  return (
    <div className="m-3">
      <h5 className="text-center">Loading...</h5>
    </div>
  );
};

export default ViewAuthorizationTxnResponses;
