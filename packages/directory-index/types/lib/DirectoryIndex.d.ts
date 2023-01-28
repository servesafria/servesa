export class DirectoryIndex {
    constructor(creators?: {});
    get entries(): any;
    get items(): any[];
    get(name: any): any;
    has(name: any): any;
    loadDirectory(path: any, from: any, to: any): Promise<void>;
    addItem(name: any, item: any): void;
    createItem(extension: any, name: any, spec: any): Promise<any>;
    entryOf(item: any): any;
    fileOf(item: any): any;
    #private;
}
