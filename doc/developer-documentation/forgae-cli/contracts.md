# forgae contracts

## [Contracts aepp](https://testnet.contracts.aepps.com/) integration

The integration between the forgae and the [Contracts aepp](https://testnet.contracts.aepps.com/) allows the user to compile and deploy contracts using the **Contracts aepp** on the local spawned node. Please note that the following command would work only once a project has been initialized.

The Contracts aepp runs on [http://localhost:8080/](http://localhost:8080/) by default. There are three optional parameters to `forgae contracts`:

* --nodeUrl - specify the url of the node to which the contracts aepp to connect with.

    Example: 

  ```text
    forgae contracts --nodeUrl http://localhost:3002/
  ```

    It defaults to the following url -  [http://localhost:3001/](http://localhost:3001/); 

* --update - update the contracts aepp with the latest version;
* --ignoreOpenInBrowser - ignoring opening of the browser;

