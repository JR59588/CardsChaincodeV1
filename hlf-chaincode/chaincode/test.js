const currentTxReadState = { "CustomerId": "CID001", "LoanReferenceNumber": "LR001", "MerchantId": "MID001", "MerchantName": "4", "TxStatus": "TxNonAccounted", "batchNumber": "14", "cardAcceptorIdentificationCode": "11", "cardAcceptorTerminalIdentification": "10", "messageType": "x500", "networkInternationalId": "9", "primaryAccountNumber": "5", "processingCode": "6", "systemsTraceAuditNumber": "8", "totalNumberOfTransactions": "15", "transactionAmount": "7", "transactionCurrencyCode": "12", "transactionLifecycleId": "13", "txID": "6fb7e95f8c664c5013536540466b42a3e4bbb59f447ea3c276123470d2e9d546", "txTimestamp": "Thu Feb 22 2024 11:58:18 GMT+0000 (Coordinated Universal Time)" }
const prevTxnStr = "[{\"Key\":\"x100-MID001-CID001-LR001\",\"Record\":{\"CustomerId\":\"CID001\",\"LoanReferenceNumber\":\"LR001\",\"MerchantId\":\"MID001\",\"MerchantName\":\"4\",\"TxStatus\":\"TxRequested\",\"acquiringInstitutionIdentificationCode\":\"13\",\"additionalData\":\"19\",\"batchNumber\":\"20\",\"cardAcceptorIdentificationCode\":\"16\",\"cardAcceptorNameAndLocation\":\"17\",\"cardAcceptorTerminalIdentification\":\"15\",\"currencyCode\":\"18\",\"expirationDate\":\"10\",\"merchantCategoryCode\":\"11\",\"messageType\":\"x100\",\"pointOfServiceEntryMode\":\"12\",\"primaryAccountNumber\":\"5\",\"processingCode\":\"6\",\"retrievalReferenceNumber\":\"14\",\"systemsTraceAuditNumber\":\"8\",\"transactionAmount\":\"7\",\"transmissionDateAndTime\":\"8\",\"txID\":\"3843c7726f64d5496356bf0dd168f651f4232b5340aafb496d948dbee141d6f2\",\"txTimestamp\":\"Wed Feb 21 2024 07:15:49 GMT+0000 (Coordinated Universal Time)\"}},{\"Key\":\"x110-MID001-CID001-LR001\",\"Record\":{\"CustomerId\":\"CID001\",\"LoanReferenceNumber\":\"LR001\",\"MerchantId\":\"MID001\",\"MerchantName\":\"4\",\"TxStatus\":\"TxSubmitted\",\"acquiringInstitutionIdentificationCode\":\"13\",\"additionalData\":\"19\",\"approverCode\":\"21\",\"authorizationId\":\"22\",\"batchNumber\":\"20\",\"cardAcceptorIdentificationCode\":\"16\",\"cardAcceptorNameAndLocation\":\"17\",\"cardAcceptorTerminalIdentification\":\"15\",\"currencyCode\":\"18\",\"expirationDate\":\"10\",\"merchantCategoryCode\":\"11\",\"messageType\":\"x110\",\"pointOfServiceEntryMode\":\"12\",\"primaryAccountNumber\":\"5\",\"processingCode\":\"6\",\"retrievalReferenceNumber\":\"14\",\"systemsTraceAuditNumber\":\"8\",\"transactionAmount\":\"7\",\"transmissionDateAndTime\":\"8\",\"txID\":\"3f3e716c60d643702909bb4b0c6a9e7d4cb1bfe9cde84d4edd13a6511ef9bdb3\",\"txTimestamp\":\"Wed Feb 21 2024 07:16:19 GMT+0000 (Coordinated Universal Time)\"}},{\"Key\":\"x500-MID001-CID001-LR001\",\"Record\":{\"CustomerId\":\"CID001\",\"LoanReferenceNumber\":\"LR001\",\"MerchantId\":\"MID001\",\"MerchantName\":\"4\",\"TxStatus\":\"TxNonAccounted\",\"batchNumber\":\"14\",\"cardAcceptorIdentificationCode\":\"11\",\"cardAcceptorTerminalIdentification\":\"10\",\"messageType\":\"x500\",\"networkInternationalId\":\"9\",\"primaryAccountNumber\":\"5\",\"processingCode\":\"6\",\"systemsTraceAuditNumber\":\"8\",\"totalNumberOfTransactions\":\"15\",\"transactionAmount\":\"7\",\"transactionCurrencyCode\":\"12\",\"transactionLifecycleId\":\"13\",\"txID\":\"6fb7e95f8c664c5013536540466b42a3e4bbb59f447ea3c276123470d2e9d546\",\"txTimestamp\":\"Thu Feb 22 2024 11:58:18 GMT+0000 (Coordinated Universal Time)\"}}]"
const prevTxns = JSON.parse(prevTxnStr);
const stan = currentTxReadState.systemsTraceAuditNumber;
console.log("Stan is: ", stan);
console.log(prevTxns);

const x100Msgs = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x100" && prevTxn.Record.systemsTraceAuditNumber === stan);
const x110Msgs = prevTxns.filter((prevTxn) => prevTxn.Record.messageType === "x110" && prevTxn.Record.systemsTraceAuditNumber === stan);


// console.log("X100 messages: ", x100Msgs);
// console.log("X110 messages: ", x110Msgs);

let x100Verified = true;

for (let i = 0; i < x100Msgs.length; i++) {
    const x100Msg = x100Msgs[i];
    console.log("x100 msg: ", x100Msg);
    if (x100Msg.Record.TxStatus !== 'TxConfirmed') {
        x100Verified = false;
        break;
    }
}

let x110Verified = true;

for (let i = 0; i < x110Msgs.length; i++) {
    const x110Msg = x110Msgs[i];
    console.log("x110 msg: ", x110Msg);
    if (x110Msg.Record.TxStatus !== 'TxSubmitted') {
        x110Verified = false;
        break;
    }
}

console.log("x100 messages verification: ", x100Verified);
console.log("x110 messages verification: ", x110Verified);