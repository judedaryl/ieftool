export const parseOptions = (options: { tenant_id: string, client_id: string, client_secret: string, path: string }) => ({
    tenantId: options.tenant_id,
    clientId: options.client_id,
    clientSecret: options.client_secret,
    path: options.path
})

export const parseBuildOptions = (options: { sourceFolder: string, configFile: string, targetFolder: string }) => ({
    sourceFolder: options.sourceFolder,
    configFile: options.configFile,
    targetFolder: options.targetFolder,
})