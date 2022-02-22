export const parseOptions = (options: { tenant_id: string, client_id: string, client_secret: string, path: string }) => ({
    tenantId: options.tenant_id,
    clientId: options.client_id,
    clientSecret: options.client_secret,
    path: options.path
})