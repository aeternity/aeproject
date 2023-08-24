# Upcoming Version Support

Aeproject can already be used for testing and setup with the upcoming node versions.

### Automatic update

Use `aeproject init --next ` to initialize a new project that has the necessary adjustments to use the latest versions.

Use `aeproject init --update --next` to update an existing project with the adjustments to use the latest versions.

### Manual update

- change occurrences of `utils.getSdk()` to use `utils.getSdk({ ignoreVersion: true })` if needed or use the same option for manually initialized sdk `Node` and `CompilerHttp`
- update `docker-compose.yml` to use the `latest` node and compiler tags or specify it manually in running with `aeproject env --nodeVersion latest --compilerVersion latest`
