export class Indexer {
    constructor(config: any);
    config: {
        onEntriesAdded: any;
        extension: string;
        indexName: string;
        autoIndex: boolean;
        importer: (x: any) => any;
        pickExtends: (x: any) => any;
    };
    entries: Map<any, any>;
    /**
     * Get entry by name
     * @param  {string} name
     * @return {Entry}
     */
    getEntry: (name: string) => Entry;
    getSpec: (name: any) => obj;
    getParentName: (name: any) => any;
    /**
     * Add an entry with spec
     * @param   {string} name
     * @param   {obj} spec
     * @return  {Entry}
     */
    add(name: string, spec?: obj): Entry;
    /**
     * Add an entry from file
     * @param   {string} name
     * @param   {string} file
     * @return  {Entry}
     */
    addFile(name: string, file: string): Entry;
    /**
     * Load specs from a directory, with recursion
     * @param  {string} path - Directory to load
     * @param  {object} options
     * @param  {string} options.extension - Extension of files to load
     * @param  {string} options.mountAt="" - Where to append the loaded files
     */
    loadDirectory: (path: string, { extension, mountAt: mountAt }?: {
        extension: string;
        mountAt: string;
    }) => Promise<Entry[]>;
    #private;
}
declare class Entry {
    /**
     * @param  {Entry} container
     * @param  {string} slug
     * @param  {obj} spec
     */
    constructor(container: Entry, slug: string, spec: obj);
    get children(): any[];
    get childrenByName(): {};
    child(name: any): any;
    content(name: any): any;
    container: Entry;
    containers: any[];
    slug: string;
    slugs: any[];
    name: string;
    spec: obj;
    parents: any[];
    parent: any;
    relative: string;
    #private;
}
export {};
