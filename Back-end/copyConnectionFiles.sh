# cp ../../HLF-Cards/hlf-cards/organizations/peerOrganizations/AAD.hlfcards.com/connection-AAD.json connection-AAD.json
# cp ../../HLF-Cards/hlf-cards/organizations/peerOrganizations/AOD.hlfcards.com/connection-AOD.json connection-AOD.json
# cp ../../HLF-Cards/hlf-cards/organizations/peerOrganizations/ACD.hlfcards.com/connection-ACD.json connection-ACD.json
# cp ../../HLF-Cards/hlf-cards/organizations/peerOrganizations/merchantOrg1.hlfcards.com/connection-org1.json connection-org1.json
# cp ../../HLF-Cards/hlf-cards/organizations/peerOrganizations/merchantOrg2.hlfcards.com/connection-org2.json connection-org2.json
# cp ../../HLF-Cards/hlf-cards/organizations/peerOrganizations/PSP.hlfcards.com/connection-PSP.json connection-PSP.json

node ./enrollAdminAAD.js
node ./enrollAdminAOD.js
node ./enrollAdminACD.js
node ./enrollAdminPSP.js
node ./enrollAdminOrg1.js
node ./enrollAdminOrg2.js

node ./registerUserAAD.js
node ./registerUserAOD.js
node ./registerUserACD.js
node ./registerUserPSP.js
node ./registerUserOrg1.js
node ./registerUserOrg2.js