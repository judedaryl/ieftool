import { Branch } from "../types/branch";
import { Policy } from "../types/policy";


export function convertToTree(policies: Policy[]) {
    let branches = policies.map(q => new Branch(q));
    while (branches.some(q => q.policy.parentPolicyId != null)) {
        const b = branches.pop();
        const { parentPolicyId } = b.policy;

        if (parentPolicyId == null) {
            branches = [b, ...branches];
            continue;
        }

        const p = recursiveFind(b.policy.policyId, parentPolicyId, branches);
        p.children.push(b);
    }
    return branches;
}

export function recursiveFind(finding: string, policyId: string, branches: Branch[]): Branch {
    return branches.reduce((q, item) => {
        if (q) return q;
        if (item.policy.policyId == policyId) return item;
        if (item.children) return recursiveFind(finding, policyId, item.children);
    }, null);
}


export function convertToFlat(branches: Branch[], policies: Policy[]) {

    branches.forEach(q => {
        policies.push(q.policy);
        if (q.children && q.children.length > 0) {
            convertToFlat(q.children, policies);
        }
    })

    return policies;
}