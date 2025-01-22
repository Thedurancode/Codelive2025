import { useEffect, useState } from 'react';
import { CircleCheck, Loader2, CircleX } from 'lucide-react';
import { aiHealthcheck } from '@/lib/server';
import { useSettings } from '@/components/use-settings';
import { AiProviderType, getDefaultModel, type CodeLanguageType } from '@srcbook/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@srcbook/components/src/components/ui/select';
import { Input } from '@srcbook/components/src/components/ui/input';
import useTheme from '@srcbook/components/src/components/use-theme';
import { Switch } from '@srcbook/components/src/components/ui/switch';
import { Button } from '@srcbook/components/src/components/ui/button';

function Settings() {
  const { updateConfig: updateConfigContext, defaultLanguage } = useSettings();

  const updateDefaultLanguage = (value: CodeLanguageType) => {
    updateConfigContext({ defaultLanguage: value });
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <h4 className="h4 mx-auto mb-6">Settings</h4>
      <div className="space-y-10">
        <div>
          <h2 className="text-base font-medium">Enter Your Codelive Api Key</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <a 
                href="https://codelive.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Subscribe to Codelive
              </a>
            </div>
          </div>
          <AiSettings />
        </div>
      </div>
    </div>
  );
}

function AiInfoBanner() {
  const { aiEnabled, aiProvider } = useSettings();

  const fragments = (provider: AiProviderType) => {
    switch (provider) {
      case 'openai':
        return (
          <div className="flex items-center gap-10 bg-sb-yellow-20 text-sb-yellow-80 rounded-sm text-sm font-medium px-3 py-2">
            <p>API key required</p>
            <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">
              Go to {aiProvider}
            </a>
          </div>
        );

      case 'anthropic':
        return (
          <div className="flex items-center gap-10 bg-sb-yellow-20 text-sb-yellow-80 rounded-sm text-sm font-medium px-3 py-2">
            <p>API key required</p>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              className="underline"
            >
              Go to {aiProvider}
            </a>
          </div>
        );

      case 'Xai':
        return (
          <div className="flex items-center gap-10 bg-sb-yellow-20 text-sb-yellow-80 rounded-sm text-sm font-medium px-3 py-2">
            <p>API key required</p>
          </div>
        );

      case 'Gemini':
        return (
          <div className="flex items-center gap-10 bg-sb-yellow-20 text-sb-yellow-80 rounded-sm text-sm font-medium px-3 py-2">
            <p>API key required</p>
          </div>
        );

      case 'custom':
        return (
          <div className="flex items-center gap-10 bg-sb-yellow-20 text-sb-yellow-80 rounded-sm text-sm font-medium px-3 py-2">
            <p>Base URL required</p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-1">
      {aiEnabled ? <TestAiButton /> : fragments(aiProvider)}
    </div>
  );
}

const TestAiButton = () => {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const TIMEOUT = 2500;
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      const timeout = setTimeout(() => setState('idle'), TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  const check = () => {
    setState('loading');
    aiHealthcheck()
      .then((res) => {
        setState(res.error ? 'error' : 'success');
      })
      .catch((err) => {
        console.error(err);
        setState('error');
      });
  };
  return (
    <>
      {state === 'idle' && (
        <div>
          <button
            className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border hover:bg-muted hover:text-secondary-hover rounded-sm text-sm font-medium px-3 py-1"
            onClick={check}
          >
            Test Connection
          </button>
        </div>
      )}
      {state === 'loading' && (
        <div className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border hover:bg-muted hover:text-secondary-hover rounded-sm text-sm font-medium px-3 py-1">
          <Loader2 size={16} className="animate-spin" />
          <p>Testing</p>
        </div>
      )}
      {state === 'success' && (
        <div className="flex items-center gap-2 bg-sb-green-20 text-sb-green-80 rounded-sm text-sm font-medium px-3 py-1 w-fit">
          <CircleCheck size={16} />
          <p>Success</p>
        </div>
      )}
      {state === 'error' && (
        <div className="flex items-center gap-2 bg-error text-error-foreground rounded-sm text-sm font-medium px-3 py-1 w-fit">
          <CircleX size={16} />
          <p>Error (check logs)</p>
        </div>
      )}
    </>
  );
};

type AiSettingsProps = {
  saveButtonLabel?: string;
};

export function AiSettings({ saveButtonLabel }: AiSettingsProps) {
  const {
    aiProvider,
    aiModel,
    xaiKey: configXaiKey,
    updateConfig: updateConfigContext,
  } = useSettings();

  const [xaiKey, setXaiKey] = useState<string>(configXaiKey ?? '');
  const model = "deepseek-chat";

  // Either the key from the server is null/undefined and the user entered input
  // or the key from the server is a string and the user entered input is different.
  const xaiKeySaveEnabled =
    (typeof configXaiKey === 'string' && xaiKey !== configXaiKey) ||
    ((configXaiKey === null || configXaiKey === undefined) && xaiKey.length > 0);

  useEffect(() => {
    // Set XAI as default provider on component mount
    if (aiProvider !== 'Xai') {
      updateConfigContext({ aiProvider: 'Xai', aiModel: model });
    }
  }, []);

  return (
    <>
      <div className="flex items-center justify-between w-full mb-2 min-h-10">
        
        <AiInfoBanner />
      </div>

      <div className="flex gap-2">
        <Input
          name="xaiKey"
          placeholder="xai API key"
          type="password"
          value={xaiKey}
          onChange={(e) => setXaiKey(e.target.value)}
        />
        <Button
          className="px-5"
          onClick={() => updateConfigContext({ xaiKey, aiModel: model })}
          disabled={!xaiKeySaveEnabled}
        >
          {saveButtonLabel ?? 'Save'}
        </Button>
      </div>
    </>
  );
}

export default Settings;
