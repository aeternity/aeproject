# aeproject compatibility

## Start env with latest versions of node and compiler images and test the current project for compatibility

```text
aeproject compatibility
```
Compatibility would start env with latest docker images of node and compiler, would test your project and if there are some issues could give some recommendations.

Some of optional parameters are **\-\-nodeVersion** and **\-\-compilerVersion**. To specify a specific version of node or compiler, or both, you should type
```text
aeproject env --nodeVersion v5.3.0
or
aeproject env --compilerVersion v4.0.0
or
aeproject env --nodeVersion v5.3.0 --compilerVersion v4.0.0
```

### If you are running on Windows environment and it is before `Windows 10` 
* You need to start manually your `Docker Quickstart Terminal`. 
* Optional parameter **\-\-windows** allows you run AE node and compiler with predefined configuration. It uses **docker-compose** cli commands and it starts with the default docker machine with IP "192.168.99.100"

* if docker default machine IP is running on different IP, you can set it by **\-\-docker-ip** optional parameter. Default IP is "192.168.99.100"

```text
aeproject env --nodeVersion v5.3.0 --compilerVersion v4.0.0 --windows
or 
aeproject env --nodeVersion v5.3.0 --compilerVersion v4.0.0 --windows --docker-ip 192.168.99.102
or
aeproject env --windows --docker-ip 192.168.99.102
```