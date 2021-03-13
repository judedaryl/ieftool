#!/usr/bin/env node

import * as commander from 'commander';
import * as fs from 'fs';
import ApiClient from './api/api-client';
import { convertToTree } from './utility/branch';
import { batchPolicies, getPolicies, getPolicyDetailsAsync } from './utility/policy';
import clear from 'clear';
import figlet from 'figlet';
import chalk from 'chalk';


clear();

console.log(
    chalk.cyan(
        figlet.textSync('ieftool\nB2C Tool', { horizontalLayout: 'full' })
    )
);
console.log('=================================================')
console.log('Author: Daryl Clarino, Email: clarinojd@gmail.com')
console.log('=================================================')
const program = new commander.Command();

program
    .version('1.0.0');

program
    .command('deploy')
    .description('')
    .option('-t, --tenant_id <tenant_id>', 'B2C tenant id')
    .option('-c, --client_id <client_id>', 'App registration client id')
    .option('-s, --client_secret <client_secret>', 'App registration client secret')
    .option('-p, --path <path>', 'Build path')
    .action(async (options) => {
        const tenantId = options['tenant_id'];
        const clientId = options['client_id'];
        const clientSecret = options['client_secret'];
        const path = options['path'];

        var policyPaths = getPolicies(path)
        var policies = await Promise.all(policyPaths.map(q => getPolicyDetailsAsync(q)));
        const tree = convertToTree(policies);
        const batch = batchPolicies(tree, []);

        const api = new ApiClient({
            tenant: tenantId,
            clientId,
            clientSecret
        });

        try {
            const start = Date.now();
            console.log(chalk.green('Starting Batched Upload'))

            for (var i = 0; i < batch.length; i++) {

                const curBatch = batch[i];
                const policies = curBatch.map(q => q.policyId);
                const reqBatch = curBatch.map(({ path, policyId }) => ({
                    content: fs.readFileSync(path, 'utf8'),
                    policyId
                }));

                let promises = [];
                console.log(`===============================`)
                console.log(`Uploading:\n\t${policies.join(',\n\t')}`)
                for (var j = 0; j < reqBatch.length; j++) {
                    const { policyId, content } = reqBatch[j];
                    const promise = api.uploadPolicy(policyId, content);
                    promises.push(promise);
                }

                await Promise.all(promises);
                console.log(chalk.green(`Successfully uploaded:\n\t${policies.join(',\n\t')}`))
            }

            console.log(`===============================================`)
            console.log(chalk.green(`Successfully uploaded all policies`))
            console.log(`================================================`)
            console.log(`Ellapsed: ${(Date.now() - start) / 1000}`)
        }
        catch (err) {
            console.log(chalk(err.message));
            process.exit(1);
        }
    });

program.parse(process.argv);