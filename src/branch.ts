class Branch implements IBranch {
    policy: IPolicy
    children: Branch[] = []
    constructor(policy: IPolicy) {
        this.policy = policy;
    }
}

export default Branch