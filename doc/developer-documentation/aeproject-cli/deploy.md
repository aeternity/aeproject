# aeproject deploy

## Run deploy script

The **deploy** command helps developers run their deployment scripts and thus deploy their aeternity projects. The sample deploy script is scaffolded in deployment folder.

You can specify network using the **-n** or **--network** option. There are 3 options for networks predefined and available :

* `local` -> http://localhost:3001 (default if not specified)
* `testnet` -> https://testnet.aeternity.io
* `mainnet` -> https://mainnet.aeternity.io

Example:

```text
aeproject deploy -n testnet -s <secretKey>
```

* the **-s** or **--secretKey** is required and used for adding a secretKey that will be used to deploy and call contracts
* if required you can add additional networks in the `config/network.json`

Additional **-c** or **--compiler** parameter is available, which can specify compiler to be used. Example:

```text
aeproject deploy -c http://somewhere.compiler.com -s <secretKey>
```

Additional **--path** parameter is available, which can specify the path to the deployment scripts.