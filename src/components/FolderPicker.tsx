"use client";

import { useAuth } from "@/lib/AuthContext";
import { useSettings } from "@/lib/SettingsContext";

interface FolderPickerProps {
  onFolderSelected: (folderId: string, folderName: string) => void;
}

export default function FolderPicker({ onFolderSelected }: FolderPickerProps) {
  const { accessToken, isGapiLoaded } = useAuth();
  const { settings } = useSettings();
  const apiKey = settings.apiKey;

  const handleOpenPicker = () => {
    if (!isGapiLoaded || !window.google || !window.google.picker) {
      alert("Google Picker API is not loaded yet. Please try again in a moment.");
      return;
    }
    if (!accessToken) {
      alert("Please login first.");
      return;
    }

    const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
      .setSelectFolderEnabled(true)
      .setIncludeFolders(true)
      .setMimeTypes("application/vnd.google-apps.folder");

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          onFolderSelected(doc.id, doc.name);
        }
      })
      .build();
    picker.setVisible(true);
  };

  return (
    <button
      onClick={handleOpenPicker}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
    >
      フォルダを選択する
    </button>
  );
}
