const path = require('path');
import * as fs from 'fs';
import { Compiler } from 'webpack';

interface PluginConfig {
    namespace: string;
    directory: string;
}

const EXTENSIONS = [
    '.js',
    '.ts'
];

function getExtension(directoryPath: string, fileName: string) {
    return EXTENSIONS.find((extension) => {
        const pathWithExtension = `${directoryPath}/${fileName}${extension}`;
        return fs.existsSync(pathWithExtension);
    });
}

class ResolverPlugin {
    directory: string;
    namespace: string;
    constructor(namespace: string, directory: string) {
        this.directory = directory;
        this.namespace = namespace;
    }
    apply(resolver) {
        const { directory, namespace } = this;
        resolver.hooks.module.tapAsync('lwc-resolver', (request, resolveContext, callback) => {
            const split = request.request.split('/');

            if (split[0] === namespace) {
                const fullDir = `${directory}/${request.request.replace(namespace + '/', '')}`;
                const { name: fileName } = path.parse(request.request);
                const extension = getExtension(fullDir, fileName);
                const fullPath = resolver.join(fullDir, `${fileName}${extension}`);

                const obj = {
                    ...request,
                    request: fullPath,
                };

                return resolver.doResolve(resolver.ensureHook('resolve'), obj, "using path: " + fullPath, resolveContext, callback);
            }

            callback();
        });
    }
}

function generateModuleRuleTest(directory: string) {
    const ext = '(' + EXTENSIONS.join('|').replace(/\./g, '') + ')$';

    return new RegExp(`${directory}(.+)\.${ext}`);
}

module.exports = class Plugin {
    config: PluginConfig;
    constructor(config: PluginConfig) {
        this.config = config;
    }
    apply(compiler: Compiler) {
        const { directory, namespace } = this.config;

        compiler.hooks.environment.tap('lwc-webpack-plugin', () => {
            const resolverPlugin = new ResolverPlugin(namespace, directory);

            compiler.options.resolve.plugins = [resolverPlugin];
            compiler.options.resolveLoader.plugins = [resolverPlugin];

            let rules = compiler.options.module.rules;
            if (rules === undefined) {
                rules = compiler.options.module.rules = [];
            }
        });

        compiler.options.resolve.alias = {
            lwc: path.resolve('./node_modules/@lwc/engine/dist/modules/es2017/engine.js'),
        };

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
