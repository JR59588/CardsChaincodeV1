exports.verifyAccountTxUtils = async function (req, res) {
    const { roleId, merchantId, customerId, loanReferenceNumber, msgType } = req.body;

    if (!(roleId && msgType && merchantId && customerId && loanReferenceNumber)) {
        res.status(400).json({
            success: false,
            message: `Ensure to provide valid request parameters for verifying account tx`
        });
    }

    if (!(roleId === "AAD")) {
        return res.status(400).json({
            success: false,
            message: "Please use AAD for this operation"
        })
    }

    const { error, accountTxResult } = await evaluateTransactionWithEndorsingOrganizations(roleId, channelName, "AccountSettlementTxCC", "accountSettlementTx", [msgType, merchantId, customerId, loanReferenceNumber], ["AODMSP", "ACDMSP"]);
    console.log("Error in account tx: ", error);
    console.log("Result in account tx: ", accountTxResult);
    if (error) {
        console.log(`verify account tx error: ${error}`)
        res.status(400).json({
            success: false,
            message: `Error in account tx verification ${error}`
        });
    } else {
        console.log(`verify account tx result: ${accountTxResult}`);
        const key = "x500-" + merchantId + "-" + customerId + "-" + loanReferenceNumber;
        console.log("key is: ", key);
        const { error, result } = await evaluateTransaction(roleId, channelName, "PYMTUtilsCC", "readState", [key]);
        // const 
        res.status(200).json({
            success: true,
            message: `Successfully invoked account tx verification`,
            x500Message: { Key: key, ...JSON.parse(result.toString()) },
        });
    }
}