#!/bin/bash

if [[ ! -e public ]] ; then
    mkdir public
fi

cp index.html public/
cp style.css public/
cp manage-input.js public/
cp favicon.ico public/

#if [[ ! -e public/mermaid.min.js ]] ; then
    curl https://unpkg.com/mermaid@8.6.4/dist/mermaid.min.js > public/mermaid.min.js
#fi
