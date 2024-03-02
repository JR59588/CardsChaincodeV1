const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const parseJSONFile = (path) => {
    const fileContent = fs.readFileSync(path);
    const jsonObj = JSON.parse(fileContent);
    return jsonObj;
}


const saveToJSONFile = (path, jsonObj) => {
    const data = JSON.stringify(jsonObj);
    fs.writeFileSync(path, data);
}

// utility function to verify settlement request object
const evaluateTransaction = async (orgName, channelName, contractName, functionName, args, endorsers) => {

    try {
        console.log("args is: ", args);
        const data = parseJSONFile(path.join(__dirname, "data.json"));
        if (!data[orgName]) {
            return { error: `Organization ${orgName} not found!`, result: null };
        }

        const { connectionPath, walletOrg, userWallet } = data[orgName];

        console.log(connectionPath, walletOrg, userWallet);
        let ccp = parseJSONFile(path.join(__dirname, "..", "..", connectionPath));
        const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, "..", "..", walletOrg));

        const identity = await wallet.get(userWallet);

        if (!identity) {
            console.log("An identity for the user " + userWallet + " does not exist in the wallet");
            return { error: `An identity for the organization ${orgName} doesn't exist in the wallet!`, result: null }
        }

        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: userWallet,
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(contractName);

        const result = await contract.submitTransaction(
            functionName,
            ...args
        );

        console.log(`${functionName} transaction has been submitted on ${contractName} by the organization: ${orgName} `, result);

        await gateway.disconnect();

        return { error: null, result: result };
    } catch (error) {
        console.log("Error during verification transaction: ", error)
        return { error: error, result: null };
    }

}


const evaluateTransactionWithEndorsingOrganizations = async (orgName, channelName, contractName, functionName, args, endorsers) => {

    try {
        console.log("args is: ", args);
        const data = parseJSONFile(path.join(__dirname, "data.json"));
        if (!data[orgName]) {
            return { error: `Organization ${orgName} not found!`, result: null };
        }

        const { connectionPath, walletOrg, userWallet, clientMSPId } = data[orgName];

        console.log(connectionPath, walletOrg, userWallet);
        let ccp = parseJSONFile(path.join(__dirname, "..", "..", connectionPath));
        const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, "..", "..", walletOrg));

        const identity = await wallet.get(userWallet);

        if (!identity) {
            console.log("An identity for the user " + userWallet + " does not exist in the wallet");
            return { error: `An identity for the organization ${orgName} doesn't exist in the wallet!`, result: null }
        }

        const gateway = new Gateway();

        await gateway.connect(ccp, {
            wallet,
            identity: userWallet,
            discovery: { enabled: true, asLocalhost: true },
        });

        const network = await gateway.getNetwork(channelName);

        const channel = network.getChannel();

        const contract = network.getContract(contractName);

        const transaction = contract.createTransaction(functionName);


        if (endorsers.length > 0) {
            let endorserObjs = [];

            for (let i = 0; i < endorsers.length; i++) {
                const endorser = endorsers[i];
                console.log("Endorser is: ", endorser);
                const endorserObjsTemp = await channel.getEndorsers(endorser);
                console.log("Endorser objs temp are: ", endorserObjsTemp);
                endorserObjs = [...endorserObjs, ...endorserObjsTemp];
            }

            // channel.getEndorsers(endorsers);
            console.log("endorsers are", endorsers, "endorserObjs are: ", endorserObjs);
            transaction.setEndorsingPeers(endorserObjs);
        }

        const result = await transaction.submit(
            ...args
        );

        console.log(`${functionName} transaction has been submitted on ${contractName} by the organization: ${orgName} `, result);

        await gateway.disconnect();

        return { error: null, result: result };
    } catch (error) {
        console.log("Error during verification transaction: ", error)
        return { error: error, result: null };
    }

}

const queryByKey = async (Key) => {

}


module.exports = { parseJSONFile, saveToJSONFile, evaluateTransaction, evaluateTransactionWithEndorsingOrganizations };