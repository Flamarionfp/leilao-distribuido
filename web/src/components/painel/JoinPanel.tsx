import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { STORAGE_KEYS } from "../../constants";
import { readStorage, writeStorage } from "../../utils/storage";
import Card from "../ui/Card";

export default function JoinPanel() {
  const [url, setUrl] = useState(
    () => readStorage(STORAGE_KEYS.publicUrl) ?? window.location.origin,
  );

  function change(value: string) {
    writeStorage(STORAGE_KEYS.publicUrl, value);
    setUrl(value);
  }

  return (
    <Card title="Participe">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-white p-2">
          <QRCodeSVG value={url} size={120} />
        </div>
        <div className="min-w-0 flex-1 space-y-2 text-sm">
          <p className="text-slate-400">
            Aponte a câmera para entrar no leilão.
          </p>
          <input
            value={url}
            onChange={(e) => change(e.target.value)}
            className="w-full rounded-lg bg-slate-800 px-2 py-1.5 text-xs outline-none ring-1 ring-slate-700 focus:ring-amber-400"
          />
        </div>
      </div>
    </Card>
  );
}
