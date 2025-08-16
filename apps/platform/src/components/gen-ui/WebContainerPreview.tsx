'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import sdk, { type FileSystemTree } from '@stackblitz/sdk';

interface WebContainerPreviewProps {
  projectId: string;
}

interface ProjectData {
  id: string;
  name: string;
  generatedCode: {
    files: Array<{ path: string; content: string; }>;
  };
}

// Função utilitária para converter a lista de arquivos em uma árvore
const mapFilesToTree = (files: Array<{ path: string; content: string; }>): FileSystemTree => {
  const tree: FileSystemTree = {};
  files.forEach(file => {
    const pathParts = file.path.split('/');
    let currentLevel: any = tree;

    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        currentLevel[part] = {
          file: {
            contents: file.content,
          },
        };
      } else {
        if (!currentLevel[part]) {
          currentLevel[part] = {
            directory: {},
          };
        }
        currentLevel = currentLevel[part].directory;
      }
    });
  });
  return tree;
};


export const WebContainerPreview = ({ projectId }: WebContainerPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [status, setStatus] = useState('fetching'); // fetching, booting, installing, starting, ready
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  // Efeito para buscar dados do projeto
  useEffect(() => {
    if (projectId) {
      setStatus('fetching');
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          setProjectData(data);
          setStatus('booting');
        })
        .catch(err => {
          console.error(err);
          setStatus('error');
        });
    }
  }, [projectId]);

  // Efeito para inicializar o WebContainer quando os dados estiverem prontos
  useEffect(() => {
    if (projectData && status === 'booting') {
      const boot = async () => {
        console.log('Booting WebContainer with dynamic project files...');
        const filesTree = mapFilesToTree(projectData.generatedCode.files);
        const wcInstance = await sdk.boot();
        await wcInstance.load(filesTree);

        setStatus('installing');
        console.log('Running npm install...');
        const installProcess = await wcInstance.spawn('npm', ['install']);
        installProcess.output.pipeTo(new WritableStream({ write: (data) => console.log('[npm install]', data) }));
        if ((await installProcess.exit) !== 0) {
          throw new Error('Installation failed');
        }

        setStatus('starting');
        console.log('Running npm run dev...');
        await wcInstance.spawn('npm', ['run', 'dev']);

        wcInstance.on('server-ready', (port, url) => {
          console.log(`Server is ready at ${url}`);
          setServerUrl(url);
          setStatus('ready');
        });
      };
      boot().catch(err => {
        console.error(err);
        setStatus('error');
      });
    }
  }, [projectData, status]);

  const statusMessages: { [key: string]: string } = {
    fetching: 'Fetching project data...',
    booting: 'Booting WebContainer...',
    installing: 'Installing dependencies...',
    starting: 'Starting dev server...',
    ready: 'Live preview ready!',
    error: 'An error occurred.',
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Live Preview - {statusMessages[status]}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {status !== 'ready' ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p>{statusMessages[status]}</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={serverUrl!}
            className="w-full h-full border rounded-md"
            title="WebContainer Preview"
          />
        )}
      </CardContent>
    </Card>
  );
};