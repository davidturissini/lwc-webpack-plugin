const path = require('path');
const fs = require('fs');

interface PluginConfig {
    namespace: string;
    directory: string;
    extension: string;
}

module.exports = class Plugin {
    config: PluginConfig;
    constructor(config: PluginConfig) {
        this.config = config;
    }
    apply(compiler) {
        const { directory, namespace, extension } = this.config;
        const lwcAliases = fs.readdirSync(directory).reduce((seed, dirName) => {
            seed[`${namespace}/${dirName}`] = path.resolve(directory, dirName, `${dirName}${extension}`);
            return seed;
        }, {});

        compiler.hooks.afterPlugins.tap('lwc-webpack-plugin', (compiler) => {
            compiler.options.resolve.alias = {
                lwc: path.resolve('./node_modules/@lwc/engine/dist/modules/es2017/engine.js'),
                ...lwcAliases,
            };

            compiler.options.module.rules = [{
                test: /(css|html)$/,
                loader: require.resolve('./loader'),
                options: {
                    namespace,
                    lwcAliases
                }
            },{
                test: /\.(js?)$/,
                loader: require.resolve('babel-loader'),
                options: {
                    plugins: [
                        '@lwc/babel-plugin-component'
                    ]
                }
            }]
        });
    }
}
