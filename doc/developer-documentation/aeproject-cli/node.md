# aeproject node

## Start your local development node

```text
aeproject node
```

The package is responsible for setting up a healthy local node. The **node** command help developers run their local network, as well as local compiler on docker. The local network contains 3 nodes. To spawn a fully functional network takes couple of minutes. At the end of this command you will be presented with accounts that you can use in your unit tests.

```text
aeproject node
```

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


Together with AE node `node` command run a local compiler that response at `http://localhost:3080` If you want to run only AE node, you should type a optional parameter **--only**

```text
aeproject node --only
```

You have the availability to start your compiler separately by running `aeproject node --only-compiler` respectively.


You can stop both the node and the compiler by running `aeproject node --stop`
```text
aeproject node --stop
```

You can stop the node only 
```text
aeproject node --stop --only
```

Or if you want to stop only the compiler then you should type
```text
aeproject node --stop --only-compiler
```

Similarly as the start commands you have few option to choose what you want to stop while doing your project. 

To see whether you have running instances of the nodes along with a compiler you could run the following command
```text
aeproject node --info
```

If you don't have running instances of the node started from `aeproject` you could check information about the compiler with 
```text
aeproject node --info --only-compiler
```

### Disclaimer
Please note that in rare occurrences you may experience some delay, or even timeout exception while trying to run the node. This usually happens due to new version of the docker images which the docker is trying to pull, or possibly could happen after updating the aeproject verson with new node/compiler version. The files may be large or connection inconsistency may occur. Please try to run ``` docker pull ``` or simply retry to run ```aeproject node``` again. 