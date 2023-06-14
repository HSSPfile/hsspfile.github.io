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
    var visualizer = document.createElement('span');
    visualizer.classList.add('permissions');
    visualizer.appendChild((() => {
        var el = document.createElement('span');
        el.classList.add('owner');
        el.innerHTML = '<span class="r"></span><span class="w"></span><span class="x"></span>';
        return el;
    })());
    visualizer.appendChild((() => {
        var el = document.createElement('span');
        el.classList.add('group');
        el.innerHTML = '<span class="r"></span><span class="w"></span><span class="x"></span>';
        return el;
    })());
    visualizer.appendChild((() => {
        var el = document.createElement('everyone');
        el.classList.add('owner');
        el.innerHTML = '<span class="r"></span><span class="w"></span><span class="x"></span>';
        return el;
    })());
    var permissionBinary = permission.toString(2).split('').map(int => !!parseInt(int));
    Array.from(visualizer.children).forEach((element, i) => {
        Array.from(element.children).forEach((element, j) => {
            if (permissionBinary[i * 3 + j]) element.classList.add('allowed'); else element.classList.remove('allowed');
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
            element.addEventListener('click', () => {
                permissionBinary[i * 3 + j] = !permissionBinary[i * 3 + j];
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
                if (permissionBinary[i * 3 + j]) element.classList.add('allowed'); else element.classList.remove('allowed');
                permission = parseInt(permissionBinary.map(bool => +bool).join(''), 2);
                onChange(toBase8 ? +permission.toString(8) : permission);
            });
        });
    });
    return visualizer;
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
        el.innerHTML = `<td><a href="javascript:download('${file.name}')">${fileName}</a></td><td>${filePath}</td><td></td>`;
        fileList.appendChild(el);
        el.children[2].appendChild(permissionVisualizer(editor.files[file.name].options.permissions, true, permission => {
            var oldFile = editor.remove(file.name);
            oldFile.options.permissions = permission;
            editor.addFile(file.name, oldFile.buffer, oldFile.options);
        }));
    };
})();