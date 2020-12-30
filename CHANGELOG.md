# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.8.0-next.18](https://github.com/sossejs/sosse/compare/v0.8.0-next.17...v0.8.0-next.18) (2020-12-30)


### ⚠ BREAKING CHANGES

* rework isDev env and add cli -p option

### Features

* rework isDev env and add cli -p option ([0ab0ac2](https://github.com/sossejs/sosse/commit/0ab0ac28344784e9651d2291dca75e0f5d513db8))


### Bug Fixes

* always use hydrate from preact-iso for client rendering ([fb58ae5](https://github.com/sossejs/sosse/commit/fb58ae55b0e418f9730923b870fe5226a0ccbd19))
* use terser for production client builds ([1dcd1ea](https://github.com/sossejs/sosse/commit/1dcd1ea120f2d0f270f06736b7660385a7b21474))

## [0.8.0-next.17](https://github.com/sossejs/sosse/compare/v0.8.0-next.16...v0.8.0-next.17) (2020-12-29)


### Bug Fixes

* correct production clientAssets css path ([0b1899f](https://github.com/sossejs/sosse/commit/0b1899f0422ecedc1ae088aae9909801207a6bea))

## [0.8.0-next.16](https://github.com/sossejs/sosse/compare/v0.8.0-next.15...v0.8.0-next.16) (2020-12-29)


### ⚠ BREAKING CHANGES

* add SOSSE rollup build globals
* rework html and render functions

### Features

* add SOSSE rollup build globals ([a7a57ef](https://github.com/sossejs/sosse/commit/a7a57ef0de7cd582c7a2422910dc647c51d3be7c))
* implement source-map-support ([0f2f509](https://github.com/sossejs/sosse/commit/0f2f50983052639f7ec83861b4c6d694913b52af))
* rework html and render functions ([36df444](https://github.com/sossejs/sosse/commit/36df44421a2514f2b55e33a146c739a5738ff5ca))


### Bug Fixes

* move preact-iso isodata into body ([7e13678](https://github.com/sossejs/sosse/commit/7e13678f58215973de1031f1e7f5497a44081780))

## [0.8.0-next.15](https://github.com/sossejs/sosse/compare/v0.8.0-next.14...v0.8.0-next.15) (2020-12-25)


### Bug Fixes

* ignore subfolders in client assets ([7d2f6d2](https://github.com/sossejs/sosse/commit/7d2f6d235225d6323ab0d6f3352829d5ecbe2170))

## [0.8.0-next.14](https://github.com/sossejs/sosse/compare/v0.8.0-next.13...v0.8.0-next.14) (2020-12-25)


### Features

* add fastify decorate and serverFactory ([bd0619e](https://github.com/sossejs/sosse/commit/bd0619e43d6e8cbd5383b10b5e918a2783170fb9))

## [0.8.0-next.13](https://github.com/sossejs/sosse/compare/v0.8.0-next.12...v0.8.0-next.13) (2020-12-24)


### Bug Fixes

* move not bundleable dependencies out of dev ([a0e36c3](https://github.com/sossejs/sosse/commit/a0e36c30a53d9d344a43b7dddb56e165d83f5dc3))

## [0.8.0-next.12](https://github.com/sossejs/sosse/compare/v0.8.0-next.11...v0.8.0-next.12) (2020-12-24)


### Bug Fixes

* upgrade to current microbundle and fix types dist ([30286f3](https://github.com/sossejs/sosse/commit/30286f3c53ccceb412531fa6a069313b7bd7ac61))

## [0.8.0-next.11](https://github.com/sossejs/sosse/compare/v0.8.0-next.10...v0.8.0-next.11) (2020-12-24)


### ⚠ BREAKING CHANGES

* rework preact components and ssr with preact-iso
* rename uni module to iso

### Features

* rework ctx html functions ([5c4695b](https://github.com/sossejs/sosse/commit/5c4695b1996030a9822a2b097c9c53b80c611cd9))
* rework preact components and ssr with preact-iso ([cc1d948](https://github.com/sossejs/sosse/commit/cc1d948ff45486fbbc02588168889d43d5492344))


* rename uni module to iso ([e778555](https://github.com/sossejs/sosse/commit/e778555a9f2f1da94b6483a654959a14fa579e05))

## [0.8.0-next.10](https://github.com/sossejs/sosse/compare/v0.8.0-next.9...v0.8.0-next.10) (2020-12-16)

## [0.8.0-next.9](https://github.com/sossejs/sosse/compare/v0.8.0-next.8...v0.8.0-next.9) (2020-12-13)


### Features

* update sosse init template ([a8d1554](https://github.com/sossejs/sosse/commit/a8d15547b5ceb3812b9654b6986c541cf3290599))


### Bug Fixes

* dont clear node_modules from require cache ([c9297d0](https://github.com/sossejs/sosse/commit/c9297d099262a2e5df25fb62786cc14f0185a867))

## [0.8.0-next.8](https://github.com/sossejs/sosse/compare/v0.8.0-next.7...v0.8.0-next.8) (2020-12-13)


### Bug Fixes

* improve ctx event listeners memory usage ([b7488b8](https://github.com/sossejs/sosse/commit/b7488b8d4bf9822d32a12a4409d361a11b571815))
* only cache clear modules from the project folder ([5519d9a](https://github.com/sossejs/sosse/commit/5519d9a0210812e5628ad839a98880238b0b6208))

## [0.8.0-next.7](https://github.com/sossejs/sosse/compare/v0.8.0-next.6...v0.8.0-next.7) (2020-09-16)


### Features

* export Ctx for consumption ([3b3cb6f](https://github.com/sossejs/sosse/commit/3b3cb6ff5424d53c0b09f5cd71328b49a998b93e))

## [0.8.0-next.6](https://github.com/sossejs/sosse/compare/v0.8.0-next.5...v0.8.0-next.6) (2020-09-16)


### ⚠ BREAKING CHANGES

* move context depended functions to context

### Features

* **html:** add data param and remove side effect based data ([b564757](https://github.com/sossejs/sosse/commit/b56475798206b57e247f6108172fb61d9ff86f81))
* move context depended functions to context ([df8ae5c](https://github.com/sossejs/sosse/commit/df8ae5c73418d6322bc8b25ff80ca9c625e26e15))

## [0.8.0-next.5](https://github.com/sossejs/sosse/compare/v0.8.0-next.4...v0.8.0-next.5) (2020-08-18)

## [0.8.0-next.4](https://github.com/sossejs/sosse/compare/v0.8.0-next.3...v0.8.0-next.4) (2020-08-18)


### ⚠ BREAKING CHANGES

* only replace NODE_ENV in client bundles
* remove sosseDev ref from ctx assets
* split assets into js and css

### Features

* split assets into js and css ([3e73b38](https://github.com/sossejs/sosse/commit/3e73b3880bd3d9de771f209974e703f6a904be09))
* try to build the server in production when main is missing ([09d12c9](https://github.com/sossejs/sosse/commit/09d12c93c13bce928d6bfaf39b8dfa970be79219))


### Bug Fixes

* dont bundle client if assets already exist ([338ea4a](https://github.com/sossejs/sosse/commit/338ea4a14c4d57d623073b762b08c0f919271267))


* only replace NODE_ENV in client bundles ([d754f13](https://github.com/sossejs/sosse/commit/d754f130647f2e72c97bad0a9645ab7c2465edf8))
* remove sosseDev ref from ctx assets ([3738e09](https://github.com/sossejs/sosse/commit/3738e090dd4ea843d05915d8ca62cab6bd975b89))

## [0.8.0-next.3](https://github.com/sossejs/sosse/compare/v0.8.0-next.2...v0.8.0-next.3) (2020-08-09)


### ⚠ BREAKING CHANGES

* remove html attribute from asset, but add path and props

### Features

* export Asset type ([277fe97](https://github.com/sossejs/sosse/commit/277fe970648a6830103458ce6869f3f6d6438592))
* remove html attribute from asset, but add path and props ([d74a895](https://github.com/sossejs/sosse/commit/d74a8956fb789ac457e4aa6a007810dadf86f1d1))

## [0.8.0-next.2](https://github.com/sossejs/sosse/compare/v0.8.0-next.1...v0.8.0-next.2) (2020-08-05)


### Bug Fixes

* **create-type-proxies:** resolve module dts path with moduleName ([5c95a05](https://github.com/sossejs/sosse/commit/5c95a05f794086f774585b70e5db78e0671a67a6))

## [0.8.0-next.1](https://github.com/sossejs/sosse/compare/v0.8.0-next.0...v0.8.0-next.1) (2020-08-05)

## [0.8.0-next.0](https://github.com/sossejs/sosse/compare/v0.7.2...v0.8.0-next.0) (2020-08-03)


### ⚠ BREAKING CHANGES

* implement sosse api and cli, rework hsr api

### Features

* implement sosse api and cli, rework hsr api ([d295db4](https://github.com/sossejs/sosse/commit/d295db472f533f9fd74bcc3e14b586d6efffaba0))

### [0.7.2](https://github.com/sossejs/sosse/compare/v0.7.1...v0.7.2) (2020-07-25)

### [0.7.1](https://github.com/sossejs/sosse/compare/v0.7.0...v0.7.1) (2020-07-18)

## [0.7.0](https://github.com/sossejs/sosse/compare/v0.6.0...v0.7.0) (2020-07-17)


### Bug Fixes

* **hydratedContext:** make sure that useEffect only gets called once ([250c20d](https://github.com/sossejs/sosse/commit/250c20d24cba8fcfd6a45f8f4c00b2eb28c5cfec))

## [0.6.0](https://github.com/sossejs/sosse/compare/v0.5.0...v0.6.0) (2020-07-16)


### ⚠ BREAKING CHANGES

* implement valueRef api for hydratedContext

### Features

* implement valueRef api for hydratedContext ([2f7f771](https://github.com/sossejs/sosse/commit/2f7f77182bbb964fdf21ec571c56498f6a842b09))

## [0.5.0](https://github.com/sossejs/sosse/compare/v0.4.1...v0.5.0) (2020-07-15)


### ⚠ BREAKING CHANGES

* **client-plugin:** use modern output by default

### Features

* implement htmlData ([b4f91c6](https://github.com/sossejs/sosse/commit/b4f91c6a09064c466eb3485a13002e0cc13d8ad0))
* implement interactive components ([960c88f](https://github.com/sossejs/sosse/commit/960c88fd0742381e45923ccb64f76c5ea458bd6a))
* implement isNode api ([6e41b96](https://github.com/sossejs/sosse/commit/6e41b96ea3051e72d51e4bc2413af70b86f539ba))
* **client-plugin:** use modern output by default ([0c689e2](https://github.com/sossejs/sosse/commit/0c689e26f1e87aa5f7a6096a583cd4685ad4a91b))

### [0.4.1](https://github.com/sossejs/sosse/compare/v0.4.0...v0.4.1) (2020-06-29)


### Bug Fixes

* make clear-module external again, now for real ([d889399](https://github.com/sossejs/sosse/commit/d8893998eeb91133c0fbeac9c62cf79cc0f88692))

## [0.4.0](https://github.com/sossejs/sosse/compare/v0.3.0...v0.4.0) (2020-06-29)


### Bug Fixes

* make clear-module external again ([256c8f1](https://github.com/sossejs/sosse/commit/256c8f1ffaa41de3c9664151e33445d58ffd7c34))

## [0.3.0](https://github.com/sossejs/sosse/compare/v0.2.0...v0.3.0) (2020-06-29)


### Features

* make chokidar, otion and ws optional ([45fb58c](https://github.com/sossejs/sosse/commit/45fb58c4a5e760d0ad6f30f4549cc92f0dc20a39))

## [0.2.0](https://github.com/sossejs/sosse/compare/v0.1.0...v0.2.0) (2020-06-28)


### ⚠ BREAKING CHANGES

* rework otion integration and html bodyAttrs

### Features

* **client-plugin:** implement exitAfterBuild workflow ([914dd3b](https://github.com/sossejs/sosse/commit/914dd3becf424bfc00fcdd8d394aec723cb5401a))
* **client-plugin:** log microbundle output ([f62894c](https://github.com/sossejs/sosse/commit/f62894c0e4c59343b78c54603403f9a3ff1eedc6))
* **client-plugin:** use current NODE_ENV for bundle NODE_ENV ([c9c80ce](https://github.com/sossejs/sosse/commit/c9c80ce2fad0d1311393cf85ddc957a87122ee67))
* **dev-socket:** add sourcemap for client js ([7ef4819](https://github.com/sossejs/sosse/commit/7ef48193da949de3cf4f4ff3253e344b97382fdb))
* implement client assets production cache ([c993a09](https://github.com/sossejs/sosse/commit/c993a09fe2e15aac2aa2f791f9dc947486a60082))
* implement client bundle plugin ([7963e5a](https://github.com/sossejs/sosse/commit/7963e5a10a5edc7abcdb53a54da831e45b0458eb))
* implement otion css in js ssr ([d1ee805](https://github.com/sossejs/sosse/commit/d1ee805076a878809ad582292b0da1156c8662db))
* rework client plugin with microbundle js api ([d7fb37f](https://github.com/sossejs/sosse/commit/d7fb37f341fdfdd17b179c4f40315e7ad96f7734))


* rework otion integration and html bodyAttrs ([c8b9b3e](https://github.com/sossejs/sosse/commit/c8b9b3e749e597ac2ce7fe10ac0d9acb034a1788))

## [0.1.0](https://github.com/sossejs/sosse/compare/v0.0.1...v0.1.0) (2020-06-11)


### Features

* implement pending restarts ([45eda93](https://github.com/sossejs/sosse/commit/45eda938e1cb2f50b7ff42cdec874950b96b2833))

### 0.0.1 (2020-06-10)


### Features

* basic implementation ([2839ac0](https://github.com/sossejs/sosse/commit/2839ac076b6d8e4fcfe03ff440336e89d272023e))
