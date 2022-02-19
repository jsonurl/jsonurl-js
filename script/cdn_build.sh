#!/bin/sh

JSONURL_ORG_CLONE='https://github.com/jsonurl/jsonurl.github.io.git'
SCRIPT_DIR=`dirname "$0"`
VERSION_SH="$SCRIPT_DIR/version_snapshot.sh"

git clone "$JSONURL_ORG_CLONE" dist
test -x "$VERSION_SH" && "$VERSION_SH"
npm run build
cd ./dist

sed -i -zre 's/<script\s+src="https:\/\/cdn.jsdelivr.net\/npm\/@jsonurl[^"]*"\s+integrity="[^"]*"\s+crossorigin="[^"]*">/<script src="jsonurl.js">/' index.html

sed -e 's/src="jsonurl.js"/src="jsonurl.noproto.js"/' index.html > index-noproto.html

sed -i -re 's/<a title="GitHub" href="https:\/\/github.com\/jsonurl">GitHub/<a title="No Prototype Modification" href="index-noproto.html">NoProto/' index.html



#cat > dist/_headers <<EOT;
#/*.js
#  Access-Control-Allow-Origin: *
#EOT

