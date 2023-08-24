# Local Environment

```text
aeproject env
```

The command is responsible for setting up a healthy local environment. The `env` command helps developers run a local node and a local compiler in dev-mode using docker. To spawn a fully functional environment it can take a couple of minutes depending on your system.

*If using Windows, WSL 2 needs to be used* for AEproject to work normally, see https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers

You can stop both the node and the compiler by running
```text
aeproject env --stop
```

There are optional parameters **\-\-nodeVersion** and **\-\-compilerVersion**. To specify a specific version of node or compiler, or both
```text
aeproject env --nodeVersion v6.11.0
# or
aeproject env --compilerVersion v7.5.0
# or
aeproject env --nodeVersion v6.11.0 --compilerVersion v7.5.0
```
This also applies to the commands `aeproject node` and `aeproject compiler`.

To see whether you have running instances of the nodes along with a compiler you could run the following command
```text
aeproject env --info
```

**Note**: By default AEproject uses the `latest-bundle` tag of the official [docker images](https://hub.docker.com/r/aeternity/aeternity/tags).

**Compatibility**: AEproject uses `@aeternity/aepp-sdk@13` which is only compatible using `node >= v6` and `compiler >= v7`, the only tested and recommended configuration, which also works on ARM64/Apple Silicon is from images `node v6.8.1` and `compiler v7.3.0`, upcoming newer versions with the same major version should work without issues.

## Disclaimer
- Firewalls and any other security feature can block your docker/docker-compose requests. Please check that docker/docker-compose is NOT in its blocked list or has permission to make requests.
