# forgae export-config

## Run export-config command

```text
forgae export-config 
```

The **export-config** command helps developers see basic forgae configuration like miner and some default wallets, and node configuration. The command prints configuration as a json and export it to a file. Exported forgae configuration will be saved in './forgaeConfig.json' by default.

You can specify path using the **--path** option.

Example:

```text
forgae export-config --path ./../my-dir/my-forgae-config.json
```

Also you can type only directory path where you want to saved it, then command automatically would append filename with extension, by default it's 'forgaeConfig.json'
Example:

```text
forgae export-config --path ./../../archives/configs
```