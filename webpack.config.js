const path = require('path');
const LWCWebpackPlugin = require('./dist/main')

module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    mode: 'development',
    plugins: [
        new LWCWebpackPlugin({
            namespace: {
                // LWC namespace with path
                my: path.resolve('./modules/my')
            },
            modules: [
                '@salesforce-ux/design-system'
            ]
        }),
    ]
};
