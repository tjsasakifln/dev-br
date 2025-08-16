'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import sdk, { type WebContainer } from '@stackblitz/sdk';

// O projeto "Hello World" será removido em etapas futuras, mas o mantemos por enquanto.
const helloWorldFiles = {
  'index.js': {
    file: {
      contents: `
        import express from 'express';
        const app = express();
        const port = 3111;

        app.get('/', (req, res) => {
          res.send('Hello World from WebContainer!');
        });

        app.listen(port, () => {
          console.log(\`App listening at http://localhost:\${port}\`);
        });`,
    },
  },
  'package.json': {
    file: {
      contents: `
        {
          "name": "hello-world-server",
          "version": "1.0.0",
          "main": "index.js",
          "dependencies": {
            "express": "latest",
            "nodemon": "latest"
          },
          "scripts": {
            "start": "nodemon index.js"
          }
        }`,
    },
  },
};

// Nova interface para as props do componente
interface WebContainerPreviewProps {
  projectId: string;
}

// Nova interface para a estrutura esperada do projeto
interface ProjectData {
    id: string;
    name: string;
    // Assumimos que o código gerado virá nesta estrutura de 'files'
    generatedCode: {
        files: Array<{ path: string; content: string; }>;
    };
}

export const WebContainerPreview = ({ projectId }: WebContainerPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  // Efeito para buscar os dados do projeto
  useEffect(() => {
    if (projectId) {
      console.log(`Fetching project data for ID: ${projectId}`);
      fetch(`/api/projects/${projectId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch project: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Project data received:', data);
          setProjectData(data);
        })
        .catch(error => console.error('Error fetching project data:', error));
    }
  }, [projectId]);

  // Efeito para inicializar o WebContainer (ainda com dados estáticos)
  useEffect(() => {
    // A lógica de boot anterior permanece inalterada por enquanto
    const bootWebContainer = async () => {
      if (containerRef.current) {
        console.log('Booting WebContainer...');
        const wcInstance = await sdk.boot();
        await wcInstance.mount(containerRef.current);
        console.log('Mounting files...');
        await wcInstance.fs.writeFile('package.json', helloWorldFiles['package.json'].file.contents);
        await wcInstance.fs.writeFile('index.js', helloWorldFiles['index.js'].file.contents);

        console.log('Running npm install...');
        const installProcess = await wcInstance.spawn('npm', ['install']);
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[npm install]:', data);
          }
        }));
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error('npm install failed');
        }

        console.log('Running npm start...');
        await wcInstance.spawn('npm', ['start']);

        wcInstance.on('server-ready', (port, url) => {
          console.log(`Server ready at ${url}`);
          setIframeUrl(url);
        });
      }
    };
    // bootWebContainer(); // Comentado por agora para focarmos na busca de dados.
  }, []);

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {!projectData ? (
          <div className="w-full h-full flex items-center justify-center">
            <p>Fetching project data...</p>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full border rounded-md">
            <p>Project data loaded. Ready to boot WebContainer.</p>
            {/* O Iframe e a lógica de boot serão reativados na próxima etapa */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};