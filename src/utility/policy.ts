import * as path from 'path';
import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';
import { Policy } from '../types/policy';
import { Branch } from '../types/branch';

export async function getPolicyDetailsAsync(path: string): Promise<Policy> {
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


export function getPolicies(dir: string) {
    let policies: string[] = [];
    const traverseDirectory = (directory: string) => {
        fs.readdirSync(directory).forEach(file => {
            let filePath = path.join(directory, file);
            if (fs.lstatSync(filePath).isDirectory())
                traverseDirectory(filePath)
            else {
                const ext = path.extname(filePath);
                if (ext == '.xml')
                    policies = [...policies, filePath]
            }
        })
    }
    traverseDirectory(dir);
    return policies
}

export function batchPolicies(branches: Branch[], batch: Policy[][] = []) {

    var batches = branches.map(q => q.policy);
    batch.push(batches);
    branches.forEach(q => {
        if (q.children && q.children.length > 0) {
            batchPolicies(q.children, batch);
        }
    });
    return batch;
}
