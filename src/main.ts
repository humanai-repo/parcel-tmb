/**
 * @fileoverview Script to run tumour burden calculation on Parcel.
 */

import * as fs from 'fs';
import * as process from 'process';

import Parcel, { DocumentId, IdentityId, InputDocumentSpec, Job, JobId, JobPhase, JobSpec } from '@oasislabs/parcel';

import { parse } from 'ts-command-line-args';

// Oasis Parcel API values.
const clientId = process.env.PARCEL_CLIENT_ID ?? '';
const privateKey = JSON.parse(process.env.OASIS_API_PRIVATE_KEY ?? '{}');

interface IOArguments {
  inputAddresses?: string;
  outputAddresses?: string;
  jobType?: string;
  help?: boolean;
}

export const args = parse<IOArguments>(
  {
    inputAddresses: {
      type: String,
      alias: 'a',
      optional: true,
      description: 'Path to a csv of input addresses, one address & filename per line.',
    },
    outputAddresses: {
      type: String,
      alias: 'o',
      optional: true,
      description: 'Optional path to write a list of output addresses, one address per line.',
    },
    jobType: {
      type: String,
      alias: 't',
      optional: true,
      description: '3 types of job can be run, "helloworld", "test" or "train".',
    },
    help: {
      type: Boolean,
      optional: true,
      alias: 'h',
      description: 'Prints this usage guide.',
    },
  },
  {
    helpArg: 'help',
  }
);

// Submits the jobs to Parcel and waits for the jobs to complete.
async function submitJobSpecs(jobSpecs: JobSpec[], parcel: Parcel): Promise<DocumentId[]> {
  // Submit the jobs.
  let jobIds: JobId[] = [];
  var t0 = Math.floor(Date.now() / 1000);
  for (let jobSpec of jobSpecs) {
    console.log(jobSpec.cmd.join(" "));
    console.log(jobSpec); //OTT Printf debugging -- replace with logging inputs and outputs
    let jobId = (await parcel.submitJob(jobSpec)).id;
    console.log(`Job ${jobId} submitted.`);
    jobIds.push(jobId);
    // Add a 5 second wait between submitting jobs to (hopefully) reduce timeouts.
    await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
  }

  // Wait for the jobs to complete.
  let jobRunningOrPending: boolean;
  let jobs: Job[];
  do {
    jobRunningOrPending = false;
    await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
    jobs = [];
    console.log('Getting job statuses.');
    var tN = Math.floor(Date.now() / 1000);
    var tRunning = tN - t0;
    for (let jobId of jobIds) {
      const job = await parcel.getJob(jobId);
      if (job.status === null || job.status === undefined) {
        console.log(`${tRunning}s -- Error reading ${jobId}.`);
        jobRunningOrPending = true;
      } else {
        console.log(`${tRunning}s --Job ${jobId} status is ${JSON.stringify(job.status.phase)}.`);
        jobs.push(job);
      }
    }
    for (let job of jobs) {
      if (job.status === undefined) {
        continue;
      }
      const jobId = job.id;
      jobRunningOrPending = jobRunningOrPending || job.status.phase === JobPhase.PENDING ||
        job.status.phase === JobPhase.RUNNING;
      if (job.status.phase === JobPhase.FAILED) {
        console.log(`${tRunning}s -- Job ${jobId} failed with msg ${job.status.message}.`);
        throw Error(`${tRunning}s -- Job ${jobId} failed with msg ${job.status.message}.`);
      }
    }
  } while (jobRunningOrPending);

  // When all jobs have completed collect the output addresses.
  let outputAddresses: DocumentId[] = [];
  for (let job of jobs) {
    if (job.status !== undefined) {
      for (let outputDoc of job.status.outputDocuments) {
        outputAddresses.push(outputDoc.id);
      }
    }
  }
  return outputAddresses;
}

// Runs the tmb job on Parcel.
async function tmb(
  //inputAddresses: { [key: string]: string },
  identity: IdentityId,
  jobType: string,
  parcel: Parcel
): Promise<DocumentId[]> {
  // Remove files greater in size than 10MB for an experiment
  //const inputFileNames = ['gene.covar.txt', 'mutation_context_96.txt', 'TST170_DNA_targets_hg38.bed'];
  const outputFileName = 'tmb.pdf';

  /*
  const inputDocuments: InputDocumentSpec[] = inputFileNames.map((inputFileName: string) => {
    return {
      mountPath: inputFileName,
      id: inputAddresses[inputFileName] as DocumentId,
    };
  });
  */

  const cmd = [
    'calcTMBNoDeps', jobType,
  ];

  const jobSpec: JobSpec = {
    name: 'calc-tmb',
    image: 'humansimon/ectmb-nodeps@sha256:72b6219fa5a0095cff8d36280d7dfc64856207837c571237a5fd87d5c32281a1',
    inputDocuments: [],
    outputDocuments: [{ mountPath: outputFileName, owner: identity }],
    cmd: cmd,
  };

  return submitJobSpecs([jobSpec], parcel);
}

async function main() {
  console.log('Here we go...');

  const parcel = new Parcel({
    clientId: clientId,
    privateKey: privateKey,
  });
  const identity = (await parcel.getCurrentIdentity()).id;

  /*
  const inputAddresses: { [key: string]: string } = {};
  fs.readFileSync(args.inputAddresses || '', 'ascii')
    .split('\n')
    .filter((l: string) => l !== '')
    .map((l: string) => l.split(','))
    .forEach((l: string[]) => (inputAddresses[l[1]] = l[0]));
  */

  const jobType = args.jobType || 'test';
  const outputAddresses = await tmb(identity, jobType, parcel);

  // Write the out addresses to the output file if set.
  if (args.outputAddresses) {
    fs.writeFileSync(args.outputAddresses || '', outputAddresses.join('\n'));
  }
}

main()
  .then(() => console.log('All done!'))
  .catch(error => {
    console.log(`Error in main(): ${error.stack || JSON.stringify(error)}`);
    throw error;
  });
