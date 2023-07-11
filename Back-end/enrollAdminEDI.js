/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const fs = require("fs");
const path = require("path");
const db = require("./api/controllers/data.json");
console.log(db);
const connectionPath = db.EDI.connectionPath;
const ccpPath = path.resolve(connectionPath);

async function main() {
  try {
    //console.log("-----ccppath-----",ccpPath);
    // load the network configuration
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca_EDI"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
   // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db.EDI.walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the db.EDI.admin user.
    const identity = await wallet.get(db.EDI.admin);
    if (identity) {
      console.log(
        `An identity for the admin user ${db.EDI.admin} already exists in the wallet`
      );
      return;
    }

    // Enroll the db.EDI.admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: db.EDI.admin,
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: db.EDI.clientMSPId,
      type: "X.509",
    };
    await wallet.put(db.EDI.admin, x509Identity);
    console.log(
      `Successfully enrolled admin user ${db.EDI.admin} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to enroll admin user ${db.EDI.admin}: ${error}`);
    process.exit(1);
  }
}

main();
