# Parcel TMB
 Calculate Tumour Mutation Burden on Parcel.

[Yao et al's](https://www.nature.com/articles/s41598-020-61575-1) proposes a
method for calculating Tumour Mutation Burden. They released the
[ecTMB](https://github.com/bioinform/ecTMB) code into the
[Bioinformatics Repo](https://github.com/bioinform).

This package launches the ecTMB calculator on the Parcel Network.

## Usage

There are 4 steps to running ecTMB on Parcel.

1. Download the test data locally
1. Upload the test data to Parcel
1. Launch a compute job on Parcel
1. Download the result

The Tumour Mutation Burden Calculation is wrapped in a docker
container in [TMB-package](https://github.com/humanai-repo/TMB-package)
and data CRUD uses human.ai's
[Parcel Demo](https://github.com/humanai-repo/parcel-demo) package.

### Download working data

To create a working-data directory and download the data run:

```bash
./scripts/download-working-data.sh
```

### Upload the test data to Parcel

Follow the instructions
(here)[https://github.com/humanai-repo/parcel-demo/tree/main/upload-shakespeare-summary]
to build the upload package and set the PARCEL_CLIENT_ID and OASIS_API_PRIVATE_KEY
environment variables.

Upload the working data to Oasis with this script:

```bash
./scripts/upload-inputs.sh ~/dev/parcel-demo/upload-shakespeare-summary/ ~/dev/parcel-tmb/working-data/
```

The upload script will dump a log into the working-data directory. Convert this into an input for
the compute job with the following script.
```bash
./scripts/parse-upload-inputs-log.sh
```

### Launch the compute job
Build
```bash
npm i tslib
npm i ts-command-line-args
npm i @oasislabs/parcel
npm run prestart
```


Launch
```bash
npm run start  -- -a working-data/input-doc-ids.txt -o working-data/output.txt
```

### Download the outputs

```bash
./scripts/downloadoutput.sh ~/dev/parcel-demo/data-utils/ ~/dev/parcel-tmb/working-data/
```