# forgae-utils

## Install 

```npm install forgae-utils
```

## Usage
`forgae-utils` is a package giving helper functions mainly for working with files. Most widely used one is `readFileRelative(relativePath, fileEncoding)`

##### readFileRelative Example
```javascript
const contractSource = utils.readFileRelative(config.contractSourceFile, "utf-8");
const compiledContract = await client.contractCompile(contractSource, {
	gas: config.gas
})
```