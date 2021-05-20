var _a, _b;
import Parcel, { JobPhase } from '@oasislabs/parcel';
import { parse } from 'ts-command-line-args';
import * as fs from 'fs';
import * as process from 'process';
const clientId = (_a = process.env.PARCEL_CLIENT_ID) !== null && _a !== void 0 ? _a : '';
const privateKey = JSON.parse((_b = process.env.OASIS_API_PRIVATE_KEY) !== null && _b !== void 0 ? _b : '');
const maxInputFilesPerJob = 10;
export const args = parse({
    inputAddresses: {
        type: String, alias: 'a', optional: true,
        description: 'Path to a csv of input addresses, one address & filename per line.'
    },
    outputAddresses: {
        type: String, alias: 'o', optional: true,
        description: 'Optional path to write a list of output addresses, one address per line.'
    },
    help: {
        type: Boolean, optional: true, alias: 'h',
        description: 'Prints this usage guide'
    },
}, {
    helpArg: 'help',
});
async function submitJobSpecs(jobSpecs, parcel) {
    // Submit the Jobs
    let jobIds = [];
    for (let jobSpec of jobSpecs) {
        console.log(jobSpec.cmd.join(" "));
        console.log(await parcel.submitJob(jobSpec));
        let jobId = (await parcel.submitJob(jobSpec)).id;
        console.log(`Job ${jobId} submitted.`);
        jobIds.push(jobId);
        // Add a 5 second wait between submitting jobs to (hopefully) reduce timeouts.
        await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
    }
    // Wait for them to complete
    let jobRunningOrPending;
    let jobs;
    do {
        jobRunningOrPending = false;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // eslint-disable-line no-promise-executor-return
        jobs = [];
        console.log('Getting job statuses');
        for (let jobId of jobIds) {
            let job = await parcel.getJob(jobId);
            if (job.status === null || job.status === undefined) {
                console.log(`Error reading ${jobId}`);
                jobRunningOrPending = true;
            }
            else {
                console.log(`Job ${jobId} status is ${JSON.stringify(job.status.phase)}`);
                jobs.push(job);
            }
        }
        for (let job of jobs) {
            if (job.status !== undefined) {
                let jobId = job.id;
                jobRunningOrPending = jobRunningOrPending || job.status.phase === JobPhase.PENDING ||
                    job.status.phase === JobPhase.RUNNING;
                if (job.status.phase === JobPhase.FAILED) {
                    console.log(`Job ${jobId} failed with msg ${job.status.message}`);
                    throw Error(`Job ${jobId} failed with msg ${job.status.message}`);
                }
            }
        }
    } while (jobRunningOrPending);
    // When all jobs have completed collect the output addresses
    let outputAddresses = [];
    for (let job of jobs) {
        if (job.status !== undefined) {
            for (let outputDoc of job.status.outputDocuments) {
                outputAddresses.push(outputDoc.id);
            }
        }
    }
    return outputAddresses;
}
async function tmb(inputAddresses, identity, parcel) {
    let inputFileNames = ["UCEC.rda", "exome_hg38_vep.Rdata", "gene.covar.txt", "mutation_context_96.txt", "TST170_DNA_targets_hg38.bed", "GRCh38.d1.vd1.fa"];
    let outputFileName = "tmb.pdf";
    let inputDocuments = [];
    let inputCmd = [];
    for (let i of inputFileNames) {
        inputDocuments.push({ mountPath: i, id: inputAddresses[i] });
    }
    let cmd = [
        'calcTMB.sh',
    ];
    console.log(cmd.join(" "));
    const jobSpec = {
        name: 'calc-tmb',
        image: 'humansimon/ectmb',
        inputDocuments: inputDocuments,
        outputDocuments: [{ mountPath: outputFileName, owner: identity }],
        cmd: cmd
    };
    return submitJobSpecs([jobSpec], parcel);
}
async function main() {
    console.log('Here we go...');
    const parcel = new Parcel({
        clientId: clientId,
        privateKey: privateKey
    });
    const identity = (await parcel.getCurrentIdentity()).id;
    let inputAddresses = {};
    fs.readFileSync(args.inputAddresses || '', 'ascii').
        split("\n").filter((l) => l !== '').
        map((l) => l.split(",")).
        forEach((l) => inputAddresses[l[0]] = l[1]);
    const outputAddresses = await tmb(inputAddresses, identity, parcel);
    // Write the out addresses to the output file if set
    if (args.outputAddresses) {
        fs.writeFileSync(args.outputAddresses, outputAddresses.join("\n"));
    }
}
main()
    .then(() => console.log('All done!'))
    .catch((err) => {
    console.log(`Error in main(): ${err.stack || JSON.stringify(err)}`);
    return process.exit(1);
});
;
