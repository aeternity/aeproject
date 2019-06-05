# ForgAE

[![npm version](https://badge.fury.io/js/forgae.svg)](https://badge.fury.io/js/forgae)

**ForgAE** is an aeternity framework which helps with setting up a project.
The framework makes the development of smart contracts in the aeternity network pretty easy. It provides commands for compilation, deployment of smart contracts, running a local node, local compiler and unit testing the contracts.

Forgae consists of 5 separated packages. There are two main packages.
- forgae-cli - This package is responsible for reading **forgae** commands from the command line 
- forgae-lib - installing this package will give you access to the Deployer, which gives you the ability to deploy compiled contracts.
- forgae-logger - Using this package will give you the ability to print your historical deployments on the console.
- forgae-config - This package is used as helper where all the necessary configuration files are included.
- forgae-utils - Similarly to config this package helps with functions like **ReadFile**  & **keyToHex**, etc.


### Installing

```text
npm i -g forgae
```

### Documentation

[Documentation](developer-documentation/getting-started.md)