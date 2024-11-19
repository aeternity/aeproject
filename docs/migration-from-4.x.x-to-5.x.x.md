# Migration from 4.x.x to 5.x.x

## Changes

**AEproject** `v5.0.0` underwent some minor but breaking changes.

Install the new AEproject version

```
npm install -g @aeternity/aeproject
```

### Removed from libs

Following utils have been removed and cannot be used anymore:

- `utils.getFilesystem()` discontinued, as it is now natively available in the sdk via import, e.g. `const { getFileSystem } = require("@aeternity/aepp-sdk");`
