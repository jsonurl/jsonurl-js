#!/bin/sh

PACKAGE_VERSION=`sed -ne 's/^version=//p' snapshot.properties`
PACKAGE_JSON=package.json

sed -i.bak "s/^\(\s*\"version\":\s*\"\)1.0.0-SNAPSHOT\"/\1$PACKAGE_VERSION\"/" "$PACKAGE_JSON"

sed -n '/version/p' "$PACKAGE_JSON"

