import * as path from 'path';
import { Compiler } from 'webpack';
import { ResolverPlugin } from './resolver';

interface PluginConfig {
    namespace: { [key: string]: string }
}

const EXTENSIONS = [
    '.js',
    '.ts'
];

module.exports = class Plugin {
    config: PluginConfig;
    constructor(config: PluginConfig) {
        this.config = config;
    }
    apply(compiler: Compiler) {
        const { namespace } = this.config;
        const namespaceDirectories = Object.keys(namespace).map((key) => namespace[key]);
        compiler.hooks.environment.tap('lwc-webpack-plugin', () => {
            const resolverPlugin = new ResolverPlugin(namespace);

            compiler.options.resolve.plugins = [resolverPlugin];
            compiler.options.resolveLoader.plugins = [resolverPlugin];

            let rules = compiler.options.module.rules;
            if (rules === undefined) {
                rules = compiler.options.module.rules = [];
            }
        });

        let { alias } = compiler.options.resolve;
        if (alias === undefined) {
            alias = compiler.options.resolve.alias = {};
        }


        // Specify known package aliases
        alias.lwc = path.resolve('./node_modules/@lwc/engine');
        alias['wire-service'] = path.resolve('./node_modules/@lwc/wire-service');

        compiler.options.resolve.extensions.push(...EXTENSIONS);
        compiler.options.module.rules.push({
            test: /\.(js|ts)$/,
            include: namespaceDirectories,
            use: {
                loader: require.resolve('babel-loader'),
                options: {
                    plugins: [
                        require.resolve('@lwc/babel-plugin-component')
                    ],
                    presets: [
                        require.resolve('@babel/preset-typescript')
                    ]
                }
            }
        });

        compiler.options.module.rules.push({
            test: /\.(html|css)$/,

            include: [
                ...namespaceDirectories,
                path.resolve(__dirname, './defaults')
            ],
            use: {
                loader: require.resolve('./loader'),
                options: {
                    namespace: (path: string) => {
                        return 'hey';
                    },
                    extMap: EXTENSIONS.reduce((seed, ext) => {
                        seed[ext] = '.js';
                        return seed;
                    }, {})
                }
            }
        });
    }
}
