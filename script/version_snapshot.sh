#!/bin/sh

PACKAGE_VERSION=`sed -ne 's/^version=//p' snapshot.properties`
sed -i.bak "s/^\(\s*\"version\":\s*\"\)1.0.0\"/\1$PACKAGE_VERSION\"/" package.json

