import * as path from 'path';

const EMPTY_STYLE = path.resolve(__dirname, 'defaults', 'empty.css');
const EMPTY_TEMPLATE = path.resolve(__dirname, 'defaults', 'empty.html');

const EXTENSIONS = [
    '.js',
    '.ts'
];

function getExtension(fileSystem: any, directoryPath: string, fileName: string) {
    return EXTENSIONS.find((extension) => {
        const pathWithExtension = `${directoryPath}/${fileName}${extension}`;
        // TODO: Use async version of state instead of try catch?
        try {
            fileSystem.statSync(pathWithExtension);
            return true;
        } catch (e) {
            return false;
        }
    });
}

// Returns true if the id respect module scheme
function isValidModuleName(id) {
    return id.match(/^(\w+\/)(\w+)$/);
}

// Returns module name and namespace from id
function getInfoFromId(id) {
    const [ns, ...rest] = id.split('/');
    return {
        ns,
        name: rest.join('/'),
    };
}



export class ResolverPlugin {
    directory: string;
    namespace: string[];
    constructor(namespace: string[], directory: string) {
        this.directory = directory;
        this.namespace = namespace;
    }
    apply(resolver) {
        resolver.hooks.module.tapAsync('lwc-module-resolver', (req, ctx, cb) =>
            this.resolveModule(resolver, req, ctx, cb),
        );

        resolver.hooks.file.tapAsync('lwc-file-resolver', (req, ctx, cb) => this.resolveFile(resolver, req, ctx, cb));
    }

    resolveModule(resolver, req, ctx, cb) {
        const { fileSystem } = resolver;
        const { directory } = this;

        const { request, query } = req;

        if (!isValidModuleName(request)) {
            return cb();
        }

        const { ns, name } = getInfoFromId(request);
        const directoryPath = path.resolve(directory, ns, name);
        const ext = getExtension(fileSystem, directoryPath, name);
        const lwcModuleEntry = path.resolve(directoryPath, `${name}${ext}`);
        fileSystem.stat(lwcModuleEntry, err => {
            if (err !== null && err.code === 'ENOENT') {
                return cb();
            }

            return cb(err, {
                path: lwcModuleEntry,
                query,
                file: true,
                resolved: true,
            });
        });
    }

    resolveFile(resolver, req, ctx, cb) {
        const { fileSystem } = resolver;

        const { path: resourcePath, query } = req;

        let potentialDefault;
        const ext = path.extname(resourcePath);
        if (ext === '.css') {
            potentialDefault = EMPTY_STYLE;
        } else if (ext === '.html') {
            potentialDefault = EMPTY_TEMPLATE;
        }

        if (potentialDefault === undefined) {
            return cb();
        }

        fileSystem.stat(resourcePath, err => {
            if (err !== null && err.code === 'ENOENT') {
                return cb(null, {
                    path: potentialDefault,
                    query,
                    file: true,
                    resolved: false,
                });
            }

            return cb();
        });
    }
}
