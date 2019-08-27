## LWC Webpack Plugin

### Usage

```js
// webpack.config.js
const path = require('path');
const LWCWebpackPlugin = require('lwc-webpack-plugin');

module.exports = {
    plugins: [
        new LWCWebpackPlugin({
            namespace: {
                // LWC Namespace with path
                mynamespace: path.resolve('./src/modules/mynamespace')
            }
        }),
    ]
}
```

### Running example locally

```
1. yarn install
2. yarn build:example
3. open index.html
```
