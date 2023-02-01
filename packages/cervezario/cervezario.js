import { Cervezario } from "./src/Cervezario.js"

export { Indexer } from "./src/Indexer.js"
export { Collector } from "./src/Collector.js"
export { Cervezario } from "./src/Cervezario.js"

export function cervezario(conf) {
  return new Cervezario(conf)
}