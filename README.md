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
            },
            // NPM modules
            modules: [
                '@salesforce-ux/design-system'
            ]
        }),
    ]
}
```
