# IOT HLF Network
  
  The network consists of 5 org and 1 orderer. 

  The shell script network.sh is used to start the network.

  The script folder contains different scripts to start and stop the network and deploy chain code.

  The compose folder has the docker-compose file for the org1, and org2, CouchDB for oreg1 and org2, fabric-ca associated with org1 and org2, and orderer  and orderer ca.

The config folder has the configtx.yml file for the HLF transaction configuration, network profile details etc. Channel, anchor peer all are generating from this file

The organization's folder has MSP file once the network is up. 

This also has the script to  register ca admins and generate ca-certificates.
 
