#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

function createOrg4 {
	infoln "Enrolling the CA admin"
	mkdir -p ../organizations/peerOrganizations/org4.irisauth.com/

	export FABRIC_CA_CLIENT_HOME=${PWD}/../organizations/peerOrganizations/org4.irisauth.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:13054 --caname ca-org4 --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org4.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org4.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org4.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-13054-ca-org4.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/msp/config.yaml"

	infoln "Registering peer0"
  set -x
	fabric-ca-client register --caname ca-org4 --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-org4 --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-org4 --id.name org4admin --id.secret org4adminpw --id.type admin --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
	fabric-ca-client enroll -u https://peer0:peer0pw@localhost:13054 --caname ca-org4 -M "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/msp" --csr.hosts peer0.org4.irisauth.com --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:13054 --caname ca-org4 -M "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls" --enrollment.profile tls --csr.hosts peer0.org4.irisauth.com --csr.hosts localhost --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null


  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/ca.crt"
  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/signcerts/"* "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/server.crt"
  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/keystore/"* "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/server.key"

  mkdir "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/msp/tlscacerts"
  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/msp/tlscacerts/ca.crt"

  mkdir "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/tlsca"
  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/tls/tlscacerts/"* "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/tlsca/tlsca.org4.irisauth.com-cert.pem"

  mkdir "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/ca"
  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/peers/peer0.org4.irisauth.com/msp/cacerts/"* "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/ca/ca.org4.irisauth.com-cert.pem"

  infoln "Generating the user msp"
  set -x
	fabric-ca-client enroll -u https://user1:user1pw@localhost:13054 --caname ca-org4 -M "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/users/User1@org4.irisauth.com/msp" --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/users/User1@org4.irisauth.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
	fabric-ca-client enroll -u https://org4admin:org4adminpw@localhost:13054 --caname ca-org4 -M "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/users/Admin@org4.irisauth.com/msp" --tls.certfiles "${PWD}/fabric-ca/org4/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/msp/config.yaml" "${PWD}/../organizations/peerOrganizations/org4.irisauth.com/users/Admin@org4.irisauth.com/msp/config.yaml"
}
