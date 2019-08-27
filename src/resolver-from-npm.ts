import path from 'path';
import { 
    resolveModules, 
    ModuleRecord,
} from '@lwc/module-resolver';

const pluginName = 'lwc-module-resolver-from-npm';
export type RegistryMap = { [key: string]: { entry: string }};

export class ResolverFromNpmPlugin {
    registryMap: RegistryMap
    constructor(modules: ModuleRecord[]) {
        this.registryMap = resolveModules({
            rootDir: path.resolve('./'),
            modules,
        }).reduce((map, m) => ((map[m.specifier] = m), map), {});
    }

    apply(resolver) {
        resolver.hooks.module.tapAsync(pluginName, (req, ctx, cb) =>
            this.resolveModule(resolver, req, ctx, cb),
        ); 
    }

    resolveModule(resolver, req, ctx, cb) {
        const { request, query } = req;
        if (this.registryMap[request]) {
            return cb(null, {
                path: this.registryMap[request].entry,
                query,
                file: true,
                resolved: true,
            });
        } 
        cb();
    }
}
