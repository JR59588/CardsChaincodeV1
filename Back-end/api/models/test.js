var mongoose = require('mongoose');

var test = new mongoose.Schema( {
    TransactionAmount: {
        type: Number, 
        require: true
        },

   TransactionCurrency: {
        type: String, 
        require: true
        },

   TransactionReferenceNumber: {
        type: String, 
        require: true
        },

  TransactionDate: {
        type: String,  
        require:true
        },

  merchantID: { 
       type: String, 
       require: true 
   },

   merchantName: {
    type: String, 
    require: true
    },


  CustomerName:{ 
       type: String, 
       require: true 
   },

 CustomerID:{ 
       type: String, 
       require: true 
   },

LoanReferenceNumber:{ 
       type: String, 
       require: true 
   },

LoanAccountNumber:{ 
       type: String, 
       require: true 
   },

LoanApprovalDate:{ 
       type: String,               
       require: true                                                                  
   },

ProductType:{ 
       type: String, 
       require: true 
   },


DateofLoanApproval:{ 
       type: String, 
       require: true 
   },

LoanAmount:{ 
       type: Number, 
       require: true 
   },

LoanTenure:{ 
       type: String, 
       require: true 
   },
LoanStatus:{ 
       type: String, 
       require: true 
   },
LoanDisbursementDate:{ 
    type: String, 
    require: true 
   },
   
LoanAccountNumber:{ 
       type: String, 
       require: true 
   },
LoCapprovedamount:{ 
       type: Number, 
       require: true 
   },
LoCAvailableamount:{ 
       type: Number, 
       require: true 
   },
isContractSigned:{ 
       type: String, 
       require: true 
   },
});

module.exports = mongoose.model('test_db',test)
