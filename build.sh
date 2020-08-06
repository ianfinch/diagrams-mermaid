#!/bin/bash

if [[ ! -e public ]] ; then
    mkdir public
fi

cp index.html public/
cp style.css public/
cp manage-input.js public/
cp favicon.ico public/

if [[ ! -e mermaid ]] ; then
    git clone https://github.com/mermaid-js/mermaid.git
fi
cp mermaid/dist/mermaid.min.js public/
