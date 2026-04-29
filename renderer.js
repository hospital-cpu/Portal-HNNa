const editor = document.getElementById('editor');
const tabsEl = document.getElementById('tabs');
const fileInput = document.getElementById('fileInput');

let docs = JSON.parse(localStorage.getItem('docs') || '[]');
let activeId = localStorage.getItem('activeDocId');

if (!docs.length) {
  docs = [{ id: crypto.randomUUID(), title: 'Documento 1', content: '<p>Comece a editar...</p>' }];
  activeId = docs[0].id;
}

function persist() {
  localStorage.setItem('docs', JSON.stringify(docs));
  localStorage.setItem('activeDocId', activeId);
}

function renderTabs() {
  tabsEl.innerHTML = '';
  docs.forEach((doc, index) => {
    const btn = document.createElement('button');
    btn.className = `tab ${doc.id === activeId ? 'active' : ''}`;
    btn.textContent = doc.title || `Documento ${index + 1}`;
    btn.onclick = () => {
      saveCurrent();
      activeId = doc.id;
      loadCurrent();
    };
    tabsEl.appendChild(btn);
  });
}

function getCurrent() { return docs.find(d => d.id === activeId); }
function loadCurrent() {
  const curr = getCurrent();
  editor.innerHTML = curr?.content || '';
  renderTabs();
  persist();
}
function saveCurrent() {
  const curr = getCurrent();
  if (!curr) return;
  curr.content = editor.innerHTML;
  persist();
}

editor.addEventListener('input', () => {
  saveCurrent();
});

setInterval(saveCurrent, 3000);

document.getElementById('newTabBtn').onclick = () => {
  saveCurrent();
  const doc = { id: crypto.randomUUID(), title: `Documento ${docs.length + 1}`, content: '<p>Novo documento</p>' };
  docs.push(doc);
  activeId = doc.id;
  loadCurrent();
};

document.querySelectorAll('[data-cmd]').forEach(btn => {
  btn.onclick = () => document.execCommand(btn.dataset.cmd);
});

document.getElementById('insertTableBtn').onclick = () => {
  const rows = Number(prompt('Linhas?', '2')) || 2;
  const cols = Number(prompt('Colunas?', '2')) || 2;
  let html = '<table>';
  for (let r = 0; r < rows; r++) {
    html += '<tr>' + '<td>&nbsp;</td>'.repeat(cols) + '</tr>';
  }
  html += '</table><p></p>';
  document.execCommand('insertHTML', false, html);
};

document.getElementById('openFileBtn').onclick = () => fileInput.click();
fileInput.onchange = async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    editor.innerHTML = result.value;
  } else {
    editor.innerHTML = `<pre>${await file.text()}</pre>`;
  }
  const curr = getCurrent();
  curr.title = file.name;
  saveCurrent();
  renderTabs();
};

document.getElementById('savePdfBtn').onclick = async () => {
  saveCurrent();
  if (window.electronAPI) {
    await window.electronAPI.savePDF();
  } else {
    alert('PDF disponível apenas no app Electron.');
  }
};

loadCurrent();
