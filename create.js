const editor = new HSSP.Editor();

const upload = document.getElementById('upload');
const version = document.getElementById('version');
const fileList = document.getElementById('file-list');
const usePassword = document.getElementById('use-password');
const password = document.getElementById('password');
const compression = document.getElementById('compression');
const compressionLvl = document.getElementById('compression-level');
const compressionLvlNum = document.getElementById('compression-level-number');
const create = document.getElementById('create');

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

usePassword.onchange = () => {
    password.disabled = !usePassword.checked;
    editor.password = usePassword.checked ? password.value : editor.password = null;
};
password.onchange = () => {
    editor.password = password.value;
};
password.onkeydown = password.onchange;

compression.onchange = () => {
    if (compression.value != 'NONE') {
        compressionLvl.disabled = false;
        compressionLvlNum.disabled = false;
        editor.compression = { algorithm: compression.value, level: compressionLvl.value };
    } else {
        compressionLvl.disabled = true;
        compressionLvlNum.disabled = true;

        editor.compression = { algorithm: null, level: null };
    };
};
compressionLvl.onchange = () => {
    compressionLvlNum.value = compressionLvl.value;
    editor.compression = { algorithm: compression.value, level: compressionLvl.value };
};
compressionLvl.onmousedown = compressionLvl.onchange;
compressionLvlNum.onchange = () => {
    compressionLvl.value = compressionLvlNum.value;
    editor.compression = { algorithm: compression.value, level: compressionLvlNum.value };
};
compressionLvlNum.onkeydown = compressionLvlNum.onchange;

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
        el.innerHTML = `<td><a href="javascript:download('${file.name}')">${fileName}</a></td><td>${filePath}</td><td></td><td><button class="material-symbols-outlined">tune</button><button class="material-symbols-outlined">delete</button></td>`;
        fileList.appendChild(el);
        el.children[2].appendChild(permissionVisualizer(editor.files[file.name].options.permissions, true, permission => {
            var oldFile = editor.remove(file.name);
            oldFile.options.permissions = permission;
            editor.addFile(file.name, oldFile.buffer, oldFile.options);
        }));
        el.children[3].children[0].addEventListener('click', () => {
            document.getElementById('file-detail-name').innerText = el.children[0].children[0].innerText;

            var oldFile = editor.remove(file.name);
            document.getElementById('file-detail-hide').checked = oldFile.options.hidden;
            document.getElementById('file-detail-sys').checked = oldFile.options.system;
            document.getElementById('file-detail-bkup-enable').checked = oldFile.options.enableBackup;
            document.getElementById('file-detail-bkup-force').checked = oldFile.options.forceBackup;
            document.getElementById('file-detail-readonly').checked = oldFile.options.readOnly;
            document.getElementById('file-detail-main').checked = oldFile.options.mainFile;

            document.getElementById('file-detail-owner').value = oldFile.options.owner;
            document.getElementById('file-detail-group').value = oldFile.options.group;

            document.getElementById('file-detail-created').value = (new Date(oldFile.options.created.getTime() - oldFile.options.created.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
            document.getElementById('file-detail-changed').value = (new Date(oldFile.options.changed.getTime() - oldFile.options.changed.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
            document.getElementById('file-detail-opened').value = (new Date(oldFile.options.opened.getTime() - oldFile.options.opened.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);

            document.getElementById('file-detail-link').value = oldFile.options.webLink;

            const applyListener = () => {
                document.getElementById('file-detail-apply').removeEventListener('click', applyListener);

                oldFile.options.hidden = document.getElementById('file-detail-hide').checked;
                oldFile.options.system = document.getElementById('file-detail-sys').checked;
                oldFile.options.enableBackup = document.getElementById('file-detail-bkup-enable').checked;
                oldFile.options.forceBackup = document.getElementById('file-detail-bkup-force').checked;
                oldFile.options.readOnly = document.getElementById('file-detail-readonly').checked;
                oldFile.options.mainFile = document.getElementById('file-detail-main').checked;

                oldFile.options.owner = document.getElementById('file-detail-owner').value;
                oldFile.options.group = document.getElementById('file-detail-group').value;

                oldFile.options.created = new Date(document.getElementById('file-detail-created').value);
                oldFile.options.changed = new Date(document.getElementById('file-detail-changed').value);
                oldFile.options.opened = new Date(document.getElementById('file-detail-opened').value);

                oldFile.options.webLink = document.getElementById('file-detail-link').value;

                editor.addFile(file.name, oldFile.buffer, oldFile.options);
                document.getElementById('file-detail').close();
            };
            document.getElementById('file-detail-apply').addEventListener('click', applyListener);

            document.getElementById('file-detail').showModal();
        });
        el.children[3].children[1].addEventListener('click', () => {
            document.getElementById('file-delete-name').innerText = el.children[0].children[0].innerText;

            const yesListener = () => {
                document.getElementById('file-delete-yes').removeEventListener('click', yesListener);
                document.getElementById('file-delete-no').removeEventListener('click', noListener);
                editor.remove(el.children[1].innerText.replace('/', '') + el.children[0].children[0].innerText);
                el.parentElement.removeChild(el);
                document.getElementById('file-delete').close();
            };
            document.getElementById('file-delete-yes').addEventListener('click', yesListener);
            const noListener = () => {
                document.getElementById('file-delete-yes').removeEventListener('click', yesListener);
                document.getElementById('file-delete-no').removeEventListener('click', noListener);
                document.getElementById('file-delete').close();
            };
            document.getElementById('file-delete-no').addEventListener('click', noListener);

            document.getElementById('file-delete').showModal();
        });
    };

    create.addEventListener('click', () => {
        create.disabled = true;
        create.innerText = 'Please wait...';

        editor.version = parseInt(version.value);

        const a = document.createElement('a');
        a.download = window.location.href
            .split(':').join('_')
            .split('/').join('_')
            .split('#').join('_')
            .split('\\').join('_')
            .split('*').join('_')
            .split('.').join('_')
            .split('?').join('_')
            .split('"').join('_')
            .split('\'').join('_')
            .split('<').join('_')
            .split('>').join('_')
            .split('|').join('_') + '.hssp';
        const blob = new Blob([editor.toBuffer()], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);

        create.innerText = 'Create & download!';
        create.disabled = false;
    });
})();