export default {
  extends:["store/key/keyv"],
  async onLoad() {
    //console.log('made map')
    this.map = new Map()
  }
}