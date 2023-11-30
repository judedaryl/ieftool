import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

export async function getPolicyDetailsAsync(path: string): Promise<IPolicy> {
    var content = fs.readFileSync(path, 'utf8').replace("\ufeff", "");
    try {
        const xml = await parseStringPromise(content);
        const policyId = xml['TrustFrameworkPolicy']['$']['PolicyId'];
        let parentPolicyId: string = null;
        const basePolicy = xml['TrustFrameworkPolicy']['BasePolicy'];
        if (basePolicy) {
            parentPolicyId = basePolicy[0]['PolicyId'][0]
        }
        return {
            policyId,
            parentPolicyId,
            path
        }
    }
    catch {
        throw new Error(`error in: ${path}`)
    }
}


export async function getPolicies(dir: string): Promise<IPolicy[]> {
    let policies: IPolicy[] = [];
    const traverseDirectory = async (directory: string) => {
        const files = fs.readdirSync(directory);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let filePath = path.join(directory, file);
            if (fs.lstatSync(filePath).isDirectory())
                await traverseDirectory(filePath)
            else {
                const ext = path.extname(filePath);
                if (ext == '.xml') {
                    const policy = await getPolicyDetailsAsync(filePath)
                    policies = [...policies, policy]
                }
            }
        }
    }
    await traverseDirectory(dir);
    return policies
}

export function transformPolicies(policies: IPolicy[], targetDir: string, configFilePath: string) {

    let configFile = fs.readFileSync(configFilePath, 'utf-8');
    let transformConfig: ITransformConfig = JSON.parse(configFile);

    //Remove the target folder and recreate to ensure it is empty
    fs.rmSync(targetDir, { recursive: true });
    fs.mkdirSync(targetDir);

    for (let i = 0; i < policies.length; i++) {
        let policy = policies[i];         

        fs.readFile(policy.path, 'utf8', function (err,data) {
            if (err) {
              return console.log(err);
            }
            var result = data.replace(/{{ tenantId }}/g, transformConfig.tenantId);
            result = result.replace(/{{ proxyIdentityExperienceFrameworkClientId }}/g, transformConfig.proxyIdentityExperienceFrameworkClientId);
            result = result.replace(/{{ identityExperienceFrameworkClientId }}/g, transformConfig.identityExperienceFrameworkClientId);
            result = result.replace(/{{ deploymentMode }}/g, transformConfig.deploymentMode);
            result = result.replace(/{{ aiInstrumentationKey }}/g, transformConfig.aiInstrumentationKey);
            result = result.replace(/{{ contentPath }}/g, transformConfig.contentPath);
          
            let targetPath = targetDir + '\\' + policy.policyId + '.xml';
            fs.writeFile(targetPath, result, 'utf8', function (err) {
               if (err) return console.log(err);
            });
          });
    }
}

export function batchPolicies(branches: IBranch[], batch: IPolicy[][] = []) {
    var batches = branches.map(q => q.policy);
    batch.push(batches);
    branches.forEach(q => {
        if (q.children && q.children.length > 0) {
            batchPolicies(q.children, batch);
        }
    });
    return batch;
}

export function uniquenessCheck(policies: IPolicy[]) {
    policies.filter((value, i, arr) => {
        return arr.findIndex(i => i.policyId == value.policyId) == i
    }).length != policies.length
}