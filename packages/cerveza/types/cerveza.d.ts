declare function _exports(objects: obj[], reducers: obj): {};
declare namespace _exports {
    export { cerveza };
    export { _cerveza as create };
    export { cbReducer, cbCreateReducer };
}
export = _exports;
/**
 * Create a reducer.
 */
export type cbReducer = (values: any[], objects: any[]) => any;
/**
 * Create a reducer.
 */
export type cbCreateReducer = (argument?: any) => any;
declare function cerveza(values: any[], processor: any): {};
declare namespace cerveza { }
/**
 * @param  {obj<cbCreateReducer>} {named}={}
  */
declare function _cerveza({ define: _named }?: obj<cbCreateReducer>): (values: obj[], processor: any) => {};
