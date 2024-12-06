# Changelog

## [5.0.0](https://github.com/aeternity/aeproject/compare/v4.10.2...v5.0.0) (2024-12-06)


### ⚠ BREAKING CHANGES

* update to sdk 14
* drop custom get function, require node >= 18
* drop cjs support
* use sdk provided filesystem util, remove aeproject util implementation

### Bug Fixes

* build artifact files ([f4059cd](https://github.com/aeternity/aeproject/commit/f4059cda07c51c6e13ca0c899b40b1867549e420))
* sdk import usage ([5609660](https://github.com/aeternity/aeproject/commit/5609660dfb852c022351d1077265e109a77ad452))


### Refactorings

* drop cjs support ([a92df6e](https://github.com/aeternity/aeproject/commit/a92df6ebf2cb594a54425f79499673a8dc6028dc))
* drop custom get function, require node &gt;= 18 ([ef569b9](https://github.com/aeternity/aeproject/commit/ef569b9efff27d073575f42caad628b55a607646))
* update to sdk 14 ([ecbdf3c](https://github.com/aeternity/aeproject/commit/ecbdf3c222e72f644eb4790a528175f33231ffd3))
* use sdk provided filesystem util, remove aeproject util implementation ([93cf8c5](https://github.com/aeternity/aeproject/commit/93cf8c500db77ee2a108d90befd63f27cf4f5a81))


### Miscellaneous

* update dependencies ([6494ded](https://github.com/aeternity/aeproject/commit/6494ded4a78e44d512f4a927346f0ac1bf54cc30))
* update eslint ([db4f3e5](https://github.com/aeternity/aeproject/commit/db4f3e5c0f606085e1b1d31a93682e958cafab1f))
* upgrade to chai@5 for new projects ([dce8f50](https://github.com/aeternity/aeproject/commit/dce8f5051878895da1c1350b2256b158d77a60ea))
* use `npm pack` in tests ([e82cd51](https://github.com/aeternity/aeproject/commit/e82cd517cb1f99fc24ba4d0d26876f012400d9e0))
* use the same sdk ([a90943e](https://github.com/aeternity/aeproject/commit/a90943e913ccde538b3e8872ae759211125aea37))

## [4.10.2](https://github.com/aeternity/aeproject/compare/v4.10.1...v4.10.2) (2024-08-16)


### Bug Fixes

* publish ([c11f856](https://github.com/aeternity/aeproject/commit/c11f8561eeb462b0ea1c0849b147f900130db794))


### Miscellaneous

* update dependencies ([1cfc5ba](https://github.com/aeternity/aeproject/commit/1cfc5bae8a157f1c008325367953a5f043331580))

## [4.10.1](https://github.com/aeternity/aeproject/compare/v4.10.0...v4.10.1) (2024-07-22)


### Refactorings

* replace chai/mocha with vitest ([eb717e5](https://github.com/aeternity/aeproject/commit/eb717e5b8319747607805f6e25520ad0455f222d))


### Miscellaneous

* update compatible node version ([97bef2c](https://github.com/aeternity/aeproject/commit/97bef2c9f7fd157f3dd07e8508b299f229b84e1d))
* update dependencies ([eee28ef](https://github.com/aeternity/aeproject/commit/eee28ef31829ee96df2a427d9bdda8784c78bc8a))
* update dependency versions, temp fix ci ([e53bcca](https://github.com/aeternity/aeproject/commit/e53bcca602b79612704dc396ef377e187b62a279))

## [4.10.0](https://github.com/aeternity/aeproject/compare/v4.9.1...v4.10.0) (2024-04-26)


### Features

* default to use ceres ([104cbe4](https://github.com/aeternity/aeproject/commit/104cbe4b3b7224a9c7cddd8236096339d25db26c))

## [4.9.1](https://github.com/aeternity/aeproject/compare/v4.9.0...v4.9.1) (2024-04-23)


### Refactorings

* optimize docker healthcheck ([77f7506](https://github.com/aeternity/aeproject/commit/77f750628ebc77e98b1240568cec10e2797e5f35))


### Miscellaneous

* upgrade sdk and docker for next versions ([63b0fb2](https://github.com/aeternity/aeproject/commit/63b0fb2d3867c1a8aa108fc036a9fb334282a3a4))

## [4.9.0](https://github.com/aeternity/aeproject/compare/v4.8.3...v4.9.0) (2024-03-07)


### Features

* add ceres initializer and docs ([0721822](https://github.com/aeternity/aeproject/commit/072182206b07901b79ba1e18cde0462ad1789911))


### Bug Fixes

* add debug await key block after creating snapshot ([53fa2f9](https://github.com/aeternity/aeproject/commit/53fa2f9c5d15b116de531f5421eb5b4140719a3f))
* check for actually supported node &gt;= 16 requirement ([f50464e](https://github.com/aeternity/aeproject/commit/f50464e59b57d7f9d93ab11114274f316cf1acc0))
* rollback to correct height ([17a8262](https://github.com/aeternity/aeproject/commit/17a8262906a8436d3b51d0a522a0aacb227e2f5f))


### CI / CD

* fix workflow for incompatible versions ([e2080d2](https://github.com/aeternity/aeproject/commit/e2080d2f07a00e386b4f808b10fbe235edf6684b))
* skip certain tests for aux ci runs ([e41d0b7](https://github.com/aeternity/aeproject/commit/e41d0b71634f29c197f36b45529b0c89747530b1))


### Testing

* add library usage tests ([cd81972](https://github.com/aeternity/aeproject/commit/cd819723af43750baf4c3f9b73ceda8099b16a25))


### Refactorings

* improve library typescript defs ([30a83f8](https://github.com/aeternity/aeproject/commit/30a83f819101eb243c713016b3aaa547e8cfc53b))
* init command to take current aeproject library version ([124e8c9](https://github.com/aeternity/aeproject/commit/124e8c96fdc28fdd34c3935bda634cd69e655ed7))


### Miscellaneous

* add chai as promised test rejection example ([6a0d491](https://github.com/aeternity/aeproject/commit/6a0d491c8cdbe8668fc0ef07aa0ccc4de40539a6))
* document and improve release process ([b302647](https://github.com/aeternity/aeproject/commit/b302647f548aa6e22f7c384abe2c4247a4e63cb8))
* improve env initialisation and test setup ([d39e5d4](https://github.com/aeternity/aeproject/commit/d39e5d4a1492279f7cf9707f2300a84fd2117358))
* introduce prettier ([388f867](https://github.com/aeternity/aeproject/commit/388f867ab40bc1fee00011f52e29c1a41b915833))
* update dependencies ([5faaf66](https://github.com/aeternity/aeproject/commit/5faaf66454aea01f1861636c723991723c5dd624))
* upgrade support latest aeternity node ([afd36a5](https://github.com/aeternity/aeproject/commit/afd36a51cd1a9f8f8bd5952c90712f42e44b3697))

## [4.8.3](https://github.com/aeternity/aeproject/compare/v4.8.2...v4.8.3) (2023-09-20)


### CI / CD

* add matrix for compiler/node versions ([c6c7ea4](https://github.com/aeternity/aeproject/commit/c6c7ea46fe18cde0fda1132401c81addf5ef9f01))
* use matrix test suite ([0be215e](https://github.com/aeternity/aeproject/commit/0be215e812b31c38bae8e6a8490e1efb28f493b3))


### Refactorings

* improve env command ([18022a4](https://github.com/aeternity/aeproject/commit/18022a40765808643e6607020372720d44709502))


### Miscellaneous

* update default compiler tag ([068b081](https://github.com/aeternity/aeproject/commit/068b081dd7e590955c848b95622b217673670cb0))
* update dependencies ([78be83d](https://github.com/aeternity/aeproject/commit/78be83d76e742be16e737ce3e4466425a622b97d))

## [4.8.2](https://github.com/aeternity/aeproject/compare/v4.8.1...v4.8.2) (2023-08-24)


### Miscellaneous

* remove unneeded await ([cf4b19e](https://github.com/aeternity/aeproject/commit/cf4b19e26949fa660f35efdbbad2322ba0718a66))
* update sdk ([f666101](https://github.com/aeternity/aeproject/commit/f6661011629a7f23bae017987ea82951ac433cae))
* update to latest compiler ([e65237c](https://github.com/aeternity/aeproject/commit/e65237c7bb79795e557ad6c6f99e6433835fbe46))
* upgrade to latest sdk ([6de93f6](https://github.com/aeternity/aeproject/commit/6de93f69f6c3e29685b76a6de756520e7260cfba))

## [4.8.1](https://github.com/aeternity/aeproject/compare/v4.8.0...v4.8.1) (2023-07-18)


### Bug Fixes

* add back wait additional block workaround ([1a135b4](https://github.com/aeternity/aeproject/commit/1a135b46af5984047eaa42e5d81609fcbabc7b0d))


### Miscellaneous

* prepare for fix release 4.8.1 ([b448b44](https://github.com/aeternity/aeproject/commit/b448b445b0d151059fd88a0436e71599be042aad))

## [4.8.0](https://github.com/aeternity/aeproject/compare/v4.7.0...v4.8.0) (2023-07-18)


### Features

* allow rollback to specific height ([670c11e](https://github.com/aeternity/aeproject/commit/670c11e440c38b88cd08428e059392bd05166f63))


### Miscellaneous

* prepare for release 4.8.0 ([5462ea3](https://github.com/aeternity/aeproject/commit/5462ea35234550eaddee2f7590bd3fcd89f00bd7))
* upgrade dependencies ([6f570b3](https://github.com/aeternity/aeproject/commit/6f570b3d7f06154ee9c1e80e105049204871d557))
* upgrade node to v6.11.0 with devmode timout fix ([3c5d558](https://github.com/aeternity/aeproject/commit/3c5d558002ca0e2c1cdbc366a29f41eed7cd7cb8))

## [4.7.0](https://github.com/aeternity/aeproject/compare/v4.6.3...v4.7.0) (2023-07-06)


### Features

* upgrade to compiler 7.4.0 ([72cccf7](https://github.com/aeternity/aeproject/commit/72cccf77a7a157e48b7f364a548105c3f6206252))


### Miscellaneous

* upgrade dependencies ([03a0caa](https://github.com/aeternity/aeproject/commit/03a0caa5da4e32a5e1e2b8e0f028baafb7853ca7))

## [4.6.3](https://github.com/aeternity/aeproject/compare/v4.6.2...v4.6.3) (2023-05-17)


### Miscellaneous

* fix scripts, prepare for 4.6.3 ([06ea397](https://github.com/aeternity/aeproject/commit/06ea397f3ac0b585ee54ca82e8868538c84db02c))

## [4.6.2](https://github.com/aeternity/aeproject/compare/v4.6.1...v4.6.2) (2023-05-16)


### Refactorings

* use typescript to build project, migrate lib to ts ([1f7a164](https://github.com/aeternity/aeproject/commit/1f7a164d60443bc8cbb8b04b93959c452de6f7e2))


### Miscellaneous

* rollback unintended code-style changes ([a4fd777](https://github.com/aeternity/aeproject/commit/a4fd777eb736709a04cf613905a2476a1f1d71d4))
* upgrade dependencies ([3482f75](https://github.com/aeternity/aeproject/commit/3482f7504de2714a24416701d59a876f345579ea))

## [4.6.1](https://github.com/aeternity/aeproject/compare/v4.6.0...v4.6.1) (2023-04-12)


### Bug Fixes

* minor fixes, adjust docs ([abaa364](https://github.com/aeternity/aeproject/commit/abaa36460466ece306d0f31d23901d3b22fb0bee))

## [4.6.0](https://github.com/aeternity/aeproject/compare/v4.5.1...v4.6.0) (2023-04-11)


### Features

* upgrade to compiler image 7.3.0 for ARM64/Apple Silicon support ([83814e2](https://github.com/aeternity/aeproject/commit/83814e276d4e7e71599274f89053bfada6da7703))
* upgrade to sdk 13 beta and compiler 7 ([0b717a5](https://github.com/aeternity/aeproject/commit/0b717a5f3a62a0ca8f03c4f327e2ac4760bd067b))


### Miscellaneous

* prepare for release 4.6.0 ([9910426](https://github.com/aeternity/aeproject/commit/991042609f05df8cb62a82383b824c2c9cf764f5))
* upgrade to final release sdk ([2317283](https://github.com/aeternity/aeproject/commit/23172835bec6e9db4aa83cbbb0ad88322c228aaf))

## [4.5.1](https://github.com/aeternity/aeproject/compare/v4.5.0...v4.5.1) (2023-03-07)


### Miscellaneous

* update dependencies ([fb1578c](https://github.com/aeternity/aeproject/commit/fb1578cd9f0ac2eac6109156a56a69e6f183ed41))
* update to node v6.8.1 ([f247730](https://github.com/aeternity/aeproject/commit/f247730c5f51b910ae962e3a8ef97d7add799c0a))

## [4.5.0](https://github.com/aeternity/aeproject/compare/v4.4.0...v4.5.0) (2023-03-01)


### Features

* add support for node v6.8.0 ([b6b97cd](https://github.com/aeternity/aeproject/commit/b6b97cda85759b83ebf6d57bf8728ee96261be64))


### Miscellaneous

* **deps:** mkdocs version update ([138e5b5](https://github.com/aeternity/aeproject/commit/138e5b5bfc02dadd8cf890cea6043cb10873933f))

## [4.4.0](https://github.com/aeternity/aeproject/compare/v4.3.0...v4.4.0) (2023-01-09)


### Features

* generate .gitignore ([eecf555](https://github.com/aeternity/aeproject/commit/eecf555d9e475ade17292390bb5f16ab549c176e))


### Bug Fixes

* use specific version of node to fix tests ([53a2446](https://github.com/aeternity/aeproject/commit/53a2446b37e615166c71e4cdbdcfc9f172c0823c))


### Miscellaneous

* update dependencies ([e88b1df](https://github.com/aeternity/aeproject/commit/e88b1df37c31a78be4e59e97c4aa80a3620b26ef))


### Refactorings

* remove the need for axios ([ed6cea0](https://github.com/aeternity/aeproject/commit/ed6cea077395631f47fb64f73e613b637ea77eed))
* simplify `getFilesystem` regexes ([61e4dbc](https://github.com/aeternity/aeproject/commit/61e4dbcd7e165bdbfb3350f244560e9bafc80218))

## [4.3.0](https://github.com/aeternity/aeproject/compare/v4.2.1...v4.3.0) (2022-11-04)


### Features

* add image versions in env --info ([d2c9ba8](https://github.com/aeternity/aeproject/commit/d2c9ba822d091a91759376f4078285bcb220e3c9))

## [4.2.1](https://github.com/aeternity/aeproject/compare/v4.2.0...v4.2.1) (2022-09-28)


### Bug Fixes

* add missing stdlib includes in getFilesystem ([c29ae0d](https://github.com/aeternity/aeproject/commit/c29ae0d089991acc682853708a78fc8ca227287a))

## [4.2.0](https://github.com/aeternity/aeproject/compare/v4.1.5...v4.2.0) (2022-08-31)


### Features

* allow usage of native docker-compose without specifying env ([f8577e2](https://github.com/aeternity/aeproject/commit/f8577e270bb6f664180114a3f39e9b5b7f323b98))


### Bug Fixes

* correct escaping to use - in filesystem contracts ([3704bab](https://github.com/aeternity/aeproject/commit/3704bab7f266ae81746770116d682639af5f5fc1))

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
