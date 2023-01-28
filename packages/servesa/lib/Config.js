
import { resolve } from "path";
import { existsSync as exists, readFileSync as readFile } from "fs";
import { mergeObject, mergeObjects as merge } from "json-merger"
import { report  } from "@servesa/utils";

function resolveConfigFile(root) {
  let files = [
    'servesa.yaml',
    'servesa.json',
    
  ]
  files = files.map(f=>resolve(root,f));
  let file = files.find(exists)
  if (!file) {
    report(`Could not find servesa config. I tried:\n- ${files.join('\n- ')}`)
    process.exit(-1)
  }
  return file
}

export function configure(root=".") {
  root = resolve(".", root );
  let configFile = resolveConfigFile(root);
  report('Reading config from',configFile)
  let config = mergeObject({
    $merge: {
      source: defaultConf(root),
      with: {
        $import: configFile
      }
    }
  })
  return config;
} 

function defaultConf(root) {
  return {
    root,
    external:{},
    server: {
      origin:'http://*:3000'
    },
    secret: "servesa_secret",
    paths: {
      data: ".data",
      cache: ".cache",
      scripts: "scripts"
    },
    defaultSkin: 'default',
    services: []
  } 
}