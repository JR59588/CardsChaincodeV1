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
const connectionPath = db.Org2.connectionPath;
const ccpPath = path.resolve(connectionPath);

console.log(db);

async function main() {
  try {
    //console.log("-----ccppath-----",ccpPath);
    // load the network configuration
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca_org2"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
   // const walletPath = path.join(process.cwd(), "wallet");
    const walletPath = path.join(process.cwd(), db.Org2.walletOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the db.Org2.admin user.
    const identity = await wallet.get(db.Org2.admin);
    if (identity) {
      console.log(
        `An identity for the admin user ${db.Org2.admin} already exists in the wallet`
      );
      return;
    }

    // Enroll the db.Org2.admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: db.Org2.admin,
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: db.Org2.clientMSPId,
      type: "X.509",
    };
    await wallet.put(db.Org2.admin, x509Identity);
    console.log(
      `Successfully enrolled admin user ${db.Org2.admin} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to enroll admin user ${db.Org2.admin}: ${error}`);
    process.exit(1);
  }
}

main();
