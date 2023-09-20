

"use strict";

const { Wallets } = require("fabric-network");

const FabricCAServices = require("fabric-ca-client");

const fs = require("fs");

const path = require("path");


async function registerUserFunc(org) {
  const dataStr = fs.readFileSync("./api/controllers/data.json");
  const db = JSON.parse(dataStr);
  console.log("org name register: ", org);
  try {
    const connectionPath = db[org].connectionPath;

    const ccpPath = path.resolve(connectionPath);
    // load the network configuration

    console.log("-----ccppath-----", ccpPath);

    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.

    const caURL = ccp.certificateAuthorities["ca_" + org].url;

    const ca = new FabricCAServices(caURL);

    console.log("-----ccp-----", ccp);

    console.log("-----caURL-----", caURL);

    // Create a new file system based wallet for managing identities.

    // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db[org].walletOrg);

    const wallet = await Wallets.newFileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.

    const userIdentity = await wallet.get(db[org].userWallet);

    if (userIdentity) {
      console.log(
        `An identity for the user ${db[org].userWallet} already exists in the wallet`
      );

      return;
    }

    // Check to see if we've already enrolled the db[org].admin user.

    const adminIdentity = await wallet.get(db[org].admin);

    if (!adminIdentity) {
      console.log(
        `An identity for the admin user ${db[org].admin} does not exist in the wallet`
      );

      console.log("Run the enrollAdmin.js application before retrying");

      return;
    }

    // build a user object for authenticating with the CA

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);

    const adminUser = await provider.getUserContext(adminIdentity, db[org].admin);

    // Register the user, enroll the user, and import the new identity into the wallet.

    const secret = await ca.register(
      {

        enrollmentID: db[org].userWallet,

        role: "client",
      },
      adminUser
    );

    const enrollment = await ca.enroll({
      enrollmentID: db[org].userWallet,

      enrollmentSecret: secret,
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,

        privateKey: enrollment.key.toBytes(),
      },

      mspId: db[org].clientMSPId,

      type: "X.509",
    };

    await wallet.put(db[org].userWallet, x509Identity);

    console.log(
      `Successfully registered and enrolled db[org].admin user ${db[org].userWallet} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to register user ${db[org].userWallet}: ${error}`);

    process.exit(1);
  }
}

module.exports = registerUserFunc;
