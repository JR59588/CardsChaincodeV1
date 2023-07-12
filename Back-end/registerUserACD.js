

"use strict";

const { Wallets } = require("fabric-network");

const FabricCAServices = require("fabric-ca-client");

const fs = require("fs");

const path = require("path");

const db = require("./api/controllers/data.json");

const connectionPath = db.ACD.connectionPath;

const ccpPath = path.resolve(connectionPath);






async function main() {
  try {
    // load the network configuration

    console.log("-----ccppath-----", ccpPath);

    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.

    const caURL = ccp.certificateAuthorities["ca_ACD"].url;

    const ca = new FabricCAServices(caURL);

    console.log("-----ccp-----", ccp);

    console.log("-----caURL-----", caURL);

    // Create a new file system based wallet for managing identities.

   // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db.ACD.walletOrg);

    const wallet = await Wallets.newFileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.

    const userIdentity = await wallet.get(db.ACD.userWallet);

    if (userIdentity) {
      console.log(
        `An identity for the user ${db.ACD.userWallet} already exists in the wallet`
      );

      return;
    }

    // Check to see if we've already enrolled the db.ACD.admin user.

    const adminIdentity = await wallet.get(db.ACD.admin);

    if (!adminIdentity) {
      console.log(
        `An identity for the admin user ${db.ACD.admin} does not exist in the wallet`
      );

      console.log("Run the enrollAdmin.js application before retrying");

      return;
    }

    // build a user object for authenticating with the CA

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);

    const adminUser = await provider.getUserContext(adminIdentity, db.ACD.admin);

    // Register the user, enroll the user, and import the new identity into the wallet.

    const secret = await ca.register(
      {
       
        enrollmentID: db.ACD.userWallet,

        role: "client",
      },
      adminUser
    );

    const enrollment = await ca.enroll({
      enrollmentID: db.ACD.userWallet,

      enrollmentSecret: secret,
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,

        privateKey: enrollment.key.toBytes(),
      },

      mspId: db.ACD.clientMSPId,

      type: "X.509",
    };

    await wallet.put(db.ACD.userWallet, x509Identity);

    console.log(
      `Successfully registered and enrolled db.ACD.admin user ${db.ACD.userWallet} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to register user ${db.ACD.userWallet}: ${error}`);

    process.exit(1);
  }
}

main();
