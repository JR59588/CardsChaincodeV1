'use strict';

process.env.HFC_LOGGING = '{"debug": "./debug.log"}';

const { Gateway, Wallets } = require('fabric-network');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCP, buildWallet } = require('./AppUtil.js');
const server = require('../../server.js');
const socketIo = require('socket.io');
const io = socketIo(server, {
	cors: {
		origin: "http://localhost:3000",
	}
});

const channelName = 'channel1';

const org1MSP = 'Org1MSP';
const Org1UserId = 'appOrg1User8';

const orgPSPMSP = 'PSPMSP';
const OrgPSPUserId = 'appOrgPSPUser8';

const orgACDMSP = 'ACDMSP';
const OrgACDUserId = 'appOrgACDUser8';

const orgAADMSP = 'AADMSP';
const OrgAADUserId = 'appOrgAADUser8';

const orgAODMSP = 'AODMSP';
const OrgAODUserId = 'appOrgAODUser8';

const RED = '\x1b[31m\n';
const GREEN = '\x1b[32m\n';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function initGatewayForOrg(useCommitEvents, pathStr, caHostName, walletPathOrg, orgMSPId, userId, affiliation) {
	console.log(`${GREEN}--> Fabric client user & Gateway init: Using Org1 identity to Org1 Peer${RESET}`);

	const ccpOrg = buildCCP(pathStr);
	const caOrgClient = buildCAClient(FabricCAServices, ccpOrg, caHostName);


	const walletOrg = await buildWallet(Wallets, walletPathOrg);

	await enrollAdmin(caOrgClient, walletOrg, orgMSPId);
	await registerAndEnrollUser(caOrgClient, walletOrg, orgMSPId, userId, affiliation);

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg.connect(ccpOrg, {
				wallet: walletOrg,
				identity: userId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg.connect(ccpOrg, {
				wallet: walletOrg,
				identity: userId,
				discovery: { enabled: true, asLocalhost: true },
				eventHandlerOptions: EventStrategies.NONE
			});
		}
		return gatewayOrg;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}



io.on('connection', async (socket) => {
	console.log('Client connected');
	console.log(`${BLUE} **** START ****${RESET}`);
	try {
		const gateway1Org1 = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-org1.json'), 'ca_org1', path.join(__dirname, 'wallet', 'org1'), org1MSP, Org1UserId, 'org1.department1');
		const gateway1OrgPSP = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-PSP.json'), 'ca_PSP', path.join(__dirname, 'wallet', 'orgPSP'), orgPSPMSP, OrgPSPUserId, 'orgPSP.department1');
		const gateway1OrgACD = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-ACD.json'), 'ca_ACD', path.join(__dirname, 'wallet', 'orgACD'), orgACDMSP, OrgACDUserId, 'orgACD.department1');
		const gateway1OrgAAD = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-AAD.json'), 'ca_AAD', path.join(__dirname, 'wallet', 'orgAAD'), orgAADMSP, OrgAADUserId, 'orgAAD.department1');
		const gateway1OrgAOD = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-AOD.json'), 'ca_AOD', path.join(__dirname, 'wallet', 'orgAOD'), orgAODMSP, OrgAODUserId, 'orgAOD.department1');
		try {
			console.log(`${BLUE} **** CHAINCODE EVENTS ****${RESET}`);
			let transaction;
			const network1Org1 = await gateway1Org1.getNetwork(channelName);
			const network1OrgPSP = await gateway1OrgPSP.getNetwork(channelName);
			const network1OrgACD = await gateway1OrgACD.getNetwork(channelName);
			const network1OrgAAD = await gateway1OrgAAD.getNetwork(channelName);
			const network1OrgAOD = await gateway1OrgAOD.getNetwork(channelName);
			const contractPYMTUTILSCCOrg1 = network1Org1.getContract("PYMTUtilsCC");
			const contractSubmitSettlementTxCCOrgPSP = network1OrgPSP.getContract("SubmitSettlementTxCC");
			const contractSubmitSettlementTxCCOrgACD = network1OrgACD.getContract("SubmitSettlementTxCC");
			const contractAuthorizeSettlementTxCCOrgACD = network1OrgACD.getContract("AuthorizeSettlementTxCC");
			const contractAuthorizeSettlementTxCCOrgAAD = network1OrgAAD.getContract("AuthorizeSettlementTxCC");
			const contractBalanceSettlementTxCCOrgAAD = network1OrgAAD.getContract("BalanceSettlementTxCC");
			const contractBalanceSettlementTxCCOrgAOD = network1OrgAOD.getContract("BalanceSettlementTxCC");
			const contractClearSettlementTxCCOrgAOD = network1OrgAOD.getContract("ClearSettlementTxCC");
			const contractClearSettlementTxCCOrgAAD = network1OrgAAD.getContract("ClearSettlementTxCC");

			try {
				// let listenerOrg1 = async (event) => {
				// 	const stateObj = JSON.parse(event.payload.toString());
				// 	console.log(`${stateObj.channelName}, ${stateObj.key}`);
				// 	console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${stateObj} - ${JSON.stringify(stateObj)}${RESET}`);
				// 	console.log(`*** Event: ${event.eventName}`);
				// 	try {
				// 		if (event.eventName == 'EMT-RT') {
				// 			console.log(`${GREEN}--> Submit SubmitSettlementTxCC Transaction submitSettlementTx, ${stateObj.key}`);
				// 			transaction = contractSubmitSettlementTxCCOrgPSP.createTransaction('submitSettlementTx');
				// 			const splitKey = [...stateObj.key.split("-")];
				// 			socket.emit('status-change', { status: 'requested', data: splitKey });
				// 			console.log("Emitted status-change for requested - ", splitKey);
				// 			await transaction.submit(...splitKey);
				// 			console.log(`${GREEN}<-- Submit SubmitSettlementTxCC submitSettlementTx Result: committed, for ${stateObj.key}${RESET}`);
				// 		}
				// 	} catch (error) {
				// 		console.log(`${RED}<-- Submit Failed: SubmitSettlementTxCC verifyAndChangeStatus - ${createError}${RESET}`);
				// 	}
				// };
				// // now start the client side event service and register the listener
				// console.log(`${GREEN}--> Start contract event stream to peer in Org1${RESET}`);
				// await contractPYMTUTILSCCOrg1.addContractListener(listenerOrg1);




				let listenerOrgACD = async (event) => {
					const stateObj = JSON.parse(event.payload.toString());
					console.log(`${stateObj.channelName}, ${stateObj.key}`);
					console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${stateObj} - ${JSON.stringify(stateObj)}${RESET}`);
					console.log(`*** Event: ${event.eventName}`);
					try {
						if (event.eventName == 'EACD-ST') {
							console.log(`${GREEN}--> Submit AuthorizeSettlementTxCC Transaction authorizeSettlementTx, ${stateObj.key}`);
							transaction = contractAuthorizeSettlementTxCCOrgACD.createTransaction('authorizeSettlementTx');
							const splitKey = [...stateObj.key.split("-")];
							socket.emit('status-change', { status: 'TxSubmitted', data: splitKey });
							console.log("Emitted status-change for TxSubmitted - ", { status: 'TxSubmitted', data: splitKey });
							await transaction.submit(...splitKey);
							console.log(`${GREEN}<-- Authorize AuthorizeSettlementTxCC authorizeSettlementTx Result: committed, for ${stateObj.key}${RESET}`);
						}
					} catch (error) {
						console.log(`${RED}<-- Authorize Failed: AuthorizeSettlementTxCC verifyAndChangeStatus - ${createError}${RESET}`);
					}
				};
				// now start the client side event service and register the listener
				console.log(`${GREEN}--> Start contract event stream to peer in ACD${RESET}`);
				await contractSubmitSettlementTxCCOrgACD.addContractListener(listenerOrgACD);


				let listenerOrgAAD = async (event) => {
					const stateObj = JSON.parse(event.payload.toString());
					console.log(`${stateObj.channelName}, ${stateObj.key}`);
					console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${stateObj} - ${JSON.stringify(stateObj)}${RESET}`);
					console.log(`*** Event: ${event.eventName}`);
					try {
						if (event.eventName == 'EAADAOD-AT') {
							console.log(`${GREEN}--> Submit BalanceSettlementTxCC Transaction balanceSettlementTx, ${stateObj.key}`);
							transaction = contractBalanceSettlementTxCCOrgAAD.createTransaction('balanceSettlementTx');
							const splitKey = [...stateObj.key.split("-")];
							socket.emit('status-change', { status: 'TxAuthorized', data: splitKey });
							console.log("Emitted status-change for TxAuthorized - ", { status: 'TxAuthorized', data: splitKey });
							await transaction.submit(...splitKey);
							console.log(`${GREEN}<-- Submit BalanceSettlementTxCC balanceSettlementTx Result: committed, for ${stateObj.key}${RESET}`);
						}
					} catch (error) {
						console.log(`${RED}<-- Balance Failed: BalanceSettlementTxCC verifyAndChangeStatus - ${createError}${RESET}`);
					}
				};

				console.log(`${GREEN}--> Start contract event stream to peer in AAD${RESET}`);
				await contractAuthorizeSettlementTxCCOrgAAD.addContractListener(listenerOrgAAD);

				let listenerOrgAOD = async (event) => {
					const stateObj = JSON.parse(event.payload.toString());
					console.log(`${stateObj.channelName}, ${stateObj.key}`);
					console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${stateObj} - ${JSON.stringify(stateObj)}${RESET}`);
					console.log(`*** Event: ${event.eventName}`);
					try {
						if (event.eventName == 'EAODACD-BT') {
							console.log(`${GREEN}--> Submit ClearSettlementTxCC Transaction clearSettlementTx, ${stateObj.key}`);
							transaction = contractClearSettlementTxCCOrgAOD.createTransaction('clearSettlementTx');
							const splitKey = [...stateObj.key.split("-")];

							socket.emit('status-change', { status: 'TxBalanced', data: splitKey });
							console.log("Emitted status-change for TxBalanced - ", { status: 'TxBalanced', data: splitKey });
							await transaction.submit(...splitKey);
							console.log(`${GREEN}<-- Submit ClearSettlementTxCC clearSettlementTx Result: committed, for ${stateObj.key}${RESET}`);
						}
					} catch (error) {
						console.log(`${RED}<-- Submit Failed: ClearSettlementTxCC verifyAndChangeStatus - ${createError}${RESET}`);
					}
				};

				console.log(`${GREEN}--> Start contract event stream to peer in AOD${RESET}`);
				await contractBalanceSettlementTxCCOrgAOD.addContractListener(listenerOrgAOD);


				let listenerOrgAAD2 = async (event) => {
					const stateObj = JSON.parse(event.payload.toString());
					console.log(`${stateObj.channelName}, ${stateObj.key}`);
					console.log(`${GREEN}<-- Contract Event Received: ${event.eventName} - ${stateObj} - ${JSON.stringify(stateObj)}${RESET}`);
					console.log(`*** Event: ${event.eventName}`);
					try {
						if (event.eventName == 'EACDAAD-CT') {
							const splitKey = [...stateObj.key.split("-")];
							socket.emit('status-change', { status: 'TxCleared', data: splitKey });
							console.log("Emitted status-change for TxCleared - ", { status: 'TxCleared', data: splitKey });
							await transaction.submit(...splitKey);
						}
					} catch (error) {
						console.log(`${RED}<-- Clear Failed: ClearSettlementTxCC Listening to Events -${RESET}`);
					}
				};

				console.log(`${GREEN}--> Start clear contract event stream to peer in AAD${RESET}`);
				await contractClearSettlementTxCCOrgAAD.addContractListener(listenerOrgAAD2);
			} catch (eventError) {
				console.log(`${RED}<-- Failed: Setup contract events - ${eventError}${RESET}`);
			}
		} catch (runError) {
			console.error(`Error in transaction: ${runError}`);
			if (runError.stack) {
				console.error(runError.stack);
			}
		}
	} catch (error) {
		console.error(`Error in setup: ${error}`);
		if (error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	}
});

server.listen(3001, () => {
	console.log("Server is listening on port 3001...");
});
