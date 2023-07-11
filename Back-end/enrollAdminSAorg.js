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
const connectionPath = db.SA.connectionPath;
const ccpPath = path.resolve(connectionPath);

console.log(db);

async function main() {
  try {
    //console.log("-----ccppath-----",ccpPath);
    // load the network configuration
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca_SAOrg"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
   // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db.SA.walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the db.SA.admin user.
    const identity = await wallet.get(db.SA.admin);
    if (identity) {
      console.log(
        `An identity for the admin user ${db.SA.admin} already exists in the wallet`
      );
      return;
    }

    // Enroll the db.SA.admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: db.SA.admin,
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: db.SA.clientMSPId,
      type: "X.509",
    };
    await wallet.put(db.SA.admin, x509Identity);
    console.log(
      `Successfully enrolled admin user ${db.SA.admin} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to enroll admin user ${db.SA.admin}: ${error}`);
    process.exit(1);
  }
}

main();
