const editor = new HSSP.Editor();

const upload = document.getElementById('upload');
const fileList = document.getElementById('file-list');

(async ()=> {
    await HSSP.init();

    const fileReadEventHandler = (ev) => new Promise((resolve, reject) => {
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = () => resolve({name: file.name, buffer: reader.result, changed: file.lastModified});
        reader.readAsArrayBuffer(file);
    });
    
    upload.onchange = async (ev) => {
        const file = await fileReadEventHandler(ev);
        editor.addFile(file.name, file.buffer, {
            changed: new Date(files[index].name)
        });
        console.log(editor.files[file.name]);
    };
})();