# AEproject

[![npm version](https://badge.fury.io/js/aeproject.svg)](https://badge.fury.io/js/aeproject)

**AEproject** is an aeternity framework which helps with setting up a project.
The framework makes the development of smart contracts in the aeternity network pretty easy. It provides commands for compilation, deployment of smart contracts, running a local node, local compiler and unit testing the contracts.

AEproject consists of 5 separated packages. There are two main packages.
- aeproject-cli - This package is responsible for reading **aeproject** commands from the command line 
- aeproject-lib - installing this package will give you access to the Deployer, which gives you the ability to deploy compiled contracts.
- aeproject-logger - Using this package will give you the ability to print your historical deployments on the console.
- aeproject-config - This package is used as helper where all the necessary configuration files are included.
- aeproject-utils - Similarly to config this package helps with functions like **ReadFile**  & **keyToHex**, etc. 


### Installing

```text
npm i -g aeproject
```

### Documentation

[Documentation](https://aeproject.gitbook.io/)