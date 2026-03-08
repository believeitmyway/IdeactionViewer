export interface DriveFile {
  id: string;
  name: string;
  content?: string;
}

export async function fetchMarkdownFiles(
  folderId: string,
  accessToken: string,
  pageToken?: string
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const query = `'${folderId}' in parents and (mimeType='text/markdown' or name contains '.md') and trashed=false`;

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.append('q', query);
  url.searchParams.append('fields', 'nextPageToken, files(id, name)');
  url.searchParams.append('pageSize', '20');

  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }

  const data = await response.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

export async function fetchFileContent(fileId: string, accessToken: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch content for file ${fileId}`);
  }

  return response.text();
}
