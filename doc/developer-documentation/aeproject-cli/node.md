# aeproject node

## Start your local development node

```text
aeproject node
```

The **node** command help developers run their local network. The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.


### If you are running on Windows environment and it is before `Windows 10` 
* You need to start manualy your `Docker Quickstart Terminal`. 
* Optional parameter **\-\-windows** allows you run AE node and compiler with predefined configuration. It uses **docker-compose** cli commands and it starts with the default docker machine with IP "192.168.99.100"

```text
aeproject node --windows
```
* if docker default machine IP is running on different IP, you can set it by **\-\-docker-ip** optional parameter. Default IP is "192.168.99.100"
```text
aeproject node --windows --docker-ip 192.168.99.100
```


You can stop the node only by typing
```text
aeproject node --stop 
```

Similarly as the start commands you have few option to choose what you want to stop while doing your project. 

If you have running instances of the node started from `aeproject` you could check information about the node with 

```text
aeproject node --info
```

There is optional parameter **--nodeVersion**. To specify a specific version of node, you should type
```text
aeproject node --nodeVersion v5.3.0
```

### Disclaimer
Please note that in rare occurrences you may experience some delay, or even timeout exception while trying to run the node. This usually happens due to new version of the docker images which the docker is trying to pull, or possibly could happen after updating the aeproject verson with new node/compiler version. The files may be large or connection inconsistency may occur. Please try to run ``` docker pull ``` or simply retry to run ```aeproject node``` again. 