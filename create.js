const editor = new HSSP.Editor();

const upload = document.getElementById('upload');
const fileList = document.getElementById('file-list');

/* FileSaver.js (source: http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js)
 * A saveAs() FileSaver implementation.
 * 1.3.8
 * 2018-03-22 14:03:47
 *
 * By Eli Grey, https://eligrey.com
 * License: MIT
 * See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
var saveAs = saveAs || function (c) { "use strict"; if (!(void 0 === c || "undefined" != typeof navigator && /MSIE [1-9]\./.test(navigator.userAgent))) { var t = c.document, f = function () { return c.URL || c.webkitURL || c }, s = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), d = "download" in s, u = /constructor/i.test(c.HTMLElement) || c.safari, l = /CriOS\/[\d]+/.test(navigator.userAgent), p = c.setImmediate || c.setTimeout, v = function (t) { p(function () { throw t }, 0) }, w = function (t) { setTimeout(function () { "string" == typeof t ? f().revokeObjectURL(t) : t.remove() }, 4e4) }, m = function (t) { return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type) ? new Blob([String.fromCharCode(65279), t], { type: t.type }) : t }, r = function (t, n, e) { e || (t = m(t)); var r, o = this, a = "application/octet-stream" === t.type, i = function () { !function (t, e, n) { for (var r = (e = [].concat(e)).length; r--;) { var o = t["on" + e[r]]; if ("function" == typeof o) try { o.call(t, n || t) } catch (t) { v(t) } } }(o, "writestart progress write writeend".split(" ")) }; if (o.readyState = o.INIT, d) return r = f().createObjectURL(t), void p(function () { var t, e; s.href = r, s.download = n, t = s, e = new MouseEvent("click"), t.dispatchEvent(e), i(), w(r), o.readyState = o.DONE }, 0); !function () { if ((l || a && u) && c.FileReader) { var e = new FileReader; return e.onloadend = function () { var t = l ? e.result : e.result.replace(/^data:[^;]*;/, "data:attachment/file;"); c.open(t, "_blank") || (c.location.href = t), t = void 0, o.readyState = o.DONE, i() }, e.readAsDataURL(t), o.readyState = o.INIT } r || (r = f().createObjectURL(t)), a ? c.location.href = r : c.open(r, "_blank") || (c.location.href = r); o.readyState = o.DONE, i(), w(r) }() }, e = r.prototype; return "undefined" != typeof navigator && navigator.msSaveOrOpenBlob ? function (t, e, n) { return e = e || t.name || "download", n || (t = m(t)), navigator.msSaveOrOpenBlob(t, e) } : (e.abort = function () { }, e.readyState = e.INIT = 0, e.WRITING = 1, e.DONE = 2, e.error = e.onwritestart = e.onprogress = e.onwrite = e.onabort = e.onerror = e.onwriteend = null, function (t, e, n) { return new r(t, e || t.name || "download", n) }) } }("undefined" != typeof self && self || "undefined" != typeof window && window || this);

const download = (name) => saveAs(new Uint8Array(editor.files[name].buffer), name);

const permissionVisualizer = (val, toBase8, onChange) => {
    var permission = toBase8 ? parseInt(val, 8) : val;
    var visualizer = document.createElement('span');
    visualizer.innnerHTML = '<span class="owner"><span class="r"></span><span class="w"></span><span class="x"></span></span><span class="group"><span class="r"></span><span class="w"></span><span class="x"></span></span><span class="everyone"><span class="r"></span><span class="w"></span><span class="x"></span></span>';
    var permissionBinary = permission.toString(2).split('').map(int => !!parseInt(int));
    Array.from(visualizer.children).forEach((element, i) => {
        Array.from(element.children).forEach((element, j) => {
            element.innerText = permissionBinary[i * 3 + j] ? (() => {
                switch (j) {
                    case 0:
                        return 'r';
                    case 1:
                        return 'w';
                    case 2:
                        return 'x';
                };
            }) : '-';
            element.onclick = () => {
                permissionBinary[i * 3 + j] = !permissionBinary[i * 3 + j];
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
        });
    });
    return '<span class="permission">' + visualizer.innerHTML + '</span>';
};

(async () => {
    await HSSP.init();

    const fileReadEventHandler = (ev) => new Promise((resolve, reject) => {
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, buffer: reader.result, changed: file.lastModified });
        reader.readAsArrayBuffer(file);
    });

    upload.onchange = async (ev) => {
        const file = await fileReadEventHandler(ev);
        editor.addFile(file.name, file.buffer, {
            changed: new Date(file.changed)
        });
        var el = document.createElement('tr');
        const splitFileName = file.name.split('/');
        const fileName = splitFileName.pop();
        const filePath = '/' + splitFileName.join('/');
        el.innerHTML = `<td><a href="javascript:download('${file.name}')">${fileName}</a></td><td>${filePath}</td><td>${permissionVisualizer(editor.files[file.name].options.permissions, true, permission => {
            var oldFile = editor.remove(file.name);
            oldFile.options.permissions = permission;
            editor.addFile(file.name, oldFile.buffer, oldFile.options);
        })}</td>`;
        fileList.appendChild(el);
    };
})();