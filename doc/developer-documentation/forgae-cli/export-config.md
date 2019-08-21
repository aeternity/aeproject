# aeproject export-config

## Run export-config command

```text
aeproject export-config 
```

The **export-config** command helps developers see basic aeproject configuration like miner and some default wallets, and node configuration. The command prints configuration as a json and export it to a file. Exported aeproject configuration will be saved in './aeprojectConfig.json' by default.

You can specify path using the **--path** option.

Example:

```text
aeproject export-config --path ./../my-dir/my-aeproject-config.json
```

Also you can type only directory path where you want to save it, then command automatically would append filename with extension, by default it's 'aeprojectConfig.json'
Example:

```text
aeproject export-config --path ./../../archives/configs
```