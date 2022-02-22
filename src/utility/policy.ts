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