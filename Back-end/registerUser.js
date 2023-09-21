

"use strict";

const { Wallets } = require("fabric-network");

const FabricCAServices = require("fabric-ca-client");

const fs = require("fs");

const path = require("path");


async function registerUserFunc(org) {
  const userDataStr = fs.readFileSync("./api/controllers/data.json");
  const dbUser = JSON.parse(userDataStr);
  console.log("org name register: ", org);
  try {
    const userConnectionPath = dbUser[org].userConnectionPath;

    const userCcpPath = path.resolve(userConnectionPath);
    // load the network configuration

    console.log("-----userCcpPath-----", userCcpPath);

    let userCcp = JSON.parse(fs.readFileSync(userCcpPath, "utf8"));

    // Create a new CA client for interacting with the CA.

    const userCaUrl = userCcp.certificateAuthorities["ca_" + org].url;

    const userCa = new FabricCAServices(userCaUrl);

    console.log("-----userCcp-----", userCcp);

    console.log("-----userCaUrl-----", userCaUrl);

    // Create a new file system based wallet for managing identities.

    // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), dbUser[org].walletOrg);

    const wallet = await Wallets.newFileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.

    const userIdentity = await wallet.get(dbUser[org].userWallet);

    if (userIdentity) {
      console.log(
        `An identity for the user ${dbUser[org].userWallet} already exists in the wallet`
      );

      return;
    }

    // Check to see if we've already enrolled the dbUser[org].admin user.

    const adminIdentity = await wallet.get(dbUser[org].admin);

    if (!adminIdentity) {
      console.log(
        `An identity for the admin user ${dbUser[org].admin} does not exist in the wallet`
      );

      console.log("Run the enrollAdmin.js application before retrying");

      return;
    }

    // build a user object for authenticating with the CA

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);

    const adminUser = await provider.getUserContext(adminIdentity, dbUser[org].admin);

    // Register the user, enroll the user, and import the new identity into the wallet.

    const secret = await userCa.register(
      {

        enrollmentID: dbUser[org].userWallet,

        role: "client",
      },
      adminUser
    );

    const enrollment = await userCa.enroll({
      enrollmentID: dbUser[org].userWallet,

      enrollmentSecret: secret,
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,

        privateKey: enrollment.key.toBytes(),
      },

      mspId: dbUser[org].clientMSPId,

      type: "X.509",
    };

    await wallet.put(dbUser[org].userWallet, x509Identity);

    console.log(
      `Successfully registered and enrolled dbUser[org].admin user ${dbUser[org].userWallet} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to register user ${dbUser[org].userWallet}: ${error}`);

    process.exit(1);
  }
}

module.exports = registerUserFunc;
