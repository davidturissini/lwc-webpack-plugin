## LWC Webpack Plugin

### Usage
```js
const path = require('path');
const LWCWebpackPlugin = require('lwc-webpack-plugin');

module.exports = {
    plugins:[
        new LWCWebpackPlugin({
            namespace: 'myapp', // LWC Namespace
            directory: path.resolve('./src/modules'), // LWC Modules directory
            extension: '.js' // extension for class file
        }),
    ]
}
```
