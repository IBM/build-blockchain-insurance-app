FROM docker.io/hyperledger/fabric-ca:x86_64-1.0.2
RUN mkdir /ca
COPY fabric-ca-server-config.yaml /ca
COPY tls /ca/tls
COPY ca /ca/ca