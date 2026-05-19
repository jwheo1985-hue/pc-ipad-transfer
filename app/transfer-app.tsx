"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { formatBytes, formatDate } from "@/lib/format";
import type { Memo, StoredFile } from "@/lib/supabase";

type Items = {
  memos: Memo[];
  files: StoredFile[];
};

export default function TransferApp() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Items>({ memos: [], files: [] });
  const [memo, setMemo] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const response = await fetch("/api/items", { cache: "no-store" });

    if (response.status === 401) {
      location.href = "/login";
      return;
    }

    const data = await response.json();

    if (response.ok) {
      setItems(data);
    } else {
      setMessage(data.error || "Could not load items.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function saveMemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("memo");
    setMessage("");

    const response = await fetch("/api/memos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: memo })
    });

    setBusy("");

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || "Could not save memo.");
      return;
    }

    setMemo("");
    setMessage("Memo saved.");
    refresh();
  }

  async function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];

    if (!file) {
      return;
    }

    const form = new FormData();
    form.append("file", file);
    setBusy("file");
    setMessage("");

    const response = await fetch("/api/files", {
      method: "POST",
      body: form
    });

    setBusy("");

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || "Could not upload file.");
      return;
    }

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setFileName("");
    setMessage("File uploaded.");
    refresh();
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name || "");
  }

  async function copyMemo(body: string) {
    await navigator.clipboard.writeText(body);
    setMessage("Copied.");
  }

  async function remove(kind: "memos" | "files", id: string) {
    setBusy(id);
    setMessage("");

    const response = await fetch(`/api/${kind}/${id}`, { method: "DELETE" });
    setBusy("");

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || "Could not delete item.");
      return;
    }

    setMessage("Deleted.");
    refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1>Personal Transfer</h1>
          <p>Text and files between your PC and iPad.</p>
        </div>
        <button className="secondary small" onClick={logout} type="button">
          Logout
        </button>
      </header>

      <section className="grid">
        <form className="panel stack" onSubmit={saveMemo}>
          <h2>Text Memo</h2>
          <textarea
            onChange={(event) => setMemo(event.target.value)}
            placeholder="Paste or type text here"
            rows={6}
            value={memo}
          />
          <button disabled={!memo.trim() || busy === "memo"} type="submit">
            {busy === "memo" ? "Saving..." : "Save Memo"}
          </button>
        </form>

        <form className="panel stack" onSubmit={uploadFile}>
          <h2>File Upload</h2>
          <label className="file-picker">
            <input ref={fileRef} onChange={selectFile} type="file" />
            <span>{fileName || "Choose file"}</span>
          </label>
          <button disabled={!fileName || busy === "file"} type="submit">
            {busy === "file" ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </section>

      {message ? <p className="status">{message}</p> : null}

      <section className="panel list">
        <h2>Saved Memos</h2>
        {items.memos.length === 0 ? <p className="muted">No memos yet.</p> : null}
        {items.memos.map((item) => (
          <article className="item" key={item.id}>
            <pre>{item.body}</pre>
            <div className="meta">{formatDate(item.created_at)}</div>
            <div className="actions">
              <button className="secondary" onClick={() => copyMemo(item.body)} type="button">
                Copy
              </button>
              <button
                className="danger"
                disabled={busy === item.id}
                onClick={() => remove("memos", item.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="panel list">
        <h2>Uploaded Files</h2>
        {items.files.length === 0 ? <p className="muted">No files yet.</p> : null}
        {items.files.map((item) => (
          <article className="item" key={item.id}>
            <div className="file-name">{item.name}</div>
            <div className="meta">
              {formatDate(item.created_at)} · {formatBytes(item.size)}
            </div>
            <div className="actions">
              <a className="button secondary" href={`/api/files/${item.id}`}>
                Download
              </a>
              <button
                className="danger"
                disabled={busy === item.id}
                onClick={() => remove("files", item.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
