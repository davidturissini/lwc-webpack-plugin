import * as path from 'path';
import { Compiler } from 'webpack';
import { ResolverPlugin } from './resolver';
import { ResolverFromNpmPlugin } from './resolver-from-npm';

interface PluginConfig {
    namespace: { [key: string]: string },
    modules: string[]
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
        const { 
            namespace, 
            modules = [],  
        } = this.config;
        const namespaceDirectories = Object.keys(namespace).map((key) => namespace[key]);
        compiler.hooks.environment.tap('lwc-webpack-plugin', () => {
            const resolverPlugin = new ResolverPlugin(namespace);
            const resolverFromNpmPlugin = new ResolverFromNpmPlugin(modules);

            compiler.options.resolve.plugins = [resolverPlugin, resolverFromNpmPlugin];
            compiler.options.resolveLoader.plugins = [resolverPlugin, resolverFromNpmPlugin];

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
