import { Dialog, DialogContent } from '@srcbook/components';
import { useCallback, useEffect, useState } from 'react';
import { Sandbox, Image } from 'modal';
import { modalClient } from '../lib/modal';

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  previewCommand: string[];
}

export function PreviewModal({ isOpen, onOpenChange, previewCommand }: PreviewModalProps) {
  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let activeSandbox: Sandbox | null = null;
    let isMounted = true;

    const initializeSandbox = async () => {
      await modalClient.authenticate();
      const app = await modalClient.apps.lookup("codelive-preview", { create_if_missing: true });
      setIsLoading(true);
      setError(null);
      setOutput([]);
      
      try {
        // Create sandbox with custom configuration
        const sb = await Sandbox.create({
          app,
          image: Image.debian_slim().pip_install("http-server"),
          timeout: 300,
          env: {
            NODE_ENV: "development",
            PORT: "8080",
            API_URL: import.meta.env.VITE_API_URL || "http://localhost:2150"
          },
          mounts: [
            {
              localPath: "./dist",
              remotePath: "/app",
            },
          ],
          workdir: "/app",
        });

        if (!isMounted) {
          await sb.terminate();
          return;
        }

        activeSandbox = sb;
        setSandbox(sb);
        
        // Execute the preview command
        const process = await sb.exec(...previewCommand);
        
        // Stream output
        for await (const line of process.stdout) {
          if (isMounted) {
            setOutput(prev => [...prev, line]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSandbox();

    return () => {
      isMounted = false;
      if (activeSandbox) {
        activeSandbox.terminate();
        setSandbox(null);
      }
    };
  }, [isOpen, previewCommand]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        {isLoading && <div className="p-4">Initializing sandbox...</div>}
        {error && <div className="p-4 text-red-500">Error: {error}</div>}

        <div className="flex-1 overflow-auto bg-black text-white p-4 font-mono text-sm">
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
