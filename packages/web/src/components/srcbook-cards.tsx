import { Sparkles, Circle, PlusIcon, Trash2, Import, LayoutGrid } from 'lucide-react';
import { Button } from '@srcbook/components/src/components/ui/button';
import { CodeLanguageType } from '@srcbook/shared';
import { SrcbookLogo } from './logos';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ExampleSrcbookType } from '@/types';

function LongDashedHorizontalLine(props: { className?: string }) {
  return (
    <div className={props.className}>
      <svg width="1000" height="2" viewBox="0 -1 1000 2" xmlns="http://www.w3.org/2000/svg">
        <line
          x1="0"
          y1="0"
          x2="1000"
          y2="0"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="8, 4"
        />
      </svg>
    </div>
  );
}

function LongDashedVerticalLine(props: { className?: string }) {
  return (
    <div className={props.className}>
      <svg width="2" height="1000" viewBox="-1 0 2 1000" xmlns="http://www.w3.org/2000/svg">
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="1000"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="8, 4"
        />
      </svg>
    </div>
  );
}

export function MainCTACard(props: { srcbook: ExampleSrcbookType; onClick: () => void }) {
  const { srcbook, onClick } = props;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="flex flex-col items-center cursor-pointer border hover:border-foreground transition-colors active:translate-y-0.5 rounded-sm"
      onClick={onClick}
    >
      <div className="w-full grow h-[130px] bg-sb-core-20 rounded-t-[2px] flex items-center justify-center">
        <SrcbookLogo size={64} className="text-sb-core-40" />
      </div>
      <div className="w-full relative overflow-clip">
        <LongDashedHorizontalLine className="absolute top-[10px] text-border" />
        <LongDashedHorizontalLine className="absolute bottom-[10px] text-border" />
        <LongDashedVerticalLine className="absolute left-[10px] top-0 text-border" />
        <LongDashedVerticalLine className="absolute right-[10px] top-0 text-border" />
        <div className="w-full flex-1 p-6 space-y-2">
          <h4 className="h5 line-clamp-2">{srcbook.title}</h4>
          <p className="text-sm text-ter tiary-foreground line-clamp-2">{srcbook.description}</p>
          <div className="flex items-center justify-between">
            <div className="space-x-1">
              {srcbook.tags.map((tag) => (
                <Tag key={tag} value={tag} />
              ))}
            </div>
            <span className="font-mono text-sm text-tertiary-foreground">
              {srcbook.language === 'typescript' ? 'TS' : 'JS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag(props: { value: string }) {
  return (
    <span className="px-1.5 py-1 text-[13px] bg-sb-yellow-20 text-sb-yellow-70 dark:bg-sb-yellow-50 dark:text-sb-core-160 rounded-sm">
      {props.value}
    </span>
  );
}

export function CardContainer({
  className,
  onClick,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  onClick?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
      onClick={onClick}
      className={cn(
        'group border relative rounded-md h-[140px] overflow-hidden cursor-pointer transition-colors text-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

type SrcbookCardPropsType = {
  title: string;
  running: boolean;
  cellCount: number;
  language: CodeLanguageType;
  onClick: () => void;
  onDelete: () => void;
};

export function SrcbookCard(props: SrcbookCardPropsType) {
  function onDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    props.onDelete();
  }

  return (
    <CardContainer
      onClick={props.onClick}
      className={cn(
        'active:translate-y-0.5',
        props.running ? 'border-run' : 'hover:border-foreground',
      )}
    >
      <h5 className="font-medium leading-[18px] line-clamp-2">{props.title}</h5>
      <div className="flex align-bottom items-center justify-between text-tertiary-foreground">
        <div className="text-[13px] flex items-center gap-2">
          {props.running ? (
            <>
              <Circle size={14} strokeWidth={3} className="text-run" />
              <span>Running</span>
            </>
          ) : (
            <span>
              {props.cellCount} {props.cellCount === 1 ? 'Cell' : 'Cells'}
            </span>
          )}
        </div>
        <code className="font-mono group-hover:hidden">
          {props.language === 'javascript' ? 'JS' : 'TS'}
        </code>
        <button
          type="button"
          onClick={onDelete}
          className="hidden group-hover:block hover:text-foreground"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </CardContainer>
  );
}

type AppCardPropsType = {
  name: string;
  updatedAt: number;
  onClick: () => void;
  onDelete: () => void;
};

export function AppCard(props: AppCardPropsType) {
  function onDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    props.onDelete();
  }

  return (
    <CardContainer
      onClick={props.onClick}
      className="group relative bg-[hsl(240_4%_12%)] hover:bg-[hsl(240_4%_14%)] hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 border border-[hsl(240_4%_16%)] hover:border-[hsl(240_4%_20%)] active:translate-y-0 h-[140px] overflow-hidden backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      
      <div className="flex flex-col h-full p-5 relative">
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-white/90 group-hover:text-white transition-colors duration-300">
            {props.name}
          </h3>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Last edited
            </span>
            <span className="text-sm text-white/60">
              {formatTimeAgo(props.updatedAt)}
            </span>
          </div>
          
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </CardContainer>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) {
    return 'just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  }
}

export function GenerateSrcbookButton(props: { onClick: () => void }) {
  return (
    <CardContainer
      onClick={() => props.onClick()}
      className="active:translate-y-0.5 hover:border-foreground"
    >
      <div className="flex flex-col h-full items-start justify-between">
        <Sparkles size={20} />
        <h5 className="font-medium leading-[18px]">Generate Notebook</h5>
      </div>
    </CardContainer>
  );
}

export function CreateSrcbookButton(props: {
  defaultLanguage: CodeLanguageType;
  onSubmit: (language: CodeLanguageType) => void;
}) {
  const [language, setLanguage] = useState(props.defaultLanguage);

  return (
    <div className="space-y-1">
      <CardContainer
        onClick={() => props.onSubmit(language)}
        className="active:translate-y-0.5 hover:border-foreground"
      >
        <div className="flex flex-col h-full items-start justify-between">
          <PlusIcon size={20} />
          <h5 className="font-medium leading-[18px]">Create Notebook</h5>
        </div>
      </CardContainer>

      <div className="flex border rounded-sm bg-background w-fit">
        <Button
          title="Use JavaScript for this Notebook"
          variant="secondary"
          className={cn(
            'border-none rounded-r-none active:translate-y-0 text-muted-foreground bg-muted w-10',
            language === 'javascript' && 'text-foreground font-bold',
          )}
          onClick={() => setLanguage('javascript')}
        >
          JS
        </Button>
        <Button
          title="Use TypeScript for this Notebook"
          variant="secondary"
          className={cn(
            'border-none rounded-l-none active:translate-y-0 text-muted-foreground bg-muted w-10',
            language === 'typescript' && 'text-foreground font-bold',
          )}
          onClick={() => setLanguage('typescript')}
        >
          TS
        </Button>
      </div>
    </div>
  );
}

export function CreateAppButton(props: { defaultLanguage: CodeLanguageType; onClick: () => void }) {
  return (
    <CardContainer
      onClick={() => props.onClick()}
      className="group relative bg-[hsl(240_4%_12%)] hover:bg-[hsl(240_4%_14%)] hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 border border-[hsl(240_4%_16%)] hover:border-[hsl(240_4%_20%)] active:translate-y-0 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-white/5 text-white/80 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
            <PlusIcon size={18} className="transition-transform duration-300 group-hover:rotate-90" />
          </div>
          <h3 className="font-semibold text-lg whitespace-nowrap text-white/80 group-hover:text-white transition-colors duration-300">
            New project
          </h3>
        </div>
      </div>
    </CardContainer>
  );
}

export function ImportSrcbookButton(props: { onClick: () => void }) {
  return (
    <CardContainer
      onClick={() => props.onClick()}
      className="border-dashed hover:border-solid focus-within:border-foreground"
    >
      <div className="flex flex-col h-full items-start justify-between">
        <Import size={20} />
        <div className="flex flex-col items-start gap-1">
          <h5 className="font-medium leading-none">Import Notebook</h5>
        </div>
      </div>
    </CardContainer>
  );
}
