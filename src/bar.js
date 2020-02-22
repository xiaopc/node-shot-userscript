import Simmer from 'simmerjs'

import { throttle, clearEventBubble } from './util';
import i18n from './i18n';

const text = i18n[navigator.language] ? i18n[navigator.language] : i18n["zh-CN"];

const barHTML = `
    <p>${text.selectTooltip}: 
        <button id="node-shot-bar-switch" title="${text.selectButtonTooltip}">${text.selectButton}</button>
    </p>
    <p>${text.selectorTextTooltip}: </p>
    <p>
        <textarea id="node-shot-bar-selector"></textarea>
    </p>
    <p>${text.exportTooltip}
        <button class="node-shot-bar-out" data-type="png">PNG</button>
        <button class="node-shot-bar-out" data-type="jpg">JPG</button>
        <button class="node-shot-bar-out" data-type="svg">SVG</button>
    </p>
    <p>
        <input type="checkbox" id="node-shot-bar-delay">
        <label for="node-shot-bar-delay">${text.delayCheckbox}</label>
    </p>
`;

const barCSS = `
    #node-shot-bar {
        z-index: 9999;
        position: fixed;
        top: 20px;
        right: 20px;
        width: 220px;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(3px);
        border: 1px solid #28A745;
        border-radius: 5px;
        font-size: 13px;
    }
    #node-shot-bar p {
        line-height: 2.2;
        margin: 0;
    }
    #node-shot-bar button {
        background: rgba(255, 255, 255, 0.5);
        color: #4FC08D;
        border: 1px solid #ccc;
        line-height: 1.4;
        padding: 0 8pt;
        border-radius: 1em;
        outline: none;
    }
    #node-shot-bar button:hover, #node-shot-bar button.active {
        background: #4FC08D;
        border-color: #4FC08D;
        color: #fff;
    }
    #node-shot-bar-selector {
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid #ccc;
        line-height: 1.1;
        max-width: 100%;
        min-width: 100%;
        min-height: 3em;
    }
`;

const simmer = new Simmer()

export default {
    _callback: null,
    _isMouseSelecting: false,
    _isTextAreaSelecting: false,
    _selectedNode: null,
    _selectedNodeParents: [],
    selectedNodeStyleCache: "",
    _selector: "",
    moveListener: null,
    clickListener: null,
    keyupListener: null,
    init(callback) {
        this._callback = callback;

        let styleNode = document.createElement("style");
        styleNode.innerHTML = barCSS;
        document.body.appendChild(styleNode);

        let divNode = document.createElement("div");
        divNode.id = "node-shot-bar";
        divNode.innerHTML = barHTML;
        document.body.appendChild(divNode);

        Object.defineProperty(this, "selectedNode", {
            get: () => this._selectedNode,
            set: (target) => {
                if ((this.isMouseSelecting || this._isTextAreaSelecting) && this._selectedNode !== target) {
                    if (this._selectedNode) {
                        this._selectedNode.style.outline = this.selectedNodeStyleCache;
                    }
                    this._selectedNode = target;
                    this.selectedNodeStyleCache = this._selectedNode.style.outline;
                    this._selectedNode.style.outline = "#28A745 solid 3px";
                }
            }
        });
        Object.defineProperty(this, "selector", {
            get: () => this._selector,
            set: (val) => {
                if (this.isMouseSelecting) {
                    document.getElementById("node-shot-bar-selector").value = val;
                } else if (this._isTextAreaSelecting) {
                    let el = document.querySelector(val);
                    if (el) {
                        this.selectedNode = el;
                    }
                }
                this._selector = val;
            }
        });
        Object.defineProperty(this, "isMouseSelecting", {
            get: () => this._isMouseSelecting,
            set: (val) => {
                if (val) {
                    document.addEventListener("click", this.clickListener);
                    document.addEventListener("mousemove", this.moveListener);
                    document.addEventListener("keyup", this.keyupListener);
                    document.getElementById("node-shot-bar-switch").classList.add("active");
                } else {
                    document.removeEventListener("click", this.clickListener);
                    document.removeEventListener("mousemove", this.moveListener);
                    document.removeEventListener("keyup", this.keyupListener);
                    document.getElementById("node-shot-bar-switch").classList.remove("active");
                    this._selectedNodeParents.length = 0;
                }
                this._isMouseSelecting = val;
            }
        });

        document.getElementById("node-shot-bar-selector").addEventListener('focus', (e) => {
            this._isTextAreaSelecting = true;
        });
        document.getElementById("node-shot-bar-selector").addEventListener('blur', (e) => {
            this._isTextAreaSelecting = false;
            if (this.selectedNode) {
                this.selectedNode.style.outline = this.selectedNodeStyleCache;
            }
        });
        document.getElementById("node-shot-bar-selector").addEventListener('keyup', (e) => {
            clearEventBubble(e);
            this.selector = e.target.value;
        });

        document.getElementById("node-shot-bar-switch").addEventListener("click", (e) => {
            clearEventBubble(e);
            if (this.isMouseSelecting) {
                this.endMouseSelect();
            } else {
                this.isMouseSelecting = true;
            }
        });
        [...document.getElementsByClassName("node-shot-bar-out")].forEach(el => {
            el.addEventListener("click", (e) => {
                clearEventBubble(e);
                let options = { mode: el.dataset.type, delay: document.getElementById("node-shot-bar-delay").checked };
                this._callback(this.selectedNode, options);
            });
        });

        this.moveListener = throttle(this.mousemove, 100, this);
        this.clickListener = this.click.bind(this);
        this.keyupListener = throttle(this.keyup, 500, this);
    },
    click(e) {
        clearEventBubble(e);
        this.endMouseSelect();
    },
    endMouseSelect() {
        if (this.selectedNode) {
            console.log(this.selectedNode);
            let sim = simmer(this.selectedNode);
            this.selector = sim ? sim : text.cannotGetSelector;
            this.selectedNode.style.outline = this.selectedNodeStyleCache;
            this.isMouseSelecting = false;
        }
    },
    mousemove(e) {
        clearEventBubble(e);
        this.selectedNode = e.target;
    },
    keyup(e) {
        if (e.key === "ArrowUp") {
            this._selectedNodeParents.push(this.selectedNode);
            this.selectedNode = this.selectedNode.parentNode;
        } else if (e.key === "ArrowDown" && this._selectedNodeParents.length) {
            this.selectedNode = this._selectedNodeParents.pop();
        }
    },
}