# Quick Start

## Requirements
In order to have AEproject working you must have installed the following:
```
nodejs >= 14
docker
```

**Note:** on windows WSL 2 must be used

## Install
```text
npm install -g @aeternity/aeproject
```

## Init a project
```text
aeproject init [folder]
```

This will create the project scaffold with an example contract including tests as well as a sample deployment script inside the specified folder. If no folder is specified the artifacts will be initialized in the current directory.

Further explained in [Initialization Documentation](cli/init.md).

## Running a local environment
```text
aeproject env
```

This will run a local æternity network in dev-mode (node, compiler and nginx-proxy).

To stop an already spawned local environment use `aeproject env --stop`

Further explained in [Environment Documentation](cli/env.md).

## Testing

```text
aeproject test
```

This will run the tests located in `./test` folder. Further explained in [Testing Documentation](cli/test.md).

## Help

```text
aeproject help
```

Run this command to give you all possible commands of `aeproject` with help and info

## Version

```text
aeproject --version
```

Running this command will give you the current installed `aeproject` version
