"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { Settings as SettingsIcon, X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceOpen?: boolean; // Used if credentials are empty
}

export default function SettingsModal({ isOpen, onClose, forceOpen = false }: SettingsModalProps) {
  const { settings, saveSettings } = useSettings();
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setClientId(settings.clientId || "");
        setApiKey(settings.apiKey || "");
      }, 0);
    }
  }, [isOpen, settings]);

  if (!isOpen && !forceOpen) return null;

  const handleSave = () => {
    saveSettings({ clientId, apiKey });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-700 relative">
        {!forceOpen && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Google API 設定</h2>
          </div>

          {forceOpen && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 p-4 rounded-lg mb-6 text-sm">
              アプリを利用するには、Google Cloudの認証情報（クライアントIDとAPIキー）を入力してください。
              情報はブラウザにのみ保存され、外部に送信されません。
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                OAuth クライアント ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="0000000000-xxxxx.apps.googleusercontent.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                API キー
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyAxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {!forceOpen && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!clientId || !apiKey}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
