# STEM Pocket Notes｜理工隨身筆記

使用原生 HTML、CSS、JavaScript 製作的可擴充筆記網站，內容由 Markdown 檔案和 JSON 索引組成。設計規則請見 [AGENTS.md](AGENTS.md)。

## 本機執行
在專案資料夾執行：

```bash
python -m http.server 8000
```

瀏覽 `http://localhost:8000`。不要直接雙擊 `index.html`，因為瀏覽器可能阻擋 `fetch()` 存取本地檔案。

## 新增筆記
1. 參考現有檔案，在 `notes/` 新增 `new-topic.md`。
2. 在 `notes/index.json` 新增相對應的物件。
3. 重新整理頁面，測試搜尋、分類與點擊閱讀。

## GitHub Pages 發布
1. 在 GitHub 建立公開 Repository，例如 `stem-pocket-notes`。
2. 將本專案內所有檔案上傳至 Repository 根目錄（`index.html` 應在根目錄）。
3. 前往 **Settings → Pages → Build and deployment**，來源選擇 **Deploy from a branch**，分支選 **main**，資料夾選 **/(root)**，儲存。
4. 部署成功後，開啟 `https://你的帳號.github.io/stem-pocket-notes/`。

> 注意：本專案不包含使用者 GitHub 帳號與倉庫；建立 Repo 和開啟 Pages 必須由你完成。
