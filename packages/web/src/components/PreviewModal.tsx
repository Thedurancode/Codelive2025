import { Dialog, DialogContent } from '@srcbook/components';
import { useCallback, useEffect, useState } from 'react';
import { Sandbox, Image } from 'modal';
import { modalClient } from '../lib/modal';
import { Loader2 } from 'lucide-react';

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
  const [stage, setStage] = useState<'initializing' | 'creating-sandbox' | 'running' | 'error'>('initializing');

  useEffect(() => {
    if (!isOpen) return;

    let activeSandbox: Sandbox | null = null;
    let isMounted = true;

    const initializeSandbox = async () => {
      setStage('initializing');
      setIsLoading(true);
      setError(null);
      setOutput([]);
      
      try {
        await modalClient.authenticate();
        const app = await modalClient.apps.lookup("codelive-preview", { create_if_missing: true });
        
        setStage('creating-sandbox');
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

        if (!isMounted) return;
        
        activeSandbox = sb;
        setSandbox(sb);
        setStage('running');
        
        // Run the preview command
        const result = await sb.run(previewCommand);
        setOutput(result.split('\n'));
      } catch (err) {
        if (!isMounted) return;
        console.error('Preview error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize preview');
        setStage('error');
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
        activeSandbox.cleanup().catch(console.error);
      }
    };
  }, [isOpen, previewCommand]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        {isLoading && (
          <div className="flex items-center gap-2 p-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {stage === 'initializing' && 'Initializing preview...'}
              {stage === 'creating-sandbox' && 'Creating sandbox environment...'}
              {stage === 'running' && 'Starting preview server...'}
            </span>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-destructive bg-destructive/10 rounded-md">
            <strong>Error:</strong> {error}
            <div className="mt-2 text-sm text-muted-foreground">
              Please check your Modal.com API credentials and try again.
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-black text-white p-4 font-mono text-sm">
          {output.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
