const storageKey = "tinymce-simple-doc";
const titleKey = "tinymce-simple-title";

const statusEl = document.getElementById("status");
const wordCountEl = document.getElementById("word-count");
const titleInput = document.getElementById("doc-title");
const exportModal = document.getElementById("export-modal");
const exportArea = document.getElementById("export-area");

const setStatus = (text) => {
  statusEl.textContent = text;
};

const countWords = (text) => {
  const cleaned = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
};

const showModal = () => {
  exportModal.classList.remove("hidden");
  exportModal.setAttribute("aria-hidden", "false");
};

const hideModal = () => {
  exportModal.classList.add("hidden");
  exportModal.setAttribute("aria-hidden", "true");
};

const saveDraft = (content) => {
  localStorage.setItem(storageKey, content);
  localStorage.setItem(titleKey, titleInput.value.trim());
  setStatus("Saved");
};

const loadDraft = () => {
  const title = localStorage.getItem(titleKey);
  if (title) titleInput.value = title;
  return localStorage.getItem(storageKey) || "";
};

const updateWordCount = (content) => {
  const words = countWords(content);
  wordCountEl.textContent = `${words} word${words === 1 ? "" : "s"}`;
};

tinymce.init({
  selector: "#editor",
  height: 520,
  menubar: false,
  plugins: "lists link codesample table autoresize",
  toolbar:
    "undo redo | bold italic underline | bullist numlist | alignleft aligncenter alignright | link table | codesample",
  content_style:
    "body { font-family: Literata, serif; font-size: 18px; line-height: 1.6; }",
  setup: (editor) => {
    editor.on("init", () => {
      const draft = loadDraft();
      if (draft) editor.setContent(draft);
      updateWordCount(editor.getContent());
    });

    editor.on("keyup change", () => {
      const content = editor.getContent();
      updateWordCount(content);
      setStatus("Saving...");
      clearTimeout(editor._saveTimer);
      editor._saveTimer = setTimeout(() => saveDraft(content), 800);
    });
  },
});

document.getElementById("btn-new").addEventListener("click", () => {
  if (!confirm("Start a new document? This clears the current draft.")) return;
  titleInput.value = "";
  tinymce.get("editor").setContent("");
  localStorage.removeItem(storageKey);
  localStorage.removeItem(titleKey);
  updateWordCount("");
  setStatus("New document");
});

document.getElementById("btn-export").addEventListener("click", () => {
  const editor = tinymce.get("editor");
  exportArea.value = editor.getContent();
  showModal();
});

document.getElementById("btn-close").addEventListener("click", hideModal);

exportModal.addEventListener("click", (event) => {
  if (event.target === exportModal) hideModal();
});

document.getElementById("btn-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(exportArea.value);
    setStatus("Copied to clipboard");
    hideModal();
  } catch {
    setStatus("Copy failed");
  }
});

titleInput.addEventListener("input", () => {
  setStatus("Saving...");
  clearTimeout(window._titleTimer);
  window._titleTimer = setTimeout(() => {
    localStorage.setItem(titleKey, titleInput.value.trim());
    setStatus("Saved");
  }, 600);
});
