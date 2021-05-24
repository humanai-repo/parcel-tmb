#!/bin/bash

cat ./working-data/upload-inputs.log | \
  grep "Created document" | \
  sed 's/ with title /,/g' | \
  sed 's/Created document //' > ./working-data/input-doc-ids.txt