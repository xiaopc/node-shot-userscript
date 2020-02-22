import { toPng, toJpeg, toBlob, toSvgDataURL } from 'html-to-image';
import download from 'downloadjs';

import bar from './bar'

let shoter = {
    bar: bar,
    init() {
        if (window.self === window.top) {
            this.bar.init(this.callback.bind(this));
        }
    },
    callback(el, options) {
        console.log({ el: el, options: options });
        let fn = "output" + options.mode.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        setTimeout(() => this[fn](el), options.delay ? 10000 : 0);
        // this[fn](el);
    },
    outputPng(el) {
        toPng(el).then(function (dataUrl) {
            download(dataUrl, 'node-shot.png');
        });
    },
    outputJpg(el) {
        toJpeg(el).then(function (dataUrl) {
            download(dataUrl, 'node-shot.jpg');
        });
    },
    outputSvg(el) {
        toSvgDataURL(el).then(function (dataUrl) {
            download(dataUrl, 'node-shot.svg');
        });
    }
};

shoter.init();
