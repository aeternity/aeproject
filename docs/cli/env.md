# Start local testing environment

```text
aeproject env
```

The command is responsible for setting up a healthy local environment. The `env` command helps developers run a local node and a local compiler in dev-mode using docker. To spawn a fully functional environment takes a couple of minutes.

*If using Windows, WSL 2 needs to be used* for aeproject to work normally, see https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers

You can stop both the node and the compiler by running
```text
aeproject env --stop
```

There are optional parameters **\-\-nodeVersion** and **\-\-compilerVersion**. To specify a specific version of node or compiler, or both
```text
aeproject env --nodeVersion v6.3.0
# or
aeproject env --compilerVersion v6.1.0
# or
aeproject env --nodeVersion v6.3.0 --compilerVersion v6.1.0
```
also applies to **aeproject node** and **aeproject compiler**

To see whether you have running instances of the nodes along with a compiler you could run the following command
```text
aeproject env --info
```

### Disclaimer
- Firewalls and any other security feature can block your docker/docker-compose requests. Please check that docker/docker-compose is NOT in its blocked list or has permission to make requests.
