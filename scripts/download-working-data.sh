#!/bin/bash
# Download ecTMB and genomic example data.

set -ex

# Download and unpack ecTMB data.
# Flatten the directory to make life easier.
function download_ectmb() {
  TMP_EXPORT_DIR="$(mktemp -d -t ecTMB-XXXXXXXX)"
  curl -L https://github.com/bioinform/ecTMB/releases/download/v0.1.0/ecTMB_data.tar.gz -o "${TMP_EXPORT_DIR}/ecTMB_data.tar.gz"
  tar xvzf "${TMP_EXPORT_DIR}/ecTMB_data.tar.gz" -C "${TMP_EXPORT_DIR}/"
  mv "${TMP_EXPORT_DIR}/ecTMB_data/example/*" ./
  mv "${TMP_EXPORT_DIR}/ecTMB_data/references/*" ./
  rm -fr "${TMP_EXPORT_DIR}"
}

# Download and unpack genomics data.
function download_grch38() {
  TMP_EXPORT_DIR="$(mktemp -d -t grch38-XXXXXXXX)"
  curl -L https://api.gdc.cancer.gov/data/254f697d-310d-4d7d-a27b-27fbf767a834 -o "${TMP_EXPORT_DIR}/GRCh38.d1.vd1.fa.tar.gz"
  tar xvzf "${TMP_EXPORT_DIR}/GRCh38.d1.vd1.fa.tar.gz" -C ./
  rm -fr "${TMP_EXPORT_DIR}"
}

mkdir working-data
cd working-data
download_ectmb
download_grch38
