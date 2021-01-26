var previousDiagram = "";

document.getElementById("source").addEventListener("input", updateDiagram);
document.getElementById("download").addEventListener("click", downloadSvg);
document.getElementById("about").addEventListener("click", showHelp);
document.getElementById("close-help").addEventListener("click", closeHelp);
document.getElementById("show-source").addEventListener("click", showSource);
document.getElementById("hide-source").addEventListener("click", hideSource);
document.getElementById("diagram-type").addEventListener("change", typeSelected);

const mermaidConfig = {
    startOnLoad: false,
    theme: "neutral",
    sequence: {
        actorFontSize: 12,
        diagramMarginX: 8,
        diagramMarginY: 8,
        width: 0,
        height: 24,
        noteMargin: 8,
        noteFontSize: 12,
        messageMargin: 16,
        messageFontSize: 12,
        bottomMarginAdj: 3,
        rightAngles: false,
    }
};
mermaid.initialize(mermaidConfig);

const diagrams = {
    classDiagram: ["Animal <|-- Duck",
                   "Animal <|-- Fish",
                   "Animal <|-- Zebra",
                   "Animal : +int age",
                   "Animal : +String gender",
                   "Animal: +isMammal()",
                   "Animal: +mate()",
                   "class Duck{",
                   "    +String beakColor",
                   "    +swim()",
                   "    +quack()",
                   "}",
                   "class Fish{",
                   "    -int sizeInFeet",
                   "    -canEat()",
                   "}",
                   "class Zebra{",
                   "    +foo()",
                   "    +bool is_wild",
                   "    +run()",
                   "}"].join("\n"),
    "graph LR": ["S((Start)) -.-> R[/Request/] ==> P{In cache?}",
                 "P -->|Yes| D[(Database)]",
                 "P -->|No| C(Server)",
                 "D & C --> A[\Response\]",
                 "A -.-> E((End))"
    ].join("\n"),
    "graph TD": ["S((Start)) -.-> R[/Request/] ==> P{In cache?}",
                 "P -->|Yes| D[(Database)]",
                 "P -->|No| C(Server)",
                 "D & C --> A[\Response\]",
                 "A -.-> E((End))"
    ].join("\n"),
    pie: ["title Things not to blame it on",
          '"Sunshine": 30',
          '"Moonlight": 40',
          '"Good Times": 50'
    ].join("\n"),
    sequenceDiagram: ["browser -> server: request",
                      "server -> server: process",
                      "participant database",
                      "note over server,database: add DB calls here",
                      "server --> browser: response ",
                      "note left of browser: display to user"].join("\n")
};

setupFileDrop();
typeSelected();

function splitMultiArrow(src) {
    return src.split("\n")
             .map(line => {
                if (!line.match(/->.*->.*:/)) {
                    return line;
                }

                const [hops, payload] = line.split(/:/);
                const hopList = hops.split("->");
                const decomposedHops = [];
                for (let i = 0 ; i < hopList.length - 1 ; i++) {
                    decomposedHops.push(hopList[i] + "->" + hopList[i + 1] + ":" + payload);
                }

                return decomposedHops.join("\n");
             })
             .join("\n");
}

function extractMacros(src) {
    const macros = {};
    let macro = null;
    let trimmed = src;

    while (macro = trimmed.match(/#defmacro +(\S+)\s*(\S[\s\S]*?)#endmacro/)) {
        trimmed = trimmed.replace(macro[0], "");
        macros[macro[1]] = macro[2];
    }

    return {
        trimmed,
        macros
    };
}

function applyMacros(src, macros) {

    Object.keys(macros).forEach(macro => {
        const regex = new RegExp("#" + macro + ".*", "m");
        let match = regex.exec(src);

        while (match) {
            const args = match[0].split(/\s+/).slice(1);
            let expanded = macros[macro];

            for ( let i = 0; i < args.length; i++ ) {
                let argRegex = new RegExp("\\$" + (i + 1), "g");
                expanded = expanded.replace(argRegex, args[i]);
            }

            src = src.replace(regex, expanded);
            match = regex.exec(src);
        }
    });

    return src;
}

function formatSource(src) {
    const newType = document.getElementById("diagram-type").value;

    if (newType === "sequenceDiagram") {
        const {trimmed, macros} = extractMacros(src);
        src = applyMacros(trimmed, macros);
        src = splitMultiArrow(src);
        src = src.replace(/->/g, "->>");
    }

    return newType + "\n" + src;
}

function updateDiagram() {
    var diagram = document.getElementById("diagram");
    var editor = document.getElementById("editor");
    var src = document.getElementById("source").value;

    if (editor.classList.contains("parse-error")) {
        editor.classList.remove("parse-error");
    }

    try {
        mermaid.mermaidAPI.render("diagram-image", formatSource(src), svg => {
            previousDiagram = svg;
            diagram.innerHTML = svg;
        });
    } catch (e) {
        editor.classList.add("parse-error");
        if (e.name !== "ParseError") {
            console.error(e);
            document.getElementById("ddiagram-image").textContent = "";
            diagram.innerHTML = previousDiagram;
        }
    }
}

function serialise(content, mimeType) {
    let serialised = btoa(content);
    return "data:" + mimeType + ";base64,\n" + serialised;
}

function downloadSvg() {

    let svg = [...document.getElementById("diagram").children].filter(x => x.tagName === "svg")[0];
    svg.setAttribute("version", "1.1");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    desc = document.createElement("desc");
    desc.textContent = document.getElementById("source").value;
    svg.insertBefore(desc, svg.childNodes[0]);

    let link = document.createElement("a");
    link.setAttribute("download", "diagram.svg");
    link.href = serialise(svg.outerHTML, "image/svg+xml");
    document.body.appendChild(link);
    link.click();

    updateDiagram();
}

function showHelp() {
    let popup = document.getElementById("help");
    if (popup.classList.contains("hidden")) {
        popup.classList.remove("hidden");
    }
}

function closeHelp() {
    let popup = document.getElementById("help");
    popup.classList.add("hidden");
}

function showSource() {
    let editor = document.getElementById("editor");
    if (editor.classList.contains("hidden")) {
        editor.classList.remove("hidden");
    }

    let showButton = document.getElementById("show-source");
    if (!showButton.classList.contains("hidden")) {
        showButton.classList.add("hidden");
    }

    let hideButton = document.getElementById("hide-source");
    if (hideButton.classList.contains("hidden")) {
        hideButton.classList.remove("hidden");
    }
}

function hideSource() {
    let editor = document.getElementById("editor");
    if (!editor.classList.contains("hidden")) {
        editor.classList.add("hidden");
    }

    let showButton = document.getElementById("show-source");
    if (showButton.classList.contains("hidden")) {
        showButton.classList.remove("hidden");
    }

    let hideButton = document.getElementById("hide-source");
    if (!hideButton.classList.contains("hidden")) {
        hideButton.classList.add("hidden");
    }
}

function typeSelected() {
    const elem = document.getElementById("diagram-type");
    const source = document.getElementById("source");

    diagrams[elem.oldvalue] = source.value;

    if (diagrams[elem.value]) {
        source.value = diagrams[elem.value];
    } else {
        source.value = "";
    }

    elem.oldvalue = elem.value;
    updateDiagram();
}

function dropHandler(evt) {
    evt.preventDefault();
    const file = evt.dataTransfer.items[0].getAsFile();
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const script = contents
                        .replace(/^.*<desc>/, "")
                        .split(/<\/desc>.*/)[0]
                        .replace(/&gt;/g, ">");
        document.getElementById("source").value = script;
        updateDiagram();
    };
    reader.readAsText(file);
}

function dragoverHandler(evt) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "copy";
}

function setupFileDrop() {
    const dropZone = document.getElementById("editor");
    dropZone.addEventListener("drop", dropHandler, false);
    dropZone.addEventListener("dragenter", dragoverHandler, false);
    dropZone.addEventListener("dragover", dragoverHandler, false);
}
