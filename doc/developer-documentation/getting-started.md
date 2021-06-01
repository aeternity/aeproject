# Quick Start

## Requirements
In order to have aeproject working you must have installed the following:
```
nodejs 9.5.0
python
docker
```

**Note:** For older versions on widnows you can use docker-toolbox. This will install docker-compose as part of the toolkit. Please bear in mind that the your docker-compose version must be at least `1.20.0`

## Install
```text
npm install -g @aeternity/aeproject
```

## Init a project
```text
aeproject init
```

This will create the project scaffold with an example contract including tests as well as a sample deployment script.

## Running a local environment
```text
aeproject env
```

This will run a local network (node, compiler and nginx-proxy) and prefund multiple addresses which can be used for tests.

To stop an already spawned local environment use `aeproject env --stop`

Node and compiler can also be started independently:
- `aeproject node`
- `aeproject compiler`

## Testing

```text
aeproject test
```

This will run the tests located in `./test` folder.

## Deploying

Run the following in order to execute the deployment file created from the **aeproject init** command:

```text
aeproject deploy
```
