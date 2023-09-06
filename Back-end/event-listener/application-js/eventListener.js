'use strict';

process.env.HFC_LOGGING = '{"debug": "./debug.log"}';

const { Gateway, Wallets } = require('fabric-network');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildCCPOrg1, buildCCPPSP, buildWallet, buildCCPACD, buildCCPAAD, buildCCPAOD } = require('./AppUtil.js');
const server = require('../../server.js');
const socketIo = require('socket.io');
const io = socketIo(server, {
	cors: {
		origin: "http://localhost:3000",
	}
});

const channelName = 'channel1';

const org1 = 'Org1MSP';
const Org1UserId = 'appOrg1User5';

const orgPSP = 'PSPMSP';
const OrgPSPUserId = 'appOrgPSPUser5';

const orgACD = 'ACDMSP';
const OrgACDUserId = 'appOrgACDUser5';

const orgAAD = 'AADMSP';
const OrgAADUserId = 'appOrgAADUser5';

const orgAOD = 'AODMSP';
const OrgAODUserId = 'appOrgAODUser5';

const RED = '\x1b[31m\n';
const GREEN = '\x1b[32m\n';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function initGatewayForOrg1(useCommitEvents) {
	console.log(`${GREEN}--> Fabric client user & Gateway init: Using Org1 identity to Org1 Peer${RESET}`);
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpOrg1 = buildCCPOrg1();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca_org1');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathOrg1 = path.join(__dirname, 'wallet', 'org1');
	const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caOrg1Client, walletOrg1, org1);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caOrg1Client, walletOrg1, org1, Org1UserId, 'org1.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg1 = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg1.connect(ccpOrg1, {
				wallet: walletOrg1,
				identity: Org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg1.connect(ccpOrg1, {
				wallet: walletOrg1,
				identity: Org1UserId,
				discovery: { enabled: true, asLocalhost: true },
				eventHandlerOptions: EventStrategies.NONE
			});
		}


		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}

async function initGatewayForOrgPSP(useCommitEvents) {
	console.log(`${GREEN}--> Fabric client user & Gateway init: Using PSP identity to PSP Peer${RESET}`);
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpOrgPSP = buildCCPPSP();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caOrg1PSPClient = buildCAClient(FabricCAServices, ccpOrgPSP, 'ca_PSP');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathOrgPSP = path.join(__dirname, 'wallet', 'orgPSP');
	const walletOrgPSP = await buildWallet(Wallets, walletPathOrgPSP);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caOrg1PSPClient, walletOrgPSP, orgPSP);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caOrg1PSPClient, walletOrgPSP, orgPSP, OrgPSPUserId, 'orgPSP.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg1 = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg1.connect(ccpOrgPSP, {
				wallet: walletOrgPSP,
				identity: OrgPSPUserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg1.connect(ccpOrgPSP, {
				wallet: walletOrgPSP,
				identity: OrgPSPUserId,
				discovery: { enabled: true, asLocalhost: true },
				eventHandlerOptions: EventStrategies.NONE
			});
		}


		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}

async function initGatewayForOrgACD(useCommitEvents) {
	console.log(`${GREEN}--> Fabric client user & Gateway init: Using ACD identity to ACD Peer${RESET}`);
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpOrgACD = buildCCPACD();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caOrg1ACDClient = buildCAClient(FabricCAServices, ccpOrgACD, 'ca_ACD');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathOrgACD = path.join(__dirname, 'wallet', 'orgACD');
	const walletOrgACD = await buildWallet(Wallets, walletPathOrgACD);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caOrg1ACDClient, walletOrgACD, orgACD);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caOrg1ACDClient, walletOrgACD, orgACD, OrgACDUserId, 'orgACD.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg1 = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg1.connect(ccpOrgACD, {
				wallet: walletOrgACD,
				identity: OrgACDUserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg1.connect(ccpOrgACD, {
				wallet: walletOrgACD,
				identity: OrgACDUserId,
				discovery: { enabled: true, asLocalhost: true },
				eventHandlerOptions: EventStrategies.NONE
			});
		}


		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}

async function initGatewayForOrgAAD(useCommitEvents) {
	console.log(`${GREEN}--> Fabric client user & Gateway init: Using AAD identity to AAD Peer${RESET}`);
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpOrgAAD = buildCCPAAD();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caOrg1AADClient = buildCAClient(FabricCAServices, ccpOrgAAD, 'ca_AAD');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathOrgAAD = path.join(__dirname, 'wallet', 'orgAAD');
	const walletOrgAAD = await buildWallet(Wallets, walletPathOrgAAD);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caOrg1AADClient, walletOrgAAD, orgAAD);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caOrg1AADClient, walletOrgAAD, orgAAD, OrgAADUserId, 'orgAAD.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg1 = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg1.connect(ccpOrgAAD, {
				wallet: walletOrgAAD,
				identity: OrgAADUserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg1.connect(ccpOrgAAD, {
				wallet: walletOrgAAD,
				identity: OrgAADUserId,
				discovery: { enabled: true, asLocalhost: true },
				eventHandlerOptions: EventStrategies.NONE
			});
		}


		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}

async function initGatewayForOrgAOD(useCommitEvents) {
	console.log(`${GREEN}--> Fabric client user & Gateway init: Using AOD identity to AOD Peer${RESET}`);
	// build an in memory object with the network configuration (also known as a connection profile)
	const ccpOrgAOD = buildCCPAOD();

	// build an instance of the fabric ca services client based on
	// the information in the network configuration
	const caOrg1AODClient = buildCAClient(FabricCAServices, ccpOrgAOD, 'ca_AOD');

	// setup the wallet to cache the credentials of the application user, on the app server locally
	const walletPathOrgAOD = path.join(__dirname, 'wallet', 'orgAOD');
	const walletOrgAOD = await buildWallet(Wallets, walletPathOrgAOD);

	// in a real application this would be done on an administrative flow, and only once
	// stores admin identity in local wallet, if needed
	await enrollAdmin(caOrg1AODClient, walletOrgAOD, orgAOD);
	// register & enroll application user with CA, which is used as client identify to make chaincode calls
	// and stores app user identity in local wallet
	// In a real application this would be done only when a new user was required to be added
	// and would be part of an administrative flow
	await registerAndEnrollUser(caOrg1AODClient, walletOrgAOD, orgAOD, OrgAODUserId, 'orgAOD.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg1 = new Gateway();

		if (useCommitEvents) {
			await gatewayOrg1.connect(ccpOrgAOD, {
				wallet: walletOrgAOD,
				identity: OrgAODUserId,
				discovery: { enabled: true, asLocalhost: true }
			});
		} else {
			await gatewayOrg1.connect(ccpOrgAOD, {
				wallet: walletOrgAOD,
				identity: OrgAODUserId,
				discovery: { enabled: true, asLocalhost: true },
				eventHandlerOptions: EventStrategies.NONE
			});
		}


		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway for Org1: ${error}`);
		process.exit(1);
	}
}



io.on('connection', async (socket) => {
	console.log('Client connected');
	console.log(`${BLUE} **** START ****${RESET}`);
	try {

		const gateway1Org1 = await initGatewayForOrg1(true);
		const gateway1OrgPSP = await initGatewayForOrgPSP(true); // transaction handling uses commit events
		const gateway1OrgACD = await initGatewayForOrgACD(true); // transaction handling uses commit events
		const gateway1OrgAAD = await initGatewayForOrgAAD(true); // transaction handling uses commit events
		const gateway1OrgAOD = await initGatewayForOrgAOD(true); // transaction handling uses commit events
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
