import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  OverlayTrigger,
  Spinner,
  Table,
  Tooltip,
  Modal,
} from "react-bootstrap";
import LoaderButton from "./LoaderButton";
import ViewSettlementAuthRequests from "./ViewSettlementAuthRequests";
// import ViewAuthorizationTxnRequests from "./ViewAuthorizationTxnRequests";
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const apiInfo = {
  TxRequested: "verifyConfirmTx",
  TxConfirmed: "verifySubmitTx",
  TxSubmitted: "verifyAccountTx",
};

const requiredStatuses = ["TxConfirmed", "TxSubmitted", "TxAccounted"];
const rejectedStatuses = ["TxNonConfirmed", "TxNotSubmitted", "TxNotAccounted"];

const ViewSettlementTxnRequests = ({ roleId }) => {
  const [loading, setLoading] = useState(true);
  const [x500Msgs, setX500Msgs] = useState([]);
  const [mdr, setMdr] = useState(null);
  const [systemsTraceAuditNumbers, setSystemsTraceAuditNumbers] =
    useState(null);
  const [batchNumber, setBatchNumber] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");

  const [show, setShow] = useState(false);
  const [popupData, setPopupData] = useState({
    header: "",
    content: "",
    reason: "",
  });

  const handleClose = () => setShow(false);

  const [showModal, setShowModal] = useState(false);
  const [showMerchantDetails, setShowMerchantDetails] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleCloseMerchantDetails = () => setShowMerchantDetails(false);
  const handleCloseTransactionDetails = () => setShowTransactionDetails(false);
  const handleShow = (systemsTraceAuditNumbers) => {
    // setSystemsTraceAuditNumbers(systemsTraceAuditNumbers);
    setShowModal(true);
  };
  const handleShowMerchantDetails = () => {
    setShowMerchantDetails(true);
  };
  const handleShowTransactionDetails = () => {
    setShowTransactionDetails(true);
  };
  const handleTxnRequest = async (
    msgType,
    merchantId,
    customerId,
    loanReferenceNumber,
    apiPath
  ) => {
    try {
      setErrorMsg("");
      const response = await axios.post(`${apiBaseUrl}/api/v1/${apiPath}`, {
        roleId,
        msgType,
        merchantId,
        customerId,
        loanReferenceNumber,
      });

      if (response.data.success === true) {
        const { TxStatus, Key } = response.data.x500Message;

        setX500Msgs((x500Messages) => {
          return x500Messages.map((x500Message) => {
            if (x500Message.Key === Key) {
              x500Message.Record.TxStatus = TxStatus;
            }
            return x500Message;
          });
        });
        setShow(true);
        setPopupData({
          header: "Success",
          content: <div>The request was successful</div>,
        });
      }
    } catch (error) {
      console.log("Error submitting transaction: ", error);
      setErrorMsg("Error submitting the transaction");
      setShow(true);
      setPopupData({
        header: "Failure",
        content: <div>The request has failed</div>,
        reason: error.response.data.message || "",
      });
    }
  };

  useEffect(() => {
    const fetchX500Msgs = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const allMsgResponse = await axios.get(
          `${apiBaseUrl}/api/v1/GetTxByRange/${roleId}`
        );

        // const mdrResponse = await axios.get(
        //   `${apiBaseUrl}/api/v1/retrievePvAADAODMetaData/${merchantId}/AOD`
        // );

        console.log("allmsgresponse", allMsgResponse);
        // console.log("mdrresponse", mdrResponse);
        const allMsgs = allMsgResponse.data.response;
        let x500Msgs = allMsgs.filter(
          (msg) => msg.Record.messageType === "x500"
        );

        // Sorting the messages by timestamp in descending order
        x500Msgs = x500Msgs.sort((a, b) => {
          return new Date(b.Record.timestamp) - new Date(a.Record.timestamp);
        });

        setX500Msgs(x500Msgs);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching authorization requests: ", error);
        setX500Msgs([]);
        setLoading(false);
        setErrorMsg("Error fetching data");
      }
    };

    fetchX500Msgs();
  }, []);

  return (
    <div style={{ minHeight: "520px" }}>
      {loading || !roleId ? (
        <Loading />
      ) : (
        <>
          <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>{popupData.header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>{popupData.content}</div>
              {popupData.reason && <div>Reason: {popupData.reason} </div>}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
          <div className="mt-3">
            <h5 className="text-center mb-3">Authorization requests (X500)</h5>
            <div style={{ overflow: "auto" }}>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>No</th>
                    <th colSpan={4}>Settlement Txn Summary (Hyperledger)</th>
                    <th colSpan={4}>Settlement Submission Details</th>
                    <th colSpan={4}>Settlement Txn Verification Summary</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th>Settlement Txn Date</th>
                    <th>Settlement Txn ID</th>
                    <th>Settlement transaction status</th>
                    <th>Settlement transaction amount</th>
                    <th>Net transaction amount</th>
                    <th>Merchant Details</th>
                    <th>Transaction Details</th>
                    <th>Batch ID</th>

                    <th>X100 Authorization requests</th>
                    <th>Confirm Settlement Txn</th>
                    <th>Submit Settelement Txn</th>
                    <th>Account Settlement Txn</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {JSON.stringify(x500Msgs)} */}
                  {x500Msgs.map((x500Msg, idx) => (
                    <tr key={x500Msg.Key}>
                      <td>{idx + 1}</td>
                      <td>{x500Msg.Record.txTimestamp}</td>
                      {/* <td>{20 / 10 / 2019}</td> */}
                      <td>
                        <OverlayTrigger
                          overlay={
                            <Tooltip id="tooltip">
                              {x500Msg.Record.txID}
                            </Tooltip>
                          }
                        >
                          <div>{`${x500Msg.Record.txID.slice(
                            0,
                            4
                          )}...${x500Msg.Record.txID.slice(-4)}`}</div>
                        </OverlayTrigger>
                      </td>
                      <td>{x500Msg.Record.TxStatus}</td>
                      <td>{parseInt(x500Msg.Record.amountNetSettlement)}</td>
                      <td>{parseInt(x500Msg.Record.amountNetSettlement)}</td>
                      <td>
                        {x500Msg.Record.MerchantName}
                        <br />
                        <span
                          style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={handleShowMerchantDetails}
                        >
                          View More
                        </span>
                      </td>
                      <td>
                        {x500Msg.Record.CustomerId}
                        <br />
                        <span
                          style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={handleShowTransactionDetails}
                        >
                          View More
                        </span>
                      </td>
                      <td>{x500Msg.Record.LoanReferenceNumber}</td>

                      <td>
                        <Button
                          variant="primary"
                          onClick={() => {
                            // setSystemsTraceAuditNumbers(
                            //   x500Msg.Record.systemsTraceAuditNumber.split(",")
                            // );
                            setBatchNumber(x500Msg.Record.batchNumber);
                            handleShow();
                          }}
                        >
                          View X100 msgs
                        </Button>
                      </td>

                      <td>
                        {getButtonOrStatus(
                          x500Msg.Record.TxStatus,
                          0,
                          requiredStatuses,
                          rejectedStatuses,
                          () =>
                            handleTxnRequest(
                              "x500",
                              x500Msg.Record.MerchantId,
                              x500Msg.Record.CustomerId,
                              x500Msg.Record.LoanReferenceNumber,
                              apiInfo[x500Msg.Record.TxStatus]
                            )
                        )}
                        {/* {x500Msg.Record.TxStatus === "TxRequested" ? (
                          <LoaderButton handlerFunc={() =>
                            handleTxnRequest(
                              "x500",
                              x500Msg.Record.MerchantId,
                              x500Msg.Record.CustomerId,
                              x500Msg.Record.LoanReferenceNumber,
                              apiInfo[x500Msg.Record.TxStatus]
                            )} />
                        ) : x500Msg.Record.TxStatus === "TxConfirmed" ? <>Confirmed</> : x500Msg.Record.TxStatus === "TxNonConfirmed" ? <>Not Confirmed</> : < */}
                      </td>

                      <td>
                        {getButtonOrStatus(
                          x500Msg.Record.TxStatus,
                          1,
                          requiredStatuses,
                          rejectedStatuses,
                          () =>
                            handleTxnRequest(
                              "x500",
                              x500Msg.Record.MerchantId,
                              x500Msg.Record.CustomerId,
                              x500Msg.Record.LoanReferenceNumber,
                              apiInfo[x500Msg.Record.TxStatus]
                            )
                        )}
                      </td>

                      <td>
                        {getButtonOrStatus(
                          x500Msg.Record.TxStatus,
                          2,
                          requiredStatuses,
                          rejectedStatuses,
                          () =>
                            handleTxnRequest(
                              "x500",
                              x500Msg.Record.MerchantId,
                              x500Msg.Record.CustomerId,
                              x500Msg.Record.LoanReferenceNumber,
                              apiInfo[x500Msg.Record.TxStatus]
                            )
                        )}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>x100 Authorization Requests</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <ViewSettlementAuthRequests
                    roleId={roleId}
                    batchNumber={batchNumber}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal
                show={showMerchantDetails}
                onHide={handleCloseMerchantDetails}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>Merchant Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="mt-3">
                    <div style={{ overflow: "auto" }}>
                      <Table bordered hover>
                        <thead>
                          <tr>
                            <th>Merchant Name</th>
                            <th>Merchant ID</th>
                            <th>Negotiated MDR</th>
                            <th>POS ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={handleCloseMerchantDetails}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal
                show={showTransactionDetails}
                onHide={handleCloseTransactionDetails}
                size="lg"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="mt-3">
                    <div style={{ overflow: "auto" }}>
                      <Table bordered hover>
                        <thead>
                          <tr>
                            <th>Transaction STAN</th>
                            <th>Transaction Date</th>
                            <th>Transaction Status</th>
                            <th>Transaction Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th></th>

                            <th></th>
                            <th></th>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={handleCloseTransactionDetails}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
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
//   requiredStatus,
//   rejectedStatus,
//   handlerFunc
// ) => {
//   if (status === requiredStatus || status === rejectedStatus) {
//     return <>{status}</>;
//   } else {
//     return <LoaderButton handlerFunc={handlerFunc} />;
//   }
// };

const getButtonOrStatus = (
  status,
  currentRequiredStatus,
  requiredStatuses,
  rejectedStatuses,
  handlerFunc
) => {
  const statusIndex = requiredStatuses.findIndex((st) => st === status);
  if (currentRequiredStatus === statusIndex + 1) {
    return <LoaderButton handlerFunc={handlerFunc} />;
  }
  if (
    (statusIndex <= currentRequiredStatus &&
      requiredStatuses.includes(status)) ||
    rejectedStatuses.includes(status)
  ) {
    return <>{status}</>;
  }

  return <>{"-"}</>;
};

export default ViewSettlementTxnRequests;
