FROM docker.io/hyperledger/fabric-ca:latest

RUN mkdir /ca
COPY fabric-ca-server-config.yaml /ca
COPY tls /ca/tls
COPY ca /ca/ca
