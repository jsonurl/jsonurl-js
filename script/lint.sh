#!/bin/sh

NODE_MAJOR=`node --version | sed -n 's/^v\([0-9][0-9]*\).*/\1/p'`
ESLINT_MAJOR=`npx eslint --version | sed -n 's/^v\([0-9][0-9]*\).*/\1/p'`

if test -z "$NODE_MAJOR" ; then
    echo "Unknown nodejs version"
    exit 1
fi
if test -z "$ESLINT_MAJOR" ; then
    echo "Unknown eslint version"
    exit 1
fi

echo "NODE: $NODE_MAJOR"
echo "ESLINT: $ESLINT_MAJOR"

if test "$NODE_MAJOR" -lt 12 -a "$ESLINT_MAJOR" -ge 8; then
    echo "eslint >=8.x requires nodejs >= 12.x; skipping lint"
    exit 0
fi

exec env DEBUG=eslint:cli-engine npx eslint .

