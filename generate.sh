openssl genrsa > src/certs/id_rsa_priv.pem
openssl rsa -in src/certs/id_rsa_priv.pem -pubout -out src/certs/id_rsa_pub.pem