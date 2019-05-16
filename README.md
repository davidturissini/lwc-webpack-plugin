## LWC Webpack Plugin

### Usage
```js
// webpack.config.js
const path = require('path');
const LWCWebpackPlugin = require('lwc-webpack-plugin');

module.exports = {
    plugins:[
        new LWCWebpackPlugin({
            namespace: {
                // LWC Namespace with path
                myapp: path.resolve('./src/modules/myapp')
        }),
    ]
}
```
