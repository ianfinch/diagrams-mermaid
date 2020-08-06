var previousDiagram = "";

document.getElementById("source").addEventListener("input", updateDiagram);
document.getElementById("download").addEventListener("click", downloadSvg);
document.getElementById("about").addEventListener("click", showHelp);
document.getElementById("close-help").addEventListener("click", closeHelp);
document.getElementById("show-source").addEventListener("click", showSource);
document.getElementById("hide-source").addEventListener("click", hideSource);

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
//mermaid.mermaidAPI.initialize(mermaidConfig);
mermaid.initialize(mermaidConfig);

setupFileDrop();
updateDiagram();

function formatSource(src) {
    return "sequenceDiagram\n" + 
           src.replace(/->/g, "->>");
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
            svg = svg.replace(".messageText{fill:#333;stroke:#333;}", ".messageText{fill:#333;}");
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
    let embeddedStyle = document.createElement("style");
    desc = document.createElement("desc");
    desc.textContent = document.getElementById("source").value;
    svg.insertBefore(desc, svg.childNodes[0]);
    console.log(svg);

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
