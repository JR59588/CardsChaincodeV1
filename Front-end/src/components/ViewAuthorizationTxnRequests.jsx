import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import LoaderButton from "./LoaderButton";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const ViewAuthorizationTxnRequests = ({ roleId }) => {
  const [loading, setLoading] = useState(true);
  const [x100Msgs, setX100Msgs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTxnRequest = async (
    msgType,
    merchantId,
    customerId,
    loanReferenceNumber
  ) => {
    try {
      setErrorMsg("");
      const response = await axios.post(
        `${apiBaseUrl}/api/v1/verifyConfirmTx`,
        {
          roleId,
          msgType,
          merchantId,
          customerId,
          loanReferenceNumber,
        }
      );

      if (response.data.success === true) {
        const TxStatus = response.data.x100Message.Record.TxStatus;
        const Key = response.data.x100Message.Record.Key;
        const x100Messages = x100Msgs;
        const changedMsg = x100Messages.find(
          (x100Message) => x100Message.Record.Key === Key
        );
        changedMsg.TxStatus = TxStatus;
        setX100Msgs(x100Messages);
      }
    } catch (error) {
      console.log("Error submitting confirm tx: ", error);
      setErrorMsg("Error fetching data");
    }
  };

  useEffect(() => {
    const fetchX100Msgs = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const allMsgResponse = await axios.get(
          `${apiBaseUrl}/api/v1/GetTxByRange/${roleId}`
        );
        console.log("allmsgresponse", allMsgResponse);
        const allMsgs = allMsgResponse.data.response;
        const x100Msgs = allMsgs.filter(
          (msg) => msg.Record.messageType === "x100"
        );
        setX100Msgs(x100Msgs);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching authorization requests: ", error);
        setX100Msgs([]);
        setLoading(false);
        setErrorMsg("Error fetching data");
      }
    };

    fetchX100Msgs();
  }, []);

  return (
    <>
      {loading || !roleId ? (
        <Loading />
      ) : (
        <div className="mt-3">
          <h5 className="text-center mb-3">Authorization requests (X100)</h5>
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
                {/* {JSON.stringify(x100Msgs)} */}
                {x100Msgs.map((x100Msg, idx) => (
                  <tr key={x100Msg.Key}>
                    <td>{idx + 1}</td>
                    <td>{x100Msg.Record.txTimestamp}</td>
                    {/* <td>{20 / 10 / 2019}</td> */}
                    <td>{x100Msg.Record.txID}</td>
                    <td>{x100Msg.Record.TxStatus}</td>
                    <td>{x100Msg.Record.MerchantId}</td>
                    <td>{x100Msg.Record.MerchantName}</td>
                    <td>{x100Msg.Record.CustomerId}</td>
                    <td>{x100Msg.Record.LoanReferenceNumber}</td>
                    <td>
                      {getButtonOrStatus(
                        x100Msg.Record.TxStatus,
                        "TxConfirmed",
                        "TxNonConfirmed",
                        () =>
                          handleTxnRequest(
                            "x100",
                            x100Msg.Record.MerchantId,
                            x100Msg.Record.CustomerId,
                            x100Msg.Record.LoanReferenceNumber
                          )
                      )}
                    </td>
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

const getButtonOrStatus = (
  status,
  requiredStatus,
  rejectedStatus,
  handlerFunc
) => {
  if (status === requiredStatus || status === rejectedStatus) {
    return <>{status}</>;
  } else {
    return <LoaderButton handlerFunc={handlerFunc} />;
  }
};

export default ViewAuthorizationTxnRequests;
