import { useEffect, useState } from 'react';
import { Sandbox } from 'e2b';

declare global {
  interface Window {
    e2b: {
      Sandbox: typeof Sandbox;
    };
  }
}

type E2BSandboxProps = {
  onReady: (url: string) => void;
  onError: (error: Error) => void;
  apiKey: string;
};

export function E2BSandbox({ onReady, onError, apiKey }: E2BSandboxProps) {
  const [sandbox, setSandbox] = useState<Sandbox | null>(null);

  useEffect(() => {
    let activeSandbox: Sandbox | null = null;
    
    const initSandbox = async () => {
      try {
        const sandbox = await window.e2b.Sandbox.create(
          'nodejs',
          {
            apiKey,
            envs: {
              NODE_ENV: 'development'
            }
          }
        );
        
        setSandbox(sandbox);
        activeSandbox = sandbox;
        onReady((sandbox as any).getHostname());
      } catch (error) {
        onError(error as Error);
      }
    };

    initSandbox();

    return () => {
      if (activeSandbox) {
        (activeSandbox as any).close().catch(() => {});
      }
    };
  }, [onReady, onError]);

  if (!sandbox) {
    return null;
  }

  return (
    <iframe
      src={(sandbox as any).getHostname()}
      className="w-full h-full"
      title="E2B Sandbox"
    />
  );
}
