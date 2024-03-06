# Local Environment

```text
aeproject env
```

The command is responsible for setting up a healthy local environment. The `env` command helps developers run a local node and a local compiler in dev-mode using docker. To spawn a fully functional environment it can take a couple of minutes depending on your system.

_If using Windows, WSL 2 needs to be used_ for AEproject to work normally, see https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers

You can stop both the node and the compiler by running

```text
aeproject env --stop
```

There are optional parameters **\-\-nodeVersion** and **\-\-compilerVersion**. To specify a specific version of node or compiler, or both

```text
aeproject env --nodeVersion v6.12.0
# or
aeproject env --compilerVersion v7.6.1
# or
aeproject env --nodeVersion v6.12.0 --compilerVersion v7.6.1
```

This also applies to the commands `aeproject node` and `aeproject compiler`.

To see whether you have running instances of the nodes along with a compiler you could run the following command

```text
aeproject env --info
```

**Note**: By default AEproject uses the `latest-bundle` tag of the official [docker images](https://hub.docker.com/r/aeternity/aeternity/tags).

**Compatibility**:

- aeproject until `v4.8.3` is only compatible with node versions `NODE_TAG <= v6.11.0` due to some changes in the devmode plugin
- aeproject uses the `-bundle` node docker images including dev mode, which are only published from `NODE_TAG >= v6.3.0`
- the default `aeternity.yaml` config file that ships with aeproject supports `NODE_TAG >= v6.8.0`
- the latest `@aeternity/aepp-sdk@13` is only compatible using `NODE_TAG >= v6.0.0` and `COMPILER_TAG >= v7.5.0`
- ARM64/Apple Silicon is supported from images `NODE_TAG >= v6.8.1` and `COMPILER_TAG >= v7.3.0`

## Disclaimer

- Firewalls and any other security feature can block your docker/docker-compose requests. Please check that docker/docker-compose is NOT in its blocked list or has permission to make requests.
