# forgae deploy

## Run deploy script

```
forgae deploy
```

The **deploy** command help developers run their deploy script aeternity
proejcts. The sample deploy script is scaffolded in deployment folder.

You can specify network using the **-n** or **--network** option. There are 3 options for networks predefined and available : 
- "local" - "http://localhost:3001"
- "testnet" - "https://sdk-testnet.aepps.com"
- "mainnet" - "https://sdk-mainnet.aepps.com"

Example:
```
forgae deploy -n testnet
```

Additional **--path** parameter is available, which can specify the path to the deployment scripts.

The **-s** is used for adding a secretKey that will be used to deploy and call contracts

Additional **--compiler** parameter is available, which can specify compiler to be used.
Example:
```
forgae deploy --compiler http://localhost:3080
```

**Deployer.deploy(path, gasLimit, initState)** function can take up to 2 arguments:
- path - relative path to the contract
- gasLimit - the gas limit for the deployment
- initState - variable for the arguments of the **init** function of the contract