exports.verifySubmitTxUtils = async function (req, res) {
    const { roleId, merchantId, customerId, loanReferenceNumber } = req.body;

    if (!(roleId && merchantId && customerId && loanReferenceNumber)) {
        res.status(400).json({
            success: false,
            message: `Ensure to provide valid request parameters for verifying submit tx`
        });
    }
    const { error, result } = await evaluateTransaction(roleId, channelName, "SubmitSettlementTxCC", "submitSettlementTx", [merchantId, customerId, loanReferenceNumber]);
    console.log("Error in submit tx: ", error);
    console.log("Result in submit tx: ", result);
    if (error) {
        console.log(`verify submit tx error: ${error}`)
        res.status(400).json({
            success: false,
            message: `Error in submit tx verification ${error}`
        });
    } else {
        console.log(`verify submit tx result: ${result}`);
        res.status(200).json({
            success: true,
            message: `Successfully invoked submit tx verification`
        });
    }
}