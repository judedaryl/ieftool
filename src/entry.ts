#!/usr/bin/env node

import chalk from 'chalk';
import commander from 'commander';
import figlet from 'figlet';
import * as fs from 'fs';
import { ApiClient, IApiClient } from './api';
import { convertToTree } from './utility/branch';
import { parseOptions } from './utility/commander';
import { batchPolicies, getPolicies } from './utility/policy';
import { clearDirectory, parseFile, writeFile } from './utility/file';
import globby from 'globby'
import path from 'path'
import { parseTemplate } from './utility/template';

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
    .description('Deploy IEF policies to Azure B2C')
    .option('-t, --tenant_id <tenant_id>', 'B2C tenant id')
    .option('-c, --client_id <client_id>', 'App registration client id')
    .option('-s, --client_secret <client_secret>', 'App registration client secret')
    .option('-p, --path <path>', 'Build path')
    .action(async (options) => {
        const { tenantId, clientId, clientSecret, path } = parseOptions(options);

        var policies = await getPolicies(path)
        const tree = convertToTree(policies);
        const batch = batchPolicies(tree, []);

        const api = new ApiClient({
            tenant: tenantId,
            clientId,
            clientSecret
        });
        const start = Date.now();
        console.log(chalk.green('Starting Batched Upload'))
        await batchedUpload(api, batch)
        console.log(`===============================================`)
        console.log(chalk.green(`Successfully uploaded all policies`))
        console.log(`================================================`)
        console.log(`Ellapsed: ${(Date.now() - start) / 1000}`)
    });

program
    .command('build')
    .description('Compiles B2C templates and policies')
    .option('-c, --config <path>', 'Specify the path to the b2c compiler configuration', './b2c-template.json')
    .option('-p, --source_path <path>', 'Specify the path to the templates folder', './src')
    .option('-o, --output_dir <path>', 'Specify the output folder', './build')
    .action(async (options) => {
        try {
            const { config, source_path: sourcePath, output_dir: outputDir } = options as IBuildOptions
            const cfg = parseFile<IParameters>(config)
            clearDirectory(outputDir);
            const templatePaths = globby.sync(sourcePath, { expandDirectories: { extensions: ['xml'] } });
            const getOutputPath = (filePath: string, comparePath: string) => {
                const parsedPath = path.parse(filePath);
                parsedPath.dir = parsedPath.dir.replace(comparePath, outputDir)
                const output = path.format(parsedPath);
                console.log(output);
                return output;
            }
            templatePaths.forEach(filePath => {
                const content = parseTemplate(filePath, cfg.parameters);
                const output = getOutputPath(filePath, sourcePath)
                writeFile(content, output);
            });
        }
        catch (err) {
            console.log(chalk(err.message));
            process.exit(1);
        }
    })


async function batchedUpload(client: IApiClient, batch: IPolicy[][]) {
    try {

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
                promises.push(client.uploadPolicy(policyId, content));
            }

            await Promise.all(promises);
            console.log(chalk.green(`Successfully uploaded:\n\t${policies.join(',\n\t')}`))
        }
    }
    catch (err) {
        console.log(chalk(err.message));
        process.exit(1);
    }
}

program.parse(process.argv);