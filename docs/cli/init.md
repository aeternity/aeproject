# Project Initialization

```text
aeproject init [folder]
```

_Optionally_ a `folder` can be specified for the project to be initialized in, otherwise the current directory is used.

Creates a new project structure with a few folders in which the developer can create **contracts** and **tests**, as well as installing needed dependencies.

## Update existing project

For upgrade from old AEproject versions check out [Migration from 3.x.x to 4.x.x](../migration-from-3.x.x-to-4.x.x.md) and [Migration from 4.x.x to 5.x.x](../migration-from-4.x.x-to-5.x.x.md).

```text
aeproject init --update
```

Updates the project structure and needed artifacts to the latest version, as well as installing needed dependencies.

## Upcoming Hard-fork initialization

The additional parameter `--next` can be used to either initialize or update a project with changes for an upcoming hard-fork if available.
