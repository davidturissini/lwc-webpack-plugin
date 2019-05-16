import * as path from 'path';
import { Compiler } from 'webpack';
import { ResolverPlugin } from './resolver';

interface PluginConfig {
    namespace: string | string[];
    directory: string;
}

const EXTENSIONS = [
    '.js',
    '.ts'
];

function generateModuleRuleTest(directory: string) {
    const ext = '(' + EXTENSIONS.join('|').replace(/\./g, '') + ')$';

    return new RegExp(`${directory}(.+)\.${ext}`);
}

function namespaceArray(namespace: string | string[]): string[] {
    if (typeof namespace === 'string') {
        return [namespace];
    }
    return namespace;
}

module.exports = class Plugin {
    config: PluginConfig;
    constructor(config: PluginConfig) {
        this.config = config;
    }
    apply(compiler: Compiler) {
        const { directory } = this.config;
        const namespace = namespaceArray(this.config.namespace);

        compiler.hooks.environment.tap('lwc-webpack-plugin', () => {
            const resolverPlugin = new ResolverPlugin(namespace, directory);

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
            test: generateModuleRuleTest(directory),
            loader: require.resolve('babel-loader'),
            options: {
                plugins: [
                    require.resolve('@lwc/babel-plugin-component')
                ],
                presets: [
                    require.resolve('@babel/preset-typescript')
                ]
            }
        });

        compiler.options.module.rules.push({
            test: /\.(html|css)$/,
            loader: require.resolve('./loader'),
            include: [
                directory,
                path.resolve(__dirname, './defaults')
            ],
            options: {
                namespace,
                extMap: EXTENSIONS.reduce((seed, ext) => {
                    seed[ext] = '.js';
                    return seed;
                }, {})
            }
        });
    }
}
