import React from 'react'

const DashboardSummary = () => {
    return (
        <div style={{ 'height': '85vh' }}>
            <div className="container">
                <div className="row">
                    <div className="col-md-6"></div>
                    <div
                        className="col-md-6"
                        style={{ paddingLeft: "30px", paddingRight: "30px" }}
                    >
                        <h5 style={{ textAlign: "center", marginTop: "20px" }}>
                            Transactions 
                        </h5>


                        <div className="mt-3 table-responsive tableDiv" id="tableRes">
                            <table
                                className="table table-striped table-hover table-bordered"
                                id="myTable"
                            >
                                <thead className="table-primary">
                                    <tr>
                                        <th scope="col" colSpan="1" className="fontSize">
                                            No
                                        </th>
                                        <th scope="col" colSpan="3" className="fontSize">
                                            S/R Txns Summary (Hyperledger)
                                        </th>
                                        <th scope="col" colSpan="5" className="fontSize">
                                            S/R Submission Details
                                        </th>
                                        <th scope="col" colSpan="5" className="fontSize">
                                            S/R Txn Verification Summary
                                        </th>
                                    </tr>
                                    <tr>
                                        <th scope="col" className="fontSize"></th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            scope="col"
                                            className="fontSize"

                                        >
                                            S/R Txn Date
                                        </th>
                                        <th scope="col" className="fontSize">
                                            S/R Txn ID
                                        </th>
                                        <th scope="col" className="fontSize">
                                            S/R Txn Status
                                        </th>
                                        <th scope="col" className="fontSize">
                                            S/R Txn Amount
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Merchant <br />
                                            Details
                                        </th>
                                        <th
                                            style={{ cursor: "pointer" }}
                                            scope="col"
                                            className="fontSize"

                                        >
                                            Customer <br />
                                            Account Details
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Loan Ref Number
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Submission Date
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Submit S/R Txn (PSP)
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Authorize S/R Txn (ACD)
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Balance S/R Txn (AAD)
                                        </th>
                                        <th scope="col" className="fontSize">
                                            Clear S/R Txn (AOD)
                                        </th>
                                    </tr>
                                </thead>

                            </table>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default DashboardSummary