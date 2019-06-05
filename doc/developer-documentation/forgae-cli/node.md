# forgae node

## Start your local development node

```

forgae node

```

The **node** command help developers run their local network on docker.
The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.
```
forgae node
```

Together with AE node `node` command run a local compiler that response at `http://localhost:3080`
If you want to run only AE node, you should type a optional parameter **--only**
```
forgae node --only
```

To stop the local node, simply run
```
forgae node --stop
```

Additional **--compiler-port** parameter is available, which can specify on which port would local compiler start (default is 3080).
Example:
```
forgae node --compiler-port 4080
```
