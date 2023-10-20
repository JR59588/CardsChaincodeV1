function ISO8583(message, additionLength) {
	this.fields = {
		"1": ["b", 64, "bitMapExtended", false, false],
		"2": ["n", 19, "primaryAccountNumber", true, false],
		"3": ["n", 6, "processingCode", false, false],
		"4": ["n", 12, "transactionAmount", false, false],
		"5": ["n", 12, "settlementAmount", false, false],
		"6": ["n", 12, "amount, cardholderBilling", false, false],
		"7": ["n", 10, "transmissionDateAndTime", false, false],
		"8": ["n", 8, "amount, cardholderBillingFee", false, false],
		"9": ["n", 8, "conversionRate, settlement", false, false],
		"10": ["n", 8, "conversionRate, cardholderBilling", false, false],
		"11": ["n", 6, "systemsTraceAuditNumber", false, false],
		"12": ["n", 6, "timeLocalTransactionHHMMSS", false, false],
		"13": ["n", 4, "dateLocalTransactionMMDD", false, false],
		"14": ["n", 4, "expirationDate", false, false],
		"15": ["n", 4, "dateSettlement", false, false],
		"16": ["n", 4, "dateConversion", false, false],
		"17": ["n", 4, "dateCapture", false, false],
		"18": ["n", 4, "merchantCategoryCode", false, false],
		"19": ["n", 3, "acquiringInstitutionCountryCode", false, false],
		"20": ["n", 3, "panExtendedCountryCode", false, false],
		"21": ["n", 3, "forwardingInstitutionCountryCode", false, false],
		"22": ["n", 3, "pointOfServiceEntryMode", false, false],
		"23": ["n", 3, "applicationPanNumber", false, false],
		"24": ["n", 3, "functionCode(ISO 8583:1993)/networkInternationalIdentifier (NII)", false, false],
		"25": ["n", 2, "pointOfServiceConditionCode", false, false],
		"26": ["n", 2, "pointOfServiceCaptureCode", false, false],
		"27": ["n", 1, "authorizingIdentificationResponseLength", false, false],
		"28": ["n", 8, "amountTransactionFee", false, true],
		"29": ["n", 8, "amountSettlementFee", false, true],
		"30": ["n", 8, "amountTransactionProcessingFee", false, true],
		"31": ["n", 8, "amountSettlementProcessingFee", false, true],
		"32": ["n", 11, "acquiringInstitutionIdentificationCode", true, false],
		"33": ["n", 11, "forwardingInstitutionIdentificationCode", true, false],
		"34": ["n", 28, "primaryAccountNumberExtended", true, false],
		"35": ["z", 37, "track2Data", true, false],
		"36": ["n", 104, "track3Data", true, false],
		"37": ["an", 12, "retrievalReferenceNumber", false, false],
		"38": ["an", 6, "authorizationIdentificationResponse", false, false],
		"39": ["an", 2, "responseCode", false, false],
		"40": ["an", 3, "serviceRestrictionCode", false, false],
		"41": ["ans", 8, "cardAcceptorTerminalIdentification", false, false],
		"42": ["ans", 15, "cardAcceptorIdentificationCode", false, false],
		"43": ["ans", 40, "cardAcceptorNameAndLocation", false, false],
		"44": ["an", 25, "additionalResponseData", true, false],
		"45": ["an", 76, "track1data", true, false],
		"46": ["an", 999, "additionalDataISO", true, false],
		"47": ["an", 999, "additionalDataNational", true, false],
		"48": ["an", 999, "additionalDataPrivate", true, false],
		"49": ["an", 3, "currencyCode", false, false],
		"50": ["an", 3, "currencyCodeSettlement", false, false],
		"51": ["an", 3, "currencyCodeCardholderBilling", false, false],
		"52": ["b", 64, "personalIdentificationNumber", false, false],
		"53": ["n", 16, "securityRelatedControlInformation", false, false],
		"54": ["an", 120, "additionalAmounts", true, false],
		"55": ["ans", 999, "reservedISO", true, false],
		"56": ["ans", 999, "reservedISO", true, false],
		"57": ["ans", 999, "reservedNational", true, false],
		"58": ["ans", 999, "reservedNational", true, false],
		"59": ["ans", 999, "reservedForNationalUse", true, false],
		"60": ["an", 7, "advice/reasonCode (privateReserved)", true, false],
		"61": ["ans", 999, "reservedPrivate", true, false],
		"62": ["ans", 999, "reservedPrivate", true, false],
		"63": ["ans", 999, "reservedPrivate", true, false],
		"64": ["b", 16, "messageAuthenticationCode (MAC)", false, false],
		"65": ["b", 64, "bitMap, tertiary", false, false],
		"66": ["n", 1, "settlementCode", false, false],
		"67": ["n", 2, "extendedPaymentCode", false, false],
		"68": ["n", 3, "receivingInstitutionCountryCode", false, false],
		"69": ["n", 3, "settlementInstitutionCountyCode", false, false],
		"70": ["n", 3, "networkManagementInformationCode", false, false],
		"71": ["n", 4, "messageNumber", false, false],
		"72": ["ans", 999, "dataRecord (ISO 8583:1993)/n 4 messageNumber, last(?)", true, false],
		"73": ["n", 6, "date, action", false, false],
		"74": ["n", 10, "credits, number", false, false],
		"75": ["n", 10, "credits, reversalNumber", false, false],
		"76": ["n", 10, "debits, number", false, false],
		"77": ["n", 10, "debits, reversalNumber", false, false],
		"78": ["n", 10, "transfer number", false, false],
		"79": ["n", 10, "transfer, reversalNumber", false, false],
		"80": ["n", 10, "inquiriesNumber", false, false],
		"81": ["n", 10, "authorizations, number", false, false],
		"82": ["n", 12, "credits, processingFeeAmount", false, false],
		"83": ["n", 12, "credits, transactionFeeAmount", false, false],
		"84": ["n", 12, "debits, processingFeeAmount", false, false],
		"85": ["n", 12, "debits, transactionFeeAmount", false, false],
		"86": ["n", 15, "credits, amount", false, false],
		"87": ["n", 15, "credits, reversalAmount", false, false],
		"88": ["n", 15, "debits, amount", false, false],
		"89": ["n", 15, "debits, reversalAmount", false, false],
		"90": ["n", 42, "originalDataElements", false, false],
		"91": ["n", 1, "fileUpdateCode", false, false],
		"92": ["n", 2, "fileSecurityCode", false, false],
		"93": ["n", 5, "responseIndicator", false, false],
		"94": ["an", 7, "serviceIndicator", false, false],
		"95": ["an", 42, "replacementAmounts", false, false],
		"96": ["an", 8, "messageSecurityCode", false, false],
		"97": ["n", 16, "amount, netSettlement", false, true],
		"98": ["ans", 25, "payee", false, false],
		"99": ["n", 11, "settlementInstitutionIdentificationCode", true, false],
		"100": ["n", 11, "receivingInstitutionIdentificationCode", true, false],
		"101": ["ans", 17, "fileName", false, false],
		"102": ["ans", 28, "accountIdentification1", true, false],
		"103": ["ans", 28, "accountIdentification2", true, false],
		"104": ["ans", 100, "transactionDescription", true, false],
		"105": ["ans", 999, "reservedForISOUse", true, false],
		"106": ["ans", 999, "reservedForISOUse", true, false],
		"107": ["ans", 999, "reservedForISOUse", true, false],
		"108": ["ans", 999, "reservedForISOUse", true, false],
		"109": ["ans", 999, "reservedForISOUse", true, false],
		"110": ["ans", 999, "reservedForISOUse", true, false],
		"111": ["ans", 999, "reservedForISOUse", true, false],
		"112": ["ans", 999, "reservedFornationalUse", true, false],
		"113": ["n", 11, "authorizingAgentInstitutionIdCode", true, false],
		"114": ["ans", 999, "reservedForNationalUse", true, false],
		"115": ["ans", 999, "reservedForNationalUse", true, false],
		"116": ["ans", 999, "reservedForNationalUse", true, false],
		"117": ["ans", 999, "reservedForNationalUse", true, false],
		"118": ["ans", 999, "reservedForNationalUse", true, false],
		"119": ["ans", 999, "reservedForNationalUse", true, false],
		"120": ["ans", 999, "reservedForNationalUse", true, false],
		"121": ["ans", 999, "reservedForNationalUse", true, false],
		"122": ["ans", 999, "reservedForNationalUse", true, false],
		"123": ["ans", 999, "reservedForNationalUse", true, false],
		"124": ["ans", 255, "infoText", true, false],
		"125": ["ans", 50, "networkManagementInformation", true, false],
		"126": ["ans", 6, "issuerTraceId", true, false],
		"127": ["ans", 999, "reservedForPrivateUse", true, false],
		"128": ["b", 16, "messageAuthenticationCode", false, false]
	};

	this.version = '';
	this.versionID = '';
	this.messageClass = '';
	this.messageClassID = '';
	this.messageFunction = '';
	this.messageFunctionID = '';
	this.messageOrigin = '';
	this.messageOriginID = '';
	this.mti = '';
	this.versionArray = { 0: '1987', 1: '1993', 2: '2003', 9: 'Private usage' };
	this.messageClassArray = { 1: 'Authorization message', 2: 'Financial message', 3: 'File actions message', 4: 'Reversal message', 5: 'Reconciliation message', 6: 'Administrative message', 7: 'Fee collection message', 8: 'Network management message', 9: 'Reserved by ISO' };
	this.messageFunctionArray = { 0: 'Request', 1: 'Request response', 2: 'Advice', 3: 'Advice response', 4: 'Notification', 8: 'Response acknowledgement', 9: 'Negative acknowledgement' };
	this.messageOriginArray = { 0: 'Acquirer', 1: 'Acquirer repeat', 2: 'Issuer', 3: 'Issuer repeat', 4: 'Other', 5: 'Other repeat' };
	this.messageLength = 0;
	this.message = '';
	this.bitmap = '';
	this.bitmap1 = '';
	this.bitmap2 = '';
	this.bitmap3 = '';
	this.dataElement = '';
	this.dataElementOffset = 20;
	this.fiedsUsed = [];
	this.additionLength = 0;

	this.int2bin = function (integer) {
		var i, j = integer, k, l, str = '';;
		for (i = 0; i < 8; i++) {
			k = Math.pow(2, 8 - i - 1);
			l = (Math.floor(j / k)) % 2;
			str += l.toString();
		}
		return str;
	};

	this.hex2bin = function (hexadecimal) {
		var bytes = [], dec = 0, str = '';
		for (var i = 0; i < hexadecimal.length - 1; i += 2) {
			dec = parseInt(hexadecimal.substr(i, 2), 16);
			str += this.int2bin(dec);
			bytes.push(dec);
		}
		return str;
	};
	this.parseBitmap = function () {
		var bitmap = this.bitmap;
		var str = this.hex2bin(bitmap);
		var i, j, fields = [];
		for (i = 0; i < str.length; i++) {
			if (str[i] == '1') {
				j = i + 1;
				if (j != 1 && j != 65) {
					fields.push(j);
				}
			}
		}
		this.fiedsUsed = fields;
	};
	this.clearData = function (fieldValue, fieldType) {
		switch (fieldType) {
			case 'n':
				if (fieldValue.length) {
					fieldValue = parseInt(fieldValue);
				}
				break;
		}
		return fieldValue;
	};
	this.parseDataElement = function () {
		var fields = this.fiedsUsed;
		var i;
		var lastOffset = this.dataElementOffset
		var fieldIndex = 0;
		var fieldType = '';
		var fieldLength = 1;
		var fieldName = '';
		var fieldValue = '';
		var buff = '';
		var fobj = [];
		var data = [];
		var isVar = false;
		for (i in fields) {
			fieldIndex = fields[i];
			fobj = this.fields[fieldIndex];
			fieldType = fobj[0];
			fieldMaxLength = fobj[1];

			if (fieldType == 'b') {
				fieldLength = parseInt(fobj[1] / 4);
			}
			else {
				fieldLength = fobj[1];
			}
			fieldName = fobj[2];

			isVar = fobj[3];
			isAdd = fobj[4];
			if (isVar) {
				// for data with variable length
				var vl = fieldLength.toString().length;
				var tl = parseInt(this.message.substr(lastOffset, vl));
				lastOffset += vl;
				fieldValue = this.message.substr(lastOffset, tl);
				lastOffset += tl;
				fieldLength = tl;
			}
			else if (isAdd) {
				var tl = fieldLength + this.additionLength;
				fieldValue = this.message.substr(lastOffset, tl);
				lastOffset += tl;
				fieldLength = tl;
			}
			else {
				fieldValue = this.message.substr(lastOffset, fieldLength);
				lastOffset += fieldLength;
			}
			data.push({ fieldIndex: fieldIndex, fieldType: fieldType, fieldMaxLength: fieldMaxLength, fieldLength: fieldLength, fieldName: fieldName, fieldValue: fieldValue });
		}
		return data;
	};

	this.init = function (message) {
		if (message) {
			this.message = message;
		}
		message = this.message;
		this.messageLength = message.length;
		this.mti = message.substr(0, 4);
		this.versionID = this.mti.substr(0, 1);
		this.version = this.versionArray[this.versionID];

		this.messageClassID = this.mti.substr(1, 1);
		this.messageClass = this.messageClassArray[this.messageClassID];

		this.messageFunctionID = this.mti.substr(2, 1);
		this.messageFunction = this.messageFunctionArray[this.messageFunctionID];

		this.messageOriginID = this.mti.substr(3, 1);
		this.messageOrigin = this.messageOriginArray[this.messageOriginID];


		this.bitmap1 = message.substr(4, 16);
		var bitmap1bin = this.hex2bin(this.bitmap1.substr(0, 2));
		this.bitmap = this.bitmap1;
		if (bitmap1bin[0] == '1') {
			this.bitmap2 = message.substr(20, 16);
			var bitmap2bin = this.hex2bin(this.bitmap2.substr(0, 2));
			this.bitmap += this.bitmap2;
			if (bitmap2bin[0] == '1') {
				this.bitmap3 = message.substr(36, 16);
				var bitmap2bin = this.hex2bin(this.bitmap2.substr(0, 2));
				this.bitmap += this.bitmap3;
				this.dataElementOffset = 52;
			}
			else {
				this.dataElementOffset = 36;
			}

		}
		else {
			this.dataElementOffset = 20;
		}

		// parse bitmap
		this.parseBitmap();
		this.dataElement = message.substr(this.dataElementOffset);
		this.dataElementLength = message.length - this.dataElementOffset;

	};
	if (additionLength) {
		this.additionLength = additionLength;
	}
	if (message) {
		this.message = message;
		this.init();
	}
}

module.exports = ISO8583;