import { Policy } from "./policy";

export class Branch {
    policy: Policy
    children: Branch[] = []
    constructor(policy: Policy) {
        this.policy = policy;
    }
}