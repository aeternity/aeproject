# forgae node

## Start your local development node

```text
forgae node
```

The package is responsible for setting up a healthy local node. The **node** command help developers run their local network, as well as local compiler on docker. The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.

```text
forgae node
```

### If you are running on Windows environment and it is before `Windows 10` 
* You need to start manualy your `Docker Quickstart Terminal`. 
* Optional parameter **\-\-windows** allows you run AE node and compiler with predefined configuration. It uses **docker-compose** cli commands and it starts with the default docker machine with IP "192.168.99.100"
```text
forgae node --windows
```
* if docker default machine IP is running on different IP, you can set it by **\-\-docker-ip** optional parameter. Default IP is "192.168.99.100"
```text
forgae node --windows --docker-ip 192.168.99.100
```


Together with AE node `node` command run a local compiler that response at `http://localhost:3080` If you want to run only AE node, you should type a optional parameter **--only**

```text
forgae node --only
```

To stop the local node, simply run

```text
forgae node --stop
```

Additional **--compiler-port** parameter is available, which can specify on which port would local compiler start (default is 3080).
Example:
```
forgae node --compiler-port 4080
```
