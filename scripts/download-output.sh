#!/bin/bash
# Usage: upload-inputs {abs path to data-utils} {abs path to working-dir}

pushd .
cd $1
npm run start -- -i $2/outputs.txt -p $2/
popd