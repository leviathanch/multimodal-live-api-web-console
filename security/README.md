Certificates
============

In order to have working audio worklets in Chromium, the connection needs SSL

Generate the keys in here and then start the Docker container:

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -config req.cnf

After that you can obtain the certificate which you then can import into Chromium, with:

openssl pkcs12 -export -in cert.pem -inkey key.pem -out pkcs12.pfx

Make sure to trust yourself as authority in the Authority tab in

chrome://settings/certificates
