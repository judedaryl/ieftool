type ITokenInterceptor = (
    client: import('@azure/msal-node').ConfidentialClientApplication
) =>
    | ((
        value: import('axios').AxiosRequestConfig
    ) => import('axios').AxiosRequestConfig | Promise<import('axios').AxiosRequestConfig>)
    | undefined;

interface IConfig {
    tenant: string;
    clientId: string;
    clientSecret: string;
}

interface IPolicy {
    policyId: string,
    parentPolicyId: string,
    path: string
}

interface IBranch {
    policy: IPolicy
    children: IBranch[]
}

interface IParameters {
    parameters: {
        [key: string]: string
    }
}

interface IBuildOptions {
    config: string
    source_path: string
    output_dir: string
    extensions: string[]
}