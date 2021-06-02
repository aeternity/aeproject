# aeproject deploy

## Run deploy script

The `deploy` command helps developers to run their deployment scripts and thus deploy their Sophia Contracts. The sample deploy script is scaffolded in the deployment folder.

You can specify network using the `-n` or `--network` option. There are 3 options for networks predefined and available:

* `local` -> http://localhost:3001 (default if not specified)
* `testnet` -> https://testnet.aeternity.io
* `mainnet` -> https://mainnet.aeternity.io

Example:
```text
aeproject deploy -n testnet -s <secretKey>
```

* the `-s` or `--secretKey` is required and used for adding a secretKey that will be used to deploy and call contracts
* if required you can add additional networks in the `config/network.json`

With the additional `-c` or `--compiler` parameter you can specify the compiler to be used. Example:

```text
aeproject deploy -c http://somewhere.compiler.com -s <secretKey>
```

With the additional `--path` parameter you can specify the path to the deployment scripts.