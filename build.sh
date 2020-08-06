#!/bin/bash

if [[ ! -e public ]] ; then
    mkdir public
fi

cp index.html public/
cp style.css public/
cp manage-input.js public/
cp favicon.ico public/

if [[ ! -e public/mermaid.min.js ]] ; then
    curl https://cdn.jsdelivr.net/npm/mermaid > public/mermaid.min.js
fi
