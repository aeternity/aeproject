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
  - the aeproject provided `utils.getSdk({})` has to be adjusted to pass a reference to the sdk used `utils.getSdk(AeppSdk, {})` where AeppSdk can be imported using `import * as AeppSdk from "@aeternity/aepp-sdk";`
  - `@aeternity/aepp-sdk@14` requires aeternity node version `>= 7.1.0`
## Removed from libs

Following utils have been removed and cannot be used anymore:

- `utils.getFilesystem()` discontinued, as it is now natively available in the sdk via import, e.g. `const { getFileSystem } = require("@aeternity/aepp-sdk");`
