const { evaluateTransaction } = require("./utils");

const channelName = "channel1";

exports.getTransactionStats = async (req, res) => {
    try {
        const { error, result } = await evaluateTransaction(
            req.params.roleId,
            channelName,
            "PYMTUtilsCC",
            "GetTxByRange",
            ["", ""]
        );
        const transactions = JSON.parse(result);
        // console.log("Transactions are: ", transactions)
        // console.log("Number of transactions: ", transactions.length);
        const statusData = transactions.reduce((acc, curr) => {
            const status = curr.Record.TxStatus;
            if (!acc[status]) {
                acc[status] = 1;
            } else {
                acc[status] = acc[status] + 1;
            }
            return acc;
        }, {});
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
                    totalTransactions: transactions.length,
                    transactionsToday: transactions.filter(
                        ({ Record }) => {
                            console.log(new Date(Record.txTimestamp).toDateString(), new Date().toDateString())
                            return new Date(Record.txTimestamp).toDateString() ===
                                new Date().toDateString()

                        }
                    ).length,
                    pendingTransactions: transactions.filter(({ Record }) => Record.TxStatus !== 'TxCleared').length
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
