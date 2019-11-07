# aeproject inspect

## Inspect raw tx 
The **inspect** command unpack and verify raw transaction (verify nonce, ttl, fee, account balance). It can be used to verify failing transactions to check what the issue is.
```text
    aeproject inspect tx_+E0MAaEBK4bq9XiZ/0QVdOa8Hs9V18v6dGZYIa8XXNYFpQh6yq6hAR8To7CL8AFABmKmi2nYdfeAPOxMCGR/btXYTHiXvVCjCoJOIAABgL6cZFo=
```



Default network is **local**, it connects to local node and verifies transaction.
If you want to inspect your transaction on another network there is optional parameter **--network**. You can set **testnet** or **mainnet**.
```text
aeproject inspect tx_+E0MAaEBK4bq9XiZ/0QVdOa8Hs9V18v6dGZYIa8XXNYFpQh6yq6hAR8To7CL8AFABmKmi2nYdfeAPOxMCGR/btXYTHiXvVCjCoJOIAABgL6cZFo= --network testnet
```
or 
```text
aeproject inspect tx_+E0MAaEBK4bq9XiZ/0QVdOa8Hs9V18v6dGZYIa8XXNYFpQh6yq6hAR8To7CL8AFABmKmi2nYdfeAPOxMCGR/btXYTHiXvVCjCoJOIAABgL6cZFo= --network mainnet
```

Or if you want to set your custom network like **localhost:9999**, you should pass and another optional parameter **--networkId**
```text
aeproject inspect tx_+E0MAaEBK4bq9XiZ/0QVdOa8Hs9V18v6dGZYIa8XXNYFpQh6yq6hAR8To7CL8AFABmKmi2nYdfeAPOxMCGR/btXYTHiXvVCjCoJOIAABgL6cZFo= --network localhost:9999 --networkId ae_my_id
```

Inspected result should look something like this one. Some info, warning or error messages and tx data.
```
 [INFO] 'Nonce' - Current account nonce is '81', nonce used in tx is '1'.
 [ERROR]  'fee' - The fee for the transaction is too low, the minimum fee for this transaction is 16660000000000
{ tx:
   { tag: '12',
     VSN: '1',
     senderId: 'ak_LAqgfAAjAbpt4hhyrAfHyVg9xfVQWsk1kaHaii6fYXt6AJAGe',
     recipientId: 'ak_Egp9yVdpxmvAfQ7vsXGvpnyfNq71msbdUpkMNYGTeTe8kPL3v',
     amount: '10',
     fee: '20000',
     ttl: '0',
     nonce: '1',
     payload: 'ba_Xfbg4g==' },
  txType: 'spendTx' }
```


