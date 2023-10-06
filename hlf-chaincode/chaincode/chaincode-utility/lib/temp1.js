async saveTxState(ctx, key, txIn) {
    // === Save transaction to state ===    let txID=ctx.stub.getTxID();
    // === Save transaction to state ===
    try {

        let txID = ctx.stub.getTxID();
        console.log("Line 389", txID);
        txIn.txID = txID;
        let txTimestamp = ctx.stub.getTxTimestamp();
        console.log("Timestamp is: ", txTimestamp, "Timestamp toString: ", txTimestamp.toString());
        const milliseconds = (txTimestamp.seconds.low + ((txTimestamp.nanos / 1000000) / 1000)) * 1000;
        const date = new Date(milliseconds);
        txIn.txTimestamp = date.toString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(txIn)));
        console.log("successfully putstate for key :", key);

    } catch (error) {
        console.log(error);
        throw error;
    }
}