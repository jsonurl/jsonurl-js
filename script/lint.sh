#!/bin/sh

NODE_MAJOR=`node --version 2>&1 | sed -n 's/^v\([0-9][0-9]*\).*/\1/p'`

if test -z "$NODE_MAJOR" ; then
    echo "Unknown nodejs version"
    exit 1
fi

echo "NODE: $NODE_MAJOR"

if test "$NODE_MAJOR" -lt 12 ; then
    echo "eslint >=8.x requires nodejs >= 12.x; skipping lint"
    exit 0
fi

exec env DEBUG=eslint:cli-engine npx eslint .

