const editor = new HSSP.Editor();

const upload = document.getElementById('upload');
const fileList = document.getElementById('file-list');

const files = [];

(async ()=> {
    await HSSP.init();

    const fileReadEventHandler = (ev) => new Promise((resolve, reject) => {
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
    });
    
    document.getElementById('input').onchange = async (ev) => {
        const index = files.push(await fileReadEventHandler(ev));
    };
})();