#!/usr/bin/env bash

cd `dirname $0`'/..'
root=`pwd`
echo $root
echo "生成SSL证书"
openssl req -x509 -nodes -subj '/CN=*' \
    -newkey rsa:4096 -sha256 -days 365 \
    -keyout $root'/etc/ssl/default.pem' \
    -out $root'/etc/ssl/default.pem'