import * as msal from '@azure/msal-node';
import axios, { AxiosInstance } from 'axios';
import { format } from 'util';
import constants from '../constants';

const tokenInterceptor: ITokenInterceptor = (client) => async (value) => {
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


export interface IApiClient {
    uploadPolicy: (policyId: string, content: string) => void
}

export class ApiClient implements IApiClient {
    private client: AxiosInstance;
    constructor(config: IConfig) {
        const { clientId, clientSecret, tenant } = config;
        const clientConfig: msal.Configuration = {
            auth: {
                clientId,
                clientSecret,
                authority: `https://login.microsoftonline.com/${tenant}`
            }
        }
        const app = new msal.ConfidentialClientApplication(clientConfig);
        this.client = axios.create();
        this.client.interceptors.request.use(tokenInterceptor(app));
    }


    async uploadPolicy(policyId: string, content: string) {
        try {
            await this.client.put(format(constants.graphUri, policyId), content);
        }
        catch (err) {
            const message = err.response ? JSON.stringify(err.response.data, null, 3) : err.message;
            throw new Error(message);
        }
    }
}