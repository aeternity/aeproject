# forgae-history

## History of your deploys

This package provides information of your previous deployments such as:

* The public key of whoever executed the transaction
* Name of the contracts
* Tx Hash of the transaction
* Its status \(whether it was successful or not\)
* The netowrk it has been deployed on.

### Installation

```text
npm install forgae-logger
```

In order to see a list of what you've deployed you can run the following command:

```text
forgae history [limit]
```

Parameters:

* limit - \[Optional\] By specifying --limit you can set the max number of historical records to be shown. Default is 5. 

  Example: 

  ```text
  forgae history --limit 10
  ```

Using this command will print you historical list of execution reports

