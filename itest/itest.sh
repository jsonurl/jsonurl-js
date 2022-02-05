#!/bin/sh

#
# Node.js major version number
#
node_major=`node --version | sed -n 's/^v\([0-9][0-9]*\).*/\1/p'`

#
# run the integration test in the given directory
#
itest() {
    test_dir="$1"
    test_opt="$2"

    (cd "$test_dir" && npm uninstall @jsonurl/jsonurl ; npm install ../../)
    (cd "$test_dir" && npm ci && npm run build || exit 1) || return 1

    if test -z "$test_exp"; then
        (cd "$test_dir" && npm test || exit 1) || return 1
    else
        (cd "$test_dir" && env NODE_OPTIONS="$test_opt" npm test || exit 1) || return 1
    fi

    return 0
}

#
# print the status for the given integration test
#
itest_status() {
    test_dir=$1
    test_status=$2

    test_desc=`sed -n 's/\s*"description"\s*:\s*"\([^"]*\)".*/\1/p' "$test_dir/package.json"`

    test_msg='Success'

    if test -z "$test_status" ; then
        test_msg='Skipped'
    elif test $test_status -ne 0 ; then
        test_msg='Fail'
    fi

    echo "$test_desc: $test_msg"
}

itest_exit() {
    test_dir=$1
    test_status=$2
    test -z "$test_status" && return
    test $test_status -eq 0 && return
    echo "Error: $test_dir"
    exit 1
}

##
# MAIN
##

cd `dirname $0`

test_cjs_status=0
itest cjs || test_cjs_status=1

test_es6babel_status=0
itest es6-babel || test_es6babel_status=1

test_jsdom_status=0
itest jsdom || test_jsdom_status=1

#
# This test depends on the version of node.
#   node < 11  : no support for native ES6 modules
#   node 11-12 : experimental support for native ES6 modules
#   node 13+   : support for native ES6 modules enabled by default
#
if test "$node_major" -lt 11  ; then
    test_es6native_status=
    echo "ES6 native SKIPPED"
elif test "$node_major" -lt 13  ; then
    test_es6native_status=0
    itest es6-native "--experimental-modules" || test_es6native_status=1
else
    test_es6native_status=0
    itest es6-native || test_es6native_status=1
fi

echo
echo "+---------+"
echo "| Results |"
echo "+---------+"
itest_status cjs $test_cjs_status
itest_status es6-babel $test_es6babel_status
itest_status es6-native $test_es6native_status
itest_status jsdom $test_jsdom_status

itest_exit cjs $test_cjs_exit
itest_exit es6-babel $test_es6babel_exit
itest_exit es6-native $test_es6native_exit
itest_exit jsdom $test_jsdom_exit

exit 0

