# forgae deploy

## Run deploy script

```text
forgae deploy
```

The **deploy** command helps developers run their deployment scripts and thus deploy their aeternity projects. The sample deploy script is scaffolded in deployment folder.

You can specify network using the **-n** or **--network** option. There are 3 options for networks predefined and available :

* "local" - "[http://localhost:3001](http://localhost:3001)"
* "testnet" - "[https://sdk-testnet.aepps.com](https://sdk-testnet.aepps.com)"
* "mainnet" - "[https://sdk-mainnet.aepps.com](https://sdk-mainnet.aepps.com)"

Example:

```text
forgae deploy -n testnet
```

Additional **--path** parameter is available, which can specify the path to the deployment scripts.

The **-s** is used for adding a secretKey that will be used to deploy and call contracts

Additional **--compiler** parameter is available, which can specify compiler to be used. Example:

```text
forgae deploy --compiler http://localhost:3080
```

