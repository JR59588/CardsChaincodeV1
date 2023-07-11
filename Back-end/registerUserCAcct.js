

"use strict";

const { Wallets } = require("fabric-network");

const FabricCAServices = require("fabric-ca-client");

const fs = require("fs");

const path = require("path");

const db = require("./api/controllers/data.json");

const connectionPath = db.CAcct.connectionPath;

const ccpPath = path.resolve(connectionPath);






async function main() {
  try {
    // load the network configuration

    console.log("-----ccppath-----", ccpPath);

    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.

    const caURL = ccp.certificateAuthorities["ca_CAcct"].url;

    const ca = new FabricCAServices(caURL);

    console.log("-----ccp-----", ccp);

    console.log("-----caURL-----", caURL);

    // Create a new file system based wallet for managing identities.

   // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db.CAcct.walletOrg);

    const wallet = await Wallets.newFileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.

    const userIdentity = await wallet.get(db.CAcct.userWallet);

    if (userIdentity) {
      console.log(
        `An identity for the user ${db.CAcct.userWallet} already exists in the wallet`
      );

      return;
    }

    // Check to see if we've already enrolled the db.CAcct.admin user.

    const adminIdentity = await wallet.get(db.CAcct.admin);

    if (!adminIdentity) {
      console.log(
        `An identity for the admin user ${db.CAcct.admin} does not exist in the wallet`
      );

      console.log("Run the enrollAdmin.js application before retrying");

      return;
    }

    // build a user object for authenticating with the CA

    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);

    const adminUser = await provider.getUserContext(adminIdentity, db.CAcct.admin);

    // Register the user, enroll the user, and import the new identity into the wallet.

    const secret = await ca.register(
      {
       

        enrollmentID: db.CAcct.userWallet,

        role: "client",
      },
      adminUser
    );

    const enrollment = await ca.enroll({
      enrollmentID: db.CAcct.userWallet,

      enrollmentSecret: secret,
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,

        privateKey: enrollment.key.toBytes(),
      },

      mspId: db.CAcct.clientMSPId,

      type: "X.509",
    };

    await wallet.put(db.CAcct.userWallet, x509Identity);

    console.log(
      `Successfully registered and enrolled db.CAcct.admin user ${db.CAcct.userWallet} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to register user ${db.CAcct.userWallet}: ${error}`);

    process.exit(1);
  }
}

main();
