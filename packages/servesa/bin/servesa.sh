#!/bin/bash
echo HYYDDDD
real=$(realpath $0)
dir=$(dirname $real)

serve() {
  cd $dir/..
  tsx --tsconfig ./tsconfig.json bin/start-servesa.js $root
  exit
}

dev() {
  cd $dir/..
  #npx tsx watch bin/servesa-start.js $root
  echo tsconfig $tsconfig
  export NODE_PATH=$NODE_PATH:$root/node_modules 
  echo $NODE_PATH
  tsx watch --tsconfig $tsconfig bin/start-servesa.js $root
  exit
}

case $# in
0)
  root=$(realpath .)
  serve
  ;;
1)
  cmd=$1
  root=$(realpath .)
  ;;
2)
  cmd=$1
  root=$(realpath $2)
  ;;
*)
  echo too many args
  exit
  ;;
esac

tscofing=$(realpath ./tsconfig.json)
if [ -f $root/tsconfig.json ]; then
  tsconfig=$(realpath $root/tsconfig.json)
fi

case $cmd in
serve)
  serve
  ;;
dev)
  dev
  ;;
*)
  if [[ $# > 1 ]];
  then
    echo no such command $cmd
    echo -1
  else
    root=$(realpath $cmd)
    serve
  fi
  ;;
esac
