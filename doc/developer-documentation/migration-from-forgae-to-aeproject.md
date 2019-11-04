# Migratе Forgae to AEproject

There are no breaking changes introduced in this change, however please take a look at what you should be aware of while migrating your project.

- First uninstall your deprecated already **forgae**
```text
npm uninstall -g forgae
```

- You need to install **aeporject**

```text
npm install -g aeproject
```

- Then you need to go to your project root directory and run:

```
aeproject init --update
```

This will install all your obligatory dependencies in order to run your **aeproject** commands smoothly. In the process there will be prompt messages, which will require your explicit consent in order to replace some files in the current directory.
The command will **overwrite** the following files for you, so you will be up to date with the latest configurations of the node and compiler:
    - docker-compose.yml
    - docker-compose.compiler.yml
    - docker dorectory


- The last thing you should be aware of is the `deploy.js` file. (Initially located in /deployment directory)
The change you should apply to the file is as follows

##### From
```javascript
const Deployer = require('forgae-lib').Deployer;
```

##### To
```javascript
const Deployer = require('aeproject-lib').Deployer;
```

We chose to deliberately not overwrite this file as this could bring much more troubles, than convenience