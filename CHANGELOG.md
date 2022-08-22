# Changelog

## [4.1.5](https://github.com/aeternity/aeproject/compare/v4.1.4...v4.1.5) (2022-08-22)


### Bug Fixes

* use fixed compiler version as latest is not supported by sdk ([945e3a5](https://github.com/aeternity/aeproject/commit/945e3a59051f193d07d603f8294cade954623b36))

## [4.1.4](https://github.com/aeternity/aeproject/compare/v4.1.3...v4.1.4) (2022-07-25)


### Bug Fixes

* remove log for docker compose checks ([b372d69](https://github.com/aeternity/aeproject/commit/b372d696e51da11b12517cca402e70720d661592))

## [4.1.3](https://github.com/aeternity/aeproject/compare/v4.1.2...v4.1.3) (2022-07-25)


### Bug Fixes

* fix support for docker compose without minus ([84561fe](https://github.com/aeternity/aeproject/commit/84561feb0f6e9dcab33a25814048346009c747ea))

## [4.1.2](https://github.com/aeternity/aeproject/compare/v4.1.1...v4.1.2) (2022-07-25)


### Bug Fixes

* add support for docker compose without minus ([6e44339](https://github.com/aeternity/aeproject/commit/6e44339d95b7273245f489961103d70fe36ff885))

## [4.1.1](https://github.com/aeternity/aeproject/compare/v4.1.0...v4.1.1) (2022-07-08)


### Bug Fixes

* fix dependencies upgrade, prepare for 4.1.1 release ([58a83ab](https://github.com/aeternity/aeproject/commit/58a83ab26b6fb5456150d06745ef95d87b6e81e0))

## [4.1.0](https://github.com/aeternity/aeproject/compare/v4.0.0...v4.1.0) (2022-06-24)


### Features

* adjust for sdk 12 usage ([5fda5f2](https://github.com/aeternity/aeproject/commit/5fda5f278a4304629642286f2bd7322c823ddf7b))
* upgrade to sdk 12 ([8f8de6f](https://github.com/aeternity/aeproject/commit/8f8de6f408acf70ff26d7fb57360860c8f87e839))


### Bug Fixes

* fix breaking changes for sdk 12 usage ([357c3d5](https://github.com/aeternity/aeproject/commit/357c3d5ad010f399ab3b7fa20f5e30ccc11ab462))


### Miscellaneous

* prepare for 4.1.0 release ([045f61e](https://github.com/aeternity/aeproject/commit/045f61eb21860267d720593e76fba5570b794c0b))

## [4.0.0](https://github.com/aeternity/aeproject/compare/v3.0.5...v4.0.0) (2022-04-12)


### ⚠ BREAKING CHANGES

* improve update from previous aeproject version
* use calldata lib sdk, use snapshotting in tests
* **tx-inspector:** refactor inspector command
* cleanup code
* **init:** init command adjustments
* prepare for new project structure

### Features

* **env:** abort tests if env is not running ([fb780c6](https://github.com/aeternity/aeproject/commit/fb780c608478075bf168cdeac182ac4c33c488f7))
* **init:** add optional folder parameter to init ([ad00bea](https://github.com/aeternity/aeproject/commit/ad00bea1e689f0a0d425598775c6a8a4669ebbab))
* **init:** check for up-to-date nodejs version ([66edcf4](https://github.com/aeternity/aeproject/commit/66edcf4594218c318a71074f82854c194ec3928f))
* **lib:** add all accounts to default client ([f97e992](https://github.com/aeternity/aeproject/commit/f97e9925c1a60bcb51a03ee0009859f140f167ca))
* sdk 11 upgrade ([#408](https://github.com/aeternity/aeproject/issues/408)) ([44ff5db](https://github.com/aeternity/aeproject/commit/44ff5dbcae0343cd83d831a3729b48e254d7a803))
* **test:** better example test and contract ([f98e1df](https://github.com/aeternity/aeproject/commit/f98e1df95870aea143c67affd3806e89d8e82306))
* use updated sdk and rollback http usage ([1dc45f2](https://github.com/aeternity/aeproject/commit/1dc45f2d1bd3f6821b398f74d0b2c47639721320))


### Bug Fixes

* consider env running check if any container is up ([deaf578](https://github.com/aeternity/aeproject/commit/deaf578aad710911a50cb67fe69d03c6fb5ce150))
* docker-compose v2 up/running check ([7d1d37a](https://github.com/aeternity/aeproject/commit/7d1d37a1a7d147b75b534166a86d0a714681c934))
* incorrect default includes regex fix (resolves [#394](https://github.com/aeternity/aeproject/issues/394)) ([d81fc8a](https://github.com/aeternity/aeproject/commit/d81fc8ab8ba8270ba3428baec5b36d025e50a165))


### Refactorings

* improve update from previous aeproject version ([d71bfe8](https://github.com/aeternity/aeproject/commit/d71bfe85aeb737c3cfa2cb5b3ded131a68e289cc))
* **init:** init command adjustments ([8f2f47d](https://github.com/aeternity/aeproject/commit/8f2f47df0f82cf134da1712e582a05eeef5b0854))
* prepare for new project structure ([64d58d0](https://github.com/aeternity/aeproject/commit/64d58d0764537887042ab6d3d4e26ea59b63e194))
* **tx-inspector:** refactor inspector command ([b500968](https://github.com/aeternity/aeproject/commit/b5009686dc38101f249404b45023d275f6aad8aa))
* use calldata lib sdk, use snapshotting in tests ([0c6d010](https://github.com/aeternity/aeproject/commit/0c6d0104b0e289ebdcc5d98b06108158362400e6))


### Testing

* improved exec env, assert env and test results ([a79bcf3](https://github.com/aeternity/aeproject/commit/a79bcf3d2b0d0a79073ec8c742140f4b01a67fae))
* improved exec env, assert file existence ([a9a96e1](https://github.com/aeternity/aeproject/commit/a9a96e13e43ce4de938cb2ef4b692d5fa394483c))
* link to use local aeproject utils ([e058b54](https://github.com/aeternity/aeproject/commit/e058b54fe79972999a61aaee06ceae6b568a1b59))


### Miscellaneous

* adapt to naming convention of sdk examples ([3d22a19](https://github.com/aeternity/aeproject/commit/3d22a19ea787351abc8b68dba2d92bc6b609b7bf))
* beta 5 release ([8afb026](https://github.com/aeternity/aeproject/commit/8afb026ef9b760621cf8160cf9f90018362dd032))
* beta 6 release ([1bc12bb](https://github.com/aeternity/aeproject/commit/1bc12bbdcf113da768b481011c4c52806fe1ed8a))
* clean unused code and formatting ([11ba445](https://github.com/aeternity/aeproject/commit/11ba44524b863373d310e676016f87cb3f085c8b))
* cleanup code ([2244394](https://github.com/aeternity/aeproject/commit/2244394d47f288345dab72136a8eb6ba185b11d1))
* cleanup folders ([46d73f3](https://github.com/aeternity/aeproject/commit/46d73f3043acb1a9180c40fb0f0150be291c11d4))
* **deps:** bump mkdocs version from 1.2.3 to 1.2.4 ([59bbded](https://github.com/aeternity/aeproject/commit/59bbdedac9e66f6ccb8402f2536349f4ef200b6d))
* **deps:** sdk v11.0.1 ([90d9cf6](https://github.com/aeternity/aeproject/commit/90d9cf6b41c04512ebd40f9af218b2a6ace12658))
* prepare for 4.0.0 release ([9da6a85](https://github.com/aeternity/aeproject/commit/9da6a8594378ecefbd7fc32a8e9b9caeed8d0a04))
* **repo:** add commitlint and release-please ([00d08ba](https://github.com/aeternity/aeproject/commit/00d08bab4e8711048e23c2367f56a584f5fe7c3d))
* **repo:** add issue template and action docs generation ([7fc04cc](https://github.com/aeternity/aeproject/commit/7fc04cc0b690b5658889f20d9487bb97a2c1d13c))
* **repo:** re-add license ([85f29c9](https://github.com/aeternity/aeproject/commit/85f29c96434324768188c7c60d9845f0f53c7fad))
* **tests:** happy path tests (without assertions) ([f8e3e3f](https://github.com/aeternity/aeproject/commit/f8e3e3f7949b7a7daf6b0b5ff0d4872a8f86af47))
* **tests:** improved env to wait for node to come up ([0992920](https://github.com/aeternity/aeproject/commit/0992920a66365ba950c3a9a099905448e9553fff))
* **tests:** more test cases ([28e0859](https://github.com/aeternity/aeproject/commit/28e0859b118d70eefd12855e760d8f291982ecdb))
* update dependencies ([5650a31](https://github.com/aeternity/aeproject/commit/5650a3159b4f6616add03d1ba58488e2a792fac4))
* update dependencies ([397c3c5](https://github.com/aeternity/aeproject/commit/397c3c5a36d7e5ce6b5d36a0aea964ef07158494))
* update dependencies ([c42c2e4](https://github.com/aeternity/aeproject/commit/c42c2e4c2e6e9a4d00e6c39362a71fa079a7cdbb))
* update dependencies, add lint check ([adc54a4](https://github.com/aeternity/aeproject/commit/adc54a4fab041bd26b5039b8dc71905c274e420d))
* update node, sdk & compiler version ([c625c38](https://github.com/aeternity/aeproject/commit/c625c38516429ffc65c8924da88a27303dfc4f10))
* update release please ci action ([aa56ac6](https://github.com/aeternity/aeproject/commit/aa56ac6b9a5c38d15bc5cd7c1d8e2a7d86200672))
* update to lockfile v2 ([0e3e3ee](https://github.com/aeternity/aeproject/commit/0e3e3eebf6e7081d942d0a5cc4acf51012bd6d14))
* update version, use fixed node image ([bf92a20](https://github.com/aeternity/aeproject/commit/bf92a20ab569b0061e5f87884df812b17340d608))
* update version, use latest bundle image ([3b5cc81](https://github.com/aeternity/aeproject/commit/3b5cc816a7441f0e0d4935db3090c6a6e5aa08a3))
