mkdir working-data
cd working-data
curl -L https://github.com/bioinform/ecTMB/releases/download/v0.1.0/ecTMB_data.tar.gz -o ecTMB_data.tar.gz
tar xvzf ecTMB_data.tar.gz
# Flatten the directory to make life easier
mv ecTMB_data/example/* ./
mv ecTMB_data/references/* ./
rm -rf ecTMB_data
rm ecTMB_data.tar.gz
curl -L https://api.gdc.cancer.gov/data/254f697d-310d-4d7d-a27b-27fbf767a834 -o GRCh38.d1.vd1.fa.tar.gz
tar xvzf GRCh38.d1.vd1.fa.tar.gz
rm GRCh38.d1.vd1.fa.tar.gz