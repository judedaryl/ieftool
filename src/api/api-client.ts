import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as msal from '@azure/msal-node';
import { ConfidentialClientApplication } from '@azure/msal-node';


interface Config {
    tenant: string;
    clientId: string;
    clientSecret: string;
}

type TokenInterceptor = (
    client: ConfidentialClientApplication
) =>
    | ((
        value: AxiosRequestConfig
    ) => AxiosRequestConfig | Promise<AxiosRequestConfig>)
    | undefined;


const tokenInterceptor: TokenInterceptor = (client: ConfidentialClientApplication) => async (value) => {
    const request = await client.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"]
    });

    value.headers = {
        ...value.headers,
        'authorization': `Bearer ${request.accessToken}`,
        'content-type': 'application/xml'
    };

    return value;
}

class ApiClient {
    private client: AxiosInstance;
    constructor(config: Config) {
        const { clientId, clientSecret, tenant } = config;
        const clientConfig: msal.Configuration = {
            auth: {
                clientId,
                clientSecret,
                authority: `https://login.microsoftonline.com/${tenant}`
            }
        }
        const app = new msal.ConfidentialClientApplication(clientConfig);
        this.client = axios.create({
            url: "https://graph.microsoft.com",
            baseURL: "https://graph.microsoft.com"
        })

        this.client.interceptors.request.use(tokenInterceptor(app));
    }


    async uploadPolicy(policyId: string, content: string) {
        try {
            await this.client.put(`https://graph.microsoft.com/beta/trustFramework/policies/${policyId}/$value`, content);
        }
        catch (err) {
            throw new Error(JSON.stringify(err.response.data.error.message, null, 3));
        }
    }
}

export default ApiClient;