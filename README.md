# Parcel TMB
 Calculate Tumour Mutation Burden on Parcel.

[Yao et al's](https://www.nature.com/articles/s41598-020-61575-1) proposes a
method for calculating Tumour Mutation Burden. They released the
[ecTMB](https://github.com/bioinform/ecTMB) code into the
[Bioinformatics Repo](https://github.com/bioinform).

This package launches the ecTMB calculator on the Parcel Network.

## Usage

There are 4 steps to running ecTMB on Parcel.

1. Download the test data locally<sup>\*</sup>
1. Upload the test data to Parcel<sup>\*</sup>
1. Launch a compute job on Parcel
1. Download the result

> **\*** Oasis are still working to support input files larger than 10GB. As
> a work around a docker image with no dependencies is used and file upload
> and inputs can be ignored.

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

> This section can be ignored if the no-dependencies Docker image is used.

Follow the instructions
[here](https://github.com/humanai-repo/parcel-demo/tree/main/upload-shakespeare-summary)
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

Three job types are supported for bench marking: "helloworld", "test" and
"train". The job types is specified with the "-t" command line argument.

Launch
```bash
npm run start  -- -o working-data/output.txt -t helloworld
```

### Download the outputs

```bash
./scripts/downloadoutput.sh ~/dev/parcel-demo/data-utils/ ~/dev/parcel-tmb/working-data/
```