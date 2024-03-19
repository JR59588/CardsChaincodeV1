import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import LoaderButton from "./LoaderButton";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const apiInfo = {
  TxRequested: "verifyConfirmTx",
  TxConfirmed: "verifySubmitTx",
  TxSubmitted: "verifyAccountTx",
};

const requiredStatuses = ["TxConfirmed", "TxSubmitted", "TxAccounted"];
const rejectedStatuses = ["TxNonConfirmed", "TxNotSubmitted", "TxNotAccounted"];

const ViewSettlementAuthRequests = ({ roleId, systemsTraceAuditNumbers }) => {
  const [loading, setLoading] = useState(true);
  const [x100Msgs, setX100Msgs] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({
    header: "",
    content: "",
    reason: "",
  });

  const handleClose = () => setShow(false);

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
          (msg) =>
            msg.Record.messageType === "x100" &&
            systemsTraceAuditNumbers.includes(
              msg.Record.systemsTraceAuditNumber
            )
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
    <div>
      {loading || !roleId ? (
        <Loading />
      ) : (
        <>
          <div className="mt-3">
            {/* <h5 className="text-center mb-3">Authorization requests (X100)</h5> */}
            <div style={{ overflow: "auto" }}>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>No</th>
                    <th colSpan={2}>Txn Summary (Hyperledger)</th>
                    <th colSpan={5}>Txn Submission Details</th>
                    <th colSpan={2}>Txn Verification Summary</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Txn Date</th>
                    <th>Txn ID</th>
                    <th>Merchant Details</th>
                    <th>Merchant Name</th>
                    <th>Customer Details</th>
                    <th>Txn Reference Number</th>
                    <th>Systems trace audit number</th>
                    <th>Status</th>
                    {/* <th>Request Txn</th> */}
                  </tr>
                </thead>
                <tbody>
                  {/* {JSON.stringify(x100Msgs)} */}
                  {x100Msgs.map((x100Msg, idx) => (
                    <tr key={x100Msg.Key}>
                      <td>{idx + 1}</td>
                      <td>{x100Msg.Record.txTimestamp}</td>
                      {/* <td>{20 / 10 / 2019}</td> */}
                      <td>
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip">
                              {x100Msg.Record.txID}
                            </Tooltip>
                          }
                        >
                          <div>{`${x100Msg.Record.txID.slice(
                            0,
                            4
                          )}...${x100Msg.Record.txID.slice(-4)}`}</div>
                        </OverlayTrigger>
                      </td>
                      <td>{x100Msg.Record.MerchantId}</td>
                      <td>{x100Msg.Record.MerchantName}</td>
                      <td>{x100Msg.Record.CustomerId}</td>
                      <td>{x100Msg.Record.LoanReferenceNumber}</td>
                      <td>{x100Msg.Record.systemsTraceAuditNumber}</td>
                      <td>{x100Msg.Record.TxStatus}</td>

                      {/* <td>
                        {getButtonOrStatus(
                          x100Msg.Record.TxStatus,
                          requiredStatuses,
                          rejectedStatuses,
                          () =>
                            handleTxnRequest(
                              "x100",
                              x100Msg.Record.MerchantId,
                              x100Msg.Record.CustomerId,
                              x100Msg.Record.LoanReferenceNumber,
                              apiInfo[x100Msg.Record.TxStatus]
                            )
                        )}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Loading = () => {
  return (
    <div className="m-3">
      <h5 className="text-center">Loading...</h5>
    </div>
  );
};

// const getButtonOrStatus = (
//   status,
//   requiredStatuses,
//   rejectedStatuses,
//   handlerFunc
// ) => {
//   if (
//     status === requiredStatuses[requiredStatuses.length - 1] ||
//     status === requiredStatuses[requiredStatuses.length - 2]
//   ) {
//     return "-";
//   } else if (rejectedStatuses.includes(status)) {
//     return <>{status}</>;
//   } else {
//     return <LoaderButton handlerFunc={handlerFunc} />;
//   }
// };

export default ViewSettlementAuthRequests;
