# Upcoming Hard-Fork / Ceres Support

Aeproject can already be used for testing and setup with the upcoming Ceres hard-fork.

### Automatic update

Use `aeproject init --next ` to initialize a new project that has the necessary adjustments for ceres applied.

Use `aeproject init --update --next` to update an existing project with the adjustments for ceres. For updating existing tests implemented change occurrences of `utils.getSdk()` to `utils.getSdk({ ignoreVersion: true })` or use the same option for manually initialized sdk `Node` and `CompilerHttp`. 

### Manual update

 - change occurrences of `utils.getSdk()` to `utils.getSdk({ ignoreVersion: true })` or use the same option for manually initialized sdk `Node` and `CompilerHttp`
 - update `docker/aeternity.yml` to include 
```yaml
chain:
  hard_forks:
    "1": 0
    "6": 1
```
 - update `docker-compose.yml` to use the `latest` node and compiler tags or specify it manually in running with `aeproject env --nodeVersion latest --compilerVersion latest`