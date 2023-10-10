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

const orgACDMSP = 'ACDMSP';
const OrgACDUserId = 'appOrgACDUser18';

const orgAADMSP = 'AADMSP';
const OrgAADUserId = 'appOrgAADUser18';

const orgAODMSP = 'AODMSP';
const OrgAODUserId = 'appOrgAODUser18';

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

let contractSubmitSettlementTxCCOrgACD,
	contractAuthorizeSettlementTxCCOrgACD,
	contractAuthorizeSettlementTxCCOrgAAD,
	contractBalanceSettlementTxCCOrgAAD,
	contractBalanceSettlementTxCCOrgAOD,
	contractClearSettlementTxCCOrgAOD,
	contractClearSettlementTxCCOrgAAD;

const initialize = async (callback) => {
	try {
		const gateway1OrgACD = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-ACD.json'), 'ca_ACD', path.join(__dirname, 'wallet', 'orgACD'), orgACDMSP, OrgACDUserId, 'orgACD.department1');
		const gateway1OrgAAD = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-AAD.json'), 'ca_AAD', path.join(__dirname, 'wallet', 'orgAAD'), orgAADMSP, OrgAADUserId, 'orgAAD.department1');
		const gateway1OrgAOD = await initGatewayForOrg(true, path.resolve(__dirname, '../../connection-AOD.json'), 'ca_AOD', path.join(__dirname, 'wallet', 'orgAOD'), orgAODMSP, OrgAODUserId, 'orgAOD.department1');

		const network1OrgACD = await gateway1OrgACD.getNetwork(channelName);
		const network1OrgAAD = await gateway1OrgAAD.getNetwork(channelName);
		const network1OrgAOD = await gateway1OrgAOD.getNetwork(channelName);


		contractSubmitSettlementTxCCOrgACD = network1OrgACD.getContract("SubmitSettlementTxCC");
		contractAuthorizeSettlementTxCCOrgACD = network1OrgACD.getContract("AuthorizeSettlementTxCC");
		contractAuthorizeSettlementTxCCOrgAAD = network1OrgAAD.getContract("AuthorizeSettlementTxCC");
		contractBalanceSettlementTxCCOrgAAD = network1OrgAAD.getContract("BalanceSettlementTxCC");
		contractBalanceSettlementTxCCOrgAOD = network1OrgAOD.getContract("BalanceSettlementTxCC");
		contractClearSettlementTxCCOrgAOD = network1OrgAOD.getContract("ClearSettlementTxCC");
		contractClearSettlementTxCCOrgAAD = network1OrgAAD.getContract("ClearSettlementTxCC");

		callback();
	} catch (error) {
		console.error(`Error in setup: ${error}`);
		if (error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

const startServer = () => {
	io.on('connection', async (socket) => {
		console.log('Client connected');
		console.log(`${BLUE} **** START ****${RESET}`);

		try {
			console.log(`${BLUE} **** CHAINCODE EVENTS ****${RESET}`);
			let transaction;




			try {

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
							socket.emit('status-change', { status: 'TxSubmitted', data: splitKey, verifications: [{ org: 'ACD', attribute: 'Processing Code' }], message: 'ACD has Verified attribute: Processing Code' });
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
							socket.emit('status-change', {
								status: 'TxAuthorized', data: splitKey,
								verifications: [{ org: 'AAD', attribute: 'Transaction Amount' },
								{ org: 'AOD', attribute: 'System Trace Audit Number' }],
								message: 'AAD has Verified attribute: Transaction Amount & AOD has verified attribute: System Trace Audit Number'
							}
							);
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

							socket.emit('status-change', {
								status: 'TxBalanced', data: splitKey,
								verifications: [{ org: 'AOD', attribute: 'Point of Service Entry Mode' },
								{ org: 'ACD', attribute: 'Merchant Category Code' }],
								message: 'AOD has Verified attribute: Point of Service Entry Mode & ACD has verified attribute: Merchant Category Code'
							});
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
							socket.emit('status-change', {
								status: 'TxCleared', data: splitKey,
								verifications: [{ org: 'AAD', attribute: 'Acquiring Institution Identification Code' },
								{ org: 'ACD', attribute: 'Retrieval Reference Number' }],
								message: 'AAD has Verified attribute: Acquiring Institution Identification Code & ACD has Verified attribute: Retrieval Reference Number'
							});
							console.log("Emitted status-change for TxCleared - ", { status: 'TxCleared', data: splitKey });
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

	});

	server.listen(3001, () => {
		console.log("Server is listening on port 3001...");
	});
}

initialize(startServer);
