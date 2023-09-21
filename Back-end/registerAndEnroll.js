"use strict";

const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");




async function registerAndEnrollFunc(org) {
  const dataStr = fs.readFileSync("./api/controllers/data.json");
  const db = JSON.parse(dataStr);
  console.log("org name enroll: ", org, "db is: ", db, "db[org] is: ", db[org]);
  try {
    const connectionPath = db[org].connectionPath;
    const ccpPath = path.resolve(connectionPath);
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca_" + org];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
    // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db[org].walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the db[org].admin user.
    const identity = await wallet.get(db[org].admin);
    if (identity) {
      console.log(
        `An identity for the admin user ${db[org].admin} already exists in the wallet`
      );
      return;
    }

    // Enroll the db[org].admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: db[org].admin,
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: db[org].clientMSPId,
      type: "X.509",
    };
    await wallet.put(db[org].admin, x509Identity);
    console.log(
      `Successfully enrolled admin user ${db[org].admin} and imported it into the wallet`
    );



    
  } catch (error) {
    console.error(`Failed to enroll admin user for ${org} ${db[org].admin}: ${error}`);
    process.exit(1);
  }

  const userDataStr = fs.readFileSync("./api/controllers/data.json");
  const dbUser = JSON.parse(userDataStr);
  console.log("org name register: ", org);
  try {
    const userConnectionPath = dbUser[org].connectionPath;

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

module.exports = registerAndEnrollFunc;
