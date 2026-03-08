"use client";

import { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/lib/AuthContext";
import FolderPicker from "@/components/FolderPicker";
import { fetchMarkdownFiles, fetchFileContent, DriveFile } from "@/lib/driveApi";
import { FileText, Loader2, FolderOpen, LogOut } from "lucide-react";

export default function Home() {
  const { isSignedIn, login, logout, accessToken } = useAuth();

  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  const loadFiles = useCallback(async (isInitial = false) => {
    if (!selectedFolder || !accessToken || loading || (!hasMore && !isInitial)) return;

    setLoading(true);
    setError(null);

    try {
      const { files: fetchedFiles, nextPageToken: token } = await fetchMarkdownFiles(
        selectedFolder.id,
        accessToken,
        isInitial ? undefined : nextPageToken
      );

      // Fetch content for each file
      const filesWithContent = await Promise.all(
        fetchedFiles.map(async (file) => {
          try {
            const content = await fetchFileContent(file.id, accessToken);
            return { ...file, content };
          } catch (err) {
            console.error(`Error fetching content for ${file.name}`, err);
            return { ...file, content: "Error loading content" };
          }
        })
      );

      setFiles((prev) => (isInitial ? filesWithContent : [...prev, ...filesWithContent]));
      setNextPageToken(token);
      setHasMore(!!token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while fetching files.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, accessToken, nextPageToken, hasMore, loading]);

  useEffect(() => {
    if (selectedFolder) {
      setFiles([]);
      setNextPageToken(undefined);
      setHasMore(true);
      loadFiles(true);
    }
  }, [selectedFolder, loadFiles]);

  useEffect(() => {
    if (inView && hasMore && !loading && files.length > 0) {
      loadFiles();
    }
  }, [inView, hasMore, loading, loadFiles, files.length]);

  const handleFolderSelected = (id: string, name: string) => {
    setSelectedFolder({ id, name });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/80 border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-400 w-6 h-6" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MD Viewer
            </h1>
          </div>
          <div>
            {!isSignedIn ? (
              <button
                onClick={() => login()}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Googleでログイン
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  title="ログアウト"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl max-w-md w-full">
              <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Google Driveと連携</h2>
              <p className="text-gray-400 mb-8">
                Googleアカウントでログインして、Drive内のマークダウンファイルをサクサク閲覧しましょう。
              </p>
              <button
                onClick={() => login()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1"
              >
                ログインして始める
              </button>
            </div>
          </div>
        ) : !selectedFolder ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <FolderOpen className="w-16 h-16 text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold mb-4">フォルダを選択</h2>
            <p className="text-gray-400 mb-8">
              マークダウンファイルが保存されているGoogle Driveのフォルダを選択してください。
            </p>
            <FolderPicker onFolderSelected={handleFolderSelected} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FolderOpen className="text-indigo-400" />
                  {selectedFolder.name}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {files.length} ファイル読み込み済み
                </p>
              </div>
              <FolderPicker onFolderSelected={handleFolderSelected} />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-48"
                  title={file.name}
                >
                  <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2 justify-center h-12">
                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-medium truncate text-gray-200 w-full text-center">
                      {file.name}
                    </span>
                  </div>
                  <div className="p-3 overflow-hidden flex-grow bg-gray-900/50 relative flex items-center justify-center">
                     <FileText className="w-12 h-12 text-gray-600 opacity-50 mb-2" />
                    {/* Render a tiny preview if needed, but the prompt said "全てアイコンに表示して" which implies short rendering / just icon.
                        I'll use the content just for a tiny snippet if possible, or leave it as a nice large icon. */}
                    <div className="absolute inset-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900/90 overflow-hidden text-[10px] text-gray-400 break-words line-clamp-6">
                       {file.content?.substring(0, 150) || "No content"}...
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite Scroll trigger element */}
            <div ref={ref} className="w-full py-12 flex justify-center">
              {loading && (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>読み込み中...</span>
                </div>
              )}
              {!hasMore && files.length > 0 && (
                <p className="text-gray-500 text-sm">すべてのファイルを読み込みました</p>
              )}
            </div>

            {!loading && files.length === 0 && !error && (
              <div className="text-center py-20 text-gray-500">
                このフォルダにはマークダウンファイルが見つかりません。
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
