#!/bin/sh

npm run build

cat > dist/_headers <<EOT;
/*.js
  Access-Control-Allow-Origin: *
EOT

