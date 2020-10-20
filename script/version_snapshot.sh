#!/bin/sh

PACKAGE_VERSION=`sed -ne 's/^version=//p' snapshot.properties`
PACKAGE_JSON=package.json
SONAR_PROPERTIES=sonar-project.properties

sed -i.bak "s/^\(\s*\"version\":\s*\"\)1.0.0-SNAPSHOT\"/\1$PACKAGE_VERSION\"/" "$PACKAGE_JSON"
sed -i.bak "s/^\(\s*sonar.projectVersion\s*=\s*\)1.0.0-SNAPSHOT/\1$PACKAGE_VERSION/" "$SONAR_PROPERTIES"


sed -n '/version/p' "$PACKAGE_JSON"
sed -n '/sonar.projectVersion/p' "$SONAR_PROPERTIES"

