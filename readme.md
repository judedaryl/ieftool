# Go port

A port of this package written in golang is available at https://github.com/judedaryl/go-ieftool. Both packages these packages will be supported. If you want to use the tool but do not want the node runtime that it requires, please check out the port.

# About

``ieftool`` is a cli library based on npm for uploading [B2C TrustFramework Policies](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-trust-frameworks).

This tool makes it easier for B2C policies to be uploaded in-order based on the inheritance of a policy. Uploads are also faster because policies are uploaded by batch depending on its position on the inheritance tree.



```pre
src/
├─ social/
│  ├─ base.xml (1A_SBASE)
│  ├─ signupsignin.xml (1A_SSS)
├─ local/
│  ├─ base.xml (1A_LBASE)
│  ├─ signupsignin.xml (1A_LSS)
│  ├─ passwordreset.xml (1A_LPR)
├─ base.xml (1A_BASE)
├─ extension.xml (1A_EXT)

```

The example folder structure above has the following inheritance tree.

```pre
                1A_BASE
                    |
                 1A_EXT
                /      \
          1A_LBASE    1A_SBASE
           /    \        \      
       1A_LSS  1A_LPR    1A_SSS
```

These policies are then batched by their hierarchy in the tree, as well as their parent policy. The order of upload would then be.

1. 1A_Base
2. 1A_EXT
3. 1A_LBASE, 1A_LSBASE
4. 1A_LSS, 1A_LPR
5. 1A_LSSS



<br/>
<br/>


# Installation

### Via npm
```sh
npm install -g ieftool
```

### Via yarn
```sh
yarn global add ieftool
```

<br/>
<br/>

# Supported node versions

``ieftool`` only supports [LTS releases](https://nodejs.org/en/about/releases/), largely because it is using [@azure/msal-node](https://www.npmjs.com/package/@azure/msal-node#node-version-support).


<br/>
<br/>

##Options

```
Usage: ieftool [options] [command]

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  deploy [options]
  help [command]    display help for command
```

### deploy

The ``deploy`` command is responsible for uploading policies to B2C.

```
Usage: ieftool deploy [options]

Options:
  -t, --tenant_id <tenant_id>          B2C tenant id
  -c, --client_id <client_id>          App registration client id
  -s, --client_secret <client_secret>  App registration client secret
  -p, --path <path>                    Build path
  -h, --help                           display help for command
```

<br/>
<br/>

# Usage

To upload policies into a B2C tenant.

```sh
ieftool deploy -t { tenant } -c { client_id } -s { client_secret } -p { source_path }

```

| option | description |
|--|--|
| tenant | The B2C tenant, this can either be the **tenantId** or the **tenant name** (mytenant.onmicrosoft.com)|
| client_id | The client id of an app registration in B2C that has permissions for TrustFrameworkPolicies |
| client_secret | The client secret of an app registration in B2C that has permissions for TrustFrameworkPolicies |
| source_path | The path to your b2c policies. In the tree structure above it would be ``./src`` |
