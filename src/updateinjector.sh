#!/bin/sh

# After making changes to the ie-jsemulator.js, the ../injector.js
# file has to be updated to inject the new code. This compresses the
# ie-jsemulator.js file, turns it into a char array and replaces the
# old line in ../injector.js

sed -i "s/String.fromCharCode(\([0-9]\+,\s\?\)*\s\?[0-9]\+)/$(python js2chararray.py ie-jsemulator.js)/g" ../injector.js
