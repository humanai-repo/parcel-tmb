#!/bin/bash
# Usage: upload-inputs {abs path to upload-shakespeare-summary-dir} {abs path to working-dir}

WORKING_DIR=`pwd`
cd $1
npm run start -- -i $2/GRCh38.d1.vd1.fa -t GRCh38.d1.vd1.fa | tee $2/upload-inputs.log
npm run start -- -i $2/UCEC.rda -t UCEC.rda | tee -a $2/upload-inputs.log
npm run start -- -i $2/gene.covar.txt -t gene.covar.txt | tee -a $2/upload-inputs.log
npm run start -- -i $2/TST170_DNA_targets_hg38.bed -t TST170_DNA_targets_hg38.bed | tee -a $2/upload-inputs.log
npm run start -- -i $2/exome_hg38_vep.Rdata -t exome_hg38_vep.Rdata | tee -a $2/upload-inputs.log
npm run start -- -i $2/mutation_context_96.txt -t mutation_context_96.txt | tee -a $2/upload-inputs.log
cd $WORKING_DIR