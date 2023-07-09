const editor = new HSSP.Editor();

const upload = document.getElementById('upload');
const version = document.getElementById('version');
const fileList = document.getElementById('file-list');

var files = {};

const download = (name) => {
    const a = document.createElement('a');
    a.download = name;
    const blob = new Blob([files[name].buffer], { type: 'application/octet-stream' });
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
        });
    });
    return visualizer;
};

(async () => {
    await HSSP.init();

    const fileReadEventHandler = (ev) => new Promise((resolve, reject) => {
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
    });

    upload.onchange = async (ev) => {
        const package = await fileReadEventHandler(ev);
        var pwcorrect = false;
        var pw = undefined;
        var pwincorrect = false;
        while (!pwcorrect) if (HSSP.metadata(package, pw).password.correct === false) {
            pw = prompt(pwincorrect ? 'This password is not correct\n\nPassword:' : 'This package seems to be encrypted.\n\nPassword:');
            if (pw === null) return;
            pwincorrect = true;
        } else pwcorrect = true;
        editor.import(package, pw);
        files = editor.files;
        fileList.innerHTML = '<tr><th>Name</th><th>Path</th><th>Permissions</th><th></th></tr>';
        Object.keys(files).forEach(fileName => {
            const file = files[fileName];
            
            var el = document.createElement('tr');
            const splitFileName = fileName.split('/');
            const fileNameTable = splitFileName.pop();
            const filePath = '/' + splitFileName.join('/');
            el.innerHTML = `<td><a href="javascript:download('${fileName}')">${fileNameTable}</a></td><td>${filePath}</td><td></td><td><button class="material-symbols-outlined">tune</button><button class="material-symbols-outlined" disabled>delete</button></td>`;
            fileList.appendChild(el);
            el.children[2].appendChild(permissionVisualizer(file.options.permissions, true, permission => {}));
            el.children[3].children[0].addEventListener('click', () => {
                document.getElementById('file-detail-name').innerText = el.children[0].children[0].innerText;

                document.getElementById('file-detail-hide').checked = file.options.hidden;
                document.getElementById('file-detail-sys').checked = file.options.system;
                document.getElementById('file-detail-bkup-enable').checked = file.options.enableBackup;
                document.getElementById('file-detail-bkup-force').checked = file.options.forceBackup;
                document.getElementById('file-detail-readonly').checked = file.options.readOnly;
                document.getElementById('file-detail-main').checked = file.options.mainFile;

                document.getElementById('file-detail-owner').value = file.options.owner;
                document.getElementById('file-detail-group').value = file.options.group;

                document.getElementById('file-detail-created').value = (new Date(file.options.created.getTime() - file.options.created.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
                document.getElementById('file-detail-changed').value = (new Date(file.options.changed.getTime() - file.options.changed.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);
                document.getElementById('file-detail-opened').value = (new Date(file.options.opened.getTime() - file.options.opened.getTimezoneOffset() * 60000).toISOString()).slice(0, -1);

                document.getElementById('file-detail-link').value = file.options.webLink;

                document.getElementById('file-detail-close').addEventListener('click', () => document.getElementById('file-detail').close());

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
        });
    };
})();