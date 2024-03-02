import React from "react";
import { Table } from "react-bootstrap";

const ViewSettlementTxnRequests = () => {
  return (
    <div className="mt-3">
      <h5 className="text-center">Authorization requests (X100)</h5>
      <div style={{ overflow: "auto" }}>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <td>3</td>
              <td colSpan={2}>Larry the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <br />
      <h5 className="text-center">Authorization responses (X110)</h5>
      <div style={{ overflow: "auto" }}>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>No</th>
              <th colSpan={3}>Txn Summary (Hyperledger)</th>
              <th colSpan={3}>Txn Submission Details</th>
              <th colSpan={1}>Txn Verification Summary</th>
            </tr>
            <tr>
              <th></th>
              <th>Txn Date</th>
              <th>Txn ID</th>
              <th>Status</th>
              <th>Merchant Details</th>
              <th>Customer Details</th>
              <th>Txn Reference Number</th>
              <th>Submit Txn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>20/10/2019</td>
              <td>12345</td>
              <td>TxSubmitted</td>
              <td>MID001</td>
              <td>CID001</td>
              <td>LR001</td>
            </tr>
            <tr>
              <td>2</td>
              <td>20/10/2019</td>
              <td>12345</td>
              <td>TxSubmitted</td>
            </tr>
            <tr>
              <td>3</td>
              <td>20/10/2019</td>
              <td>12345</td>
              <td>TxSubmitted</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <br />

      <h5 className="text-center">Settlement requests (X500)</h5>
      <div style={{ overflow: "auto" }}>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <td>3</td>
              <td colSpan={2}>Larry the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ViewSettlementTxnRequests;
