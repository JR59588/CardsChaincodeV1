
class HLFEVENT {
  constructor() {
    // super();
    // this.ctx = ctx;
  }
  // constructor(ctx) {
  //   // super();
  //   this.ctx = ctx;
  // }

  async hlfevents() {
    const hc = {
      MERCHANT_RT_EVENT: { eventID: "EMT-RT", invokecc: "PYMTUtilsCC", invokeFunc: "requestTx", channel: "channel1" },
      AAD_ACD_CT_EVENT: { eventID: "EAADACD-CT", invokecc: "ConfirmSettlementTxCC", invokeFunc: "confirmSettlementTx", channel: "channel1" },
      AAD_AOD_ST_EVENT: { eventID: "EAADAOD-ST", invokecc: "SubmitSettlementTxCC", invokeFunc: "submitSettlementTx", channel: "channel1" },
      AOD_ACD_AT_EVENT: { eventID: "EAODACD-AT", invokecc: "AccountSettlementTxCC", invokeFunc: "accountSettlementTx", channel: "channel1" },
    };
    return hc;
  }
}
module.exports = HLFEVENT;