# Migration from 4.x.x to 5.x.x

**AEproject** `v5.0.0` underwent some breaking changes.

Install the latest AEproject version

```
npm install -g @aeternity/aeproject
```

## Various Changes

- **dropped commonjs support**, newly created projects will be created as esm projects, old cjs projects will not continue to work with newer aeproject versions, to keep using old cjs projects, `@aeternity/aeproject@4` will continue to work for now.
- `node@16` is no longer supported, please update to v18 or higher
- updated to `@aeternity/aepp-sdk@14` to the latest version, see the [migration guide](https://github.com/aeternity/aepp-sdk-js/blob/v14.0.0/docs/guides/migration/14.md) for additional reference.

## Removed from libs

Following utils have been removed and cannot be used anymore:

- `utils.getFilesystem()` discontinued, as it is now natively available in the sdk via import, e.g. `const { getFileSystem } = require("@aeternity/aepp-sdk");`
