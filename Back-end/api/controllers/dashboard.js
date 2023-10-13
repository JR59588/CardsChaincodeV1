const { evaluateTransaction } = require("./utils");

const channelName = "channel1";

const rejectedStatuses = ['TxNotAuthorized', 'TxNotBalanced', 'TxNotCleared'];

const getTransactionsToday = (transactions) => {
    return transactions.filter(
        ({ Record }) => {
            return new Date(Record.txTimestamp).toDateString() ===
                new Date().toDateString()
        }
    );
}

const getTransactionStatusToday = (transactions) => {

    let rejectedTxns = 0,
        pendingTxns = 0,
        txns = transactions.length;

    transactions.forEach((txn) => {
        if (rejectedStatuses.includes(txn.Record.TxStatus)) {
            rejectedTxns++;
        } else if (txn.Record.TxStatus != 'TxCleared') {
            pendingTxns++;
        }
    })

    return { rejectedTxns, pendingTxns, txns }
}

exports.getTransactionStats = async (req, res) => {
    try {

        const { error, result } = await evaluateTransaction(
            req.params.roleId,
            channelName,
            "PYMTUtilsCC",
            "GetTxByRange",
            ["", ""]
        );

        const transactionsToday = getTransactionsToday(JSON.parse(result));


        const statusData = transactionsToday.reduce((acc, curr) => {
            const status = curr.Record.TxStatus;
            if (!acc[status]) {
                acc[status] = 1;
            } else {
                acc[status] = acc[status] + 1;
            }
            return acc;
        }, {});

        const transactionStatuses = getTransactionStatusToday(transactionsToday);

        if (error) {
            console.log(`Error fetching transaction stats: ${error}`);
            return res.status(400).json({
                success: false,
                message: `Error fetching transaction stats: ${error}`,
            });
        } else {
            console.log(`Transaction stats result: ${result}`);
            return res.status(200).json({
                success: true,
                stats: {
                    statusData,
                    transactionsToday: transactionStatuses.txns,
                    pendingTransactionsToday: transactionStatuses.pendingTxns,
                    rejectedTransactionsToday: transactionStatuses.rejectedTxns
                },
                message: `Successfully fetched transaction stats`,
            });
        }
    } catch (error) {
        console.log("Error in fetching transaction stats: ", error);
        return res.status(400).json({
            success: false,
            message: "Error in fetching transaction stats",
        });
    }
};
