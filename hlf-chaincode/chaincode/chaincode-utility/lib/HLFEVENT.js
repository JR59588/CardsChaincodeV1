
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
      MERCHANT_RT_EVENT: { eventID: "EMT-RT1001", invokecc: "PYMTUtilsCC", invokeFunc: "acceptTx", channel: "mychannel" },
      AGG_RT_EVENT: { eventID: "EMT-RT1501", invokecc: "PYMTUtilsCC", invokeFunc: "acceptTx", channel: "mychannel" },
      MERCHANT_IT_EVENT: { eventID: "EMT-IT2001", invokecc: "PYMTUtilsCC", invokeFunc: "acceptTx", channel: "mychannel" },

      SA_AT_EVENT: { eventID: "ESA-AT3001", invokecc: "PYMTUtilsCC", invokeFunc: "submitTx", channel: "mychannel" },
      AGG_AT_EVENT: { eventID: "EBK-AT3101", invokecc: "PYMTUtilsCC", invokeFunc: "submitTx", channel: "mychannel" },
      // AP_AT_EVENT: { eventID: "EBK-AT3101", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      // CACCT_AT_EVENT: { eventID: "EBK-AT3201", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      // EDI_AT_EVENT: { eventID: "EBK-AT3301", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },

      // SA_AT_EVENT: { eventID: "ESA-AT3001", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      // AP_AT_EVENT: { eventID: "EBK-AT3101", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      // CACCT_AT_EVENT: { eventID: "EBK-AT3201", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      // EDI_AT_EVENT: { eventID: "EBK-AT3301", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },

      // SA_VT_EVENT: { eventID: "ESA-VT4001", invokecc: "PYMTUtilsCC", invokeFunc: "submitTx", channel: "mychannel" },
      // AP_VT_EVENT: { eventID: "EBK-VT4101", invokecc: "PYMTUtilsCC", invokeFunc: "submitTx", channel: "mychannel" },
      // CACCT_VT_EVENT: { eventID: "EBK-VT4201", invokecc: "PYMTUtilsCC", invokeFunc: "submitTx", channel: "mychannel" },
      // EDI_VT_EVENT: { eventID: "EBK-VT4301", invokecc: "PYMTUtilsCC", invokeFunc: "submitTx", channel: "mychannel" },


      SA_ST_EVENT: { eventID: "ESA-ST5001", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      AGG_ST_EVENT: { eventID: "EBK-ST5101", invokecc: "PYMTUtilsCC", invokeFunc: "validateTx", channel: "mychannel" },
      

      AP_VT_EVENT: { eventID: "EBK-VT4101", invokecc: "PYMTUtilsCC", invokeFunc: "processTx", channel: "mychannel" },
      EDI_VT_EVENT: { eventID: "EBK-VT4301", invokecc: "PYMTUtilsCC", invokeFunc: "processTx", channel: "mychannel" },


      // SA_ST_EVENT: { eventID: "ESA-ST5001", invokecc: "PYMTUtilsCC", invokeFunc: "processTx", channel: "mychannel" },
      // AP_ST_EVENT: { eventID: "EBK-ST5101", invokecc: "PYMTUtilsCC", invokeFunc: "processTx", channel: "mychannel" },
      // CACCT_ST_EVENT: { eventID: "EBK-ST5201", invokecc: "PYMTUtilsCC", invokeFunc: "processTx", channel: "mychannel" },
      // EDI_ST_EVENT: { eventID: "EBK-ST5301", invokecc: "PYMTUtilsCC", invokeFunc: "processTx", channel: "mychannel" },

    
      AP_PT_EVENT: { eventID: "EBK-PT6101", invokecc: "PYMTUtilsCC", invokeFunc: "clearTx", channel: "mychannel" },
      EDI_PT_EVENT: { eventID: "EBK-PT3301", invokecc: "PYMTUtilsCC", invokeFunc: "clearTx", channel: "mychannel" },

      SA_CT_EVENT: { eventID: "ESA-CT7001", invokecc: "PYMTUtilsCC", invokeFunc: "processSettlementTx", channel: "mychannel" },
      AP_CT_EVENT: { eventID: "EBK-CT7101", invokecc: "PYMTUtilsCC", invokeFunc: "processSettlementTx", channel: "mychannel" },
      CACCT_CT_EVENT: { eventID: "EBK-CT7201", invokecc: "PYMTUtilsCC", invokeFunc: "processSettlementTx", channel: "mychannel" },
      EDI_CT_EVENT: { eventID: "EBK-CT7301", invokecc: "PYMTUtilsCC", invokeFunc: "processSettlementTx", channel: "mychannel" },
    };
    return hc;
  }
}
module.exports = HLFEVENT;