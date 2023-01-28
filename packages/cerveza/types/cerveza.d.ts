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
export type cbReducer = (values: any[], objects: obj[]) => any;
/**
 * Create a reducer.
 */
export type cbCreateReducer = (argument?: any) => any;
declare function cerveza(objects: obj[], reducers: obj): {};
declare namespace cerveza { }
/**
 * @param  {obj<cbCreateReducer>} {named}={}
  */
declare function _cerveza({ named: _named }?: obj<cbCreateReducer>): (objects: obj[], reducers: obj) => {};
