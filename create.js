const editor = new HSSP.Editor();

const upload = document.getElementById('upload');
const fileList = document.getElementById('file-list');

const download = (name) => {
    const a = document.createElement('a');
    a.download = name;
    const blob = new Blob([editor.files[name].buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
};

const permissionVisualizer = (val, toBase8, onChange) => {
    var permission = toBase8 ? parseInt(val, 8) : val;
    var permissionBinary = permission.toString(2).split('').map(int => !!parseInt(int));
    var visualizer = document.createElement('span');
    visualizer.appendChild((() => {
        var el = document.createElement('span');
        el.classList.add('owner');
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('r');
            el.onclick = (ev) => {
                permissionBinary[0] = !permissionBinary[0];
                ev.target.innerText = permissionBinary[0] ? 'r' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('w');
            el.onclick = (ev) => {
                permissionBinary[1] = !permissionBinary[1];
                ev.target.innerText = permissionBinary[1] ? 'w' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('x');
            el.onclick = (ev) => {
                permissionBinary[2] = !permissionBinary[2];
                ev.target.innerText = permissionBinary[2] ? 'x' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        return el;
    })());
    visualizer.appendChild((() => {
        var el = document.createElement('span');
        el.classList.add('group');
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('r');
            el.onclick = (ev) => {
                permissionBinary[3] = !permissionBinary[3];
                ev.target.innerText = permissionBinary[3] ? 'r' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('w');
            el.onclick = (ev) => {
                permissionBinary[4] = !permissionBinary[4];
                ev.target.innerText = permissionBinary[4] ? 'w' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('x');
            el.onclick = (ev) => {
                permissionBinary[5] = !permissionBinary[5];
                ev.target.innerText = permissionBinary[5] ? 'x' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        return el;
    })());
    visualizer.appendChild((() => {
        var el = document.createElement('everyone');
        el.classList.add('owner');
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('r');
            el.onclick = (ev) => {
                permissionBinary[6] = !permissionBinary[6];
                ev.target.innerText = permissionBinary[6] ? 'r' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('w');
            el.onclick = (ev) => {
                permissionBinary[7] = !permissionBinary[7];
                ev.target.innerText = permissionBinary[7] ? 'w' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        el.appendChild((() => {
            var el = document.createElement('span');
            el.classList.add('x');
            el.onclick = (ev) => {
                permissionBinary[8] = !permissionBinary[8];
                ev.target.innerText = permissionBinary[8] ? 'x' : '-';
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            };
            return el;
        })());
        return el;
    })());
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
            })() : '-';
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