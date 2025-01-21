import { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import {
  PlusIcon,
  ChevronDownIcon,
  SparklesIcon,
  ImportIcon,
  TrashIcon,
  ShareIcon,
} from 'lucide-react';
import { TitleCellType } from '@srcbook/shared';

import { SessionType } from '@/types';
import { Button } from '@srcbook/components/src/components/ui/button';
import GenerateSrcbookModal from '@/components/generate-srcbook-modal';
import DeleteSrcbookModal from '@/components/delete-srcbook-dialog';
import { ExportSrcbookModal, ImportSrcbookModal } from '@/components/import-export-srcbook-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@srcbook/components/src/components/ui/dropdown-menu';
import { createSession, createSrcbook } from '@/lib/server';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@srcbook/components/src/components/ui/tooltip';

function LightDarkModeDebugChanger() {
  return null;
}

type SessionNavbarProps = {
  readOnly?: boolean;
  session: SessionType;
  srcbooks: Array<SessionType>;
  title: string;
  baseDir: string;
};

export function SessionNavbar(props: SessionNavbarProps) {
  const navigate = useNavigate();

  const [showGenSrcbookModal, setShowGenSrcbookModal] = useState(false);
  const [showImportSrcbookModal, setShowImportSrcbookModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const srcbooks = props.srcbooks.sort((a, b) => b.openedAt - a.openedAt).slice(0, 6);

  async function openSrcbook(path: string) {
    setShowGenSrcbookModal(false);
    setShowImportSrcbookModal(false);
    setShowSave(false);

    const { result: srcbook } = await createSession({ path });
    navigate(`/srcbooks/${srcbook.id}`);
  }

  async function onCreateSrcbook() {
    const { result } = await createSrcbook({
      path: props.baseDir,
      name: 'Untitled',
      language: props.session.language,
    });
    openSrcbook(result.path);
  }

  return (
    <>
      <GenerateSrcbookModal
        open={showGenSrcbookModal}
        setOpen={setShowGenSrcbookModal}
        openSrcbook={openSrcbook}
      />
      <ImportSrcbookModal open={showImportSrcbookModal} onOpenChange={setShowImportSrcbookModal} />
      <DeleteSrcbookModal open={showDelete} onOpenChange={setShowDelete} session={props.session} />
      <ExportSrcbookModal open={showSave} onOpenChange={setShowSave} session={props.session} />

      <header className="h-12 w-full flex items-center justify-between fixed bg-background z-50 border-b border-border text-sm font-medium">
        <nav className="flex items-center justify-between px-4 flex-1">
          <div className="flex items-center gap-2">
            <NavLink to="/">
              <h1 className="font-mono font-bold">
                Codelive
              </h1>
            </NavLink>

            <span className="select-none">/</span>

            {srcbooks.length < 2 ? (
              <span className="px-1.5">{props.title}</span>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="icon" className="font-normal px-1.5 active:translate-y-0">
                    <div className="flex items-center gap-1 font-medium">
                      {props.title}
                      <ChevronDownIcon size={12} />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {srcbooks.map((srcbook) => {
                    if (srcbook.id === props.session.id) {
                      return null;
                    }
                    const titleCell = srcbook.cells.find((cell) => cell.type === 'title') as
                      | TitleCellType
                      | undefined;
                    if (!titleCell) {
                      return null;
                    }

                    return (
                      <DropdownMenuItem
                        key={srcbook.id}
                        onClick={() => navigate(`/srcbooks/${srcbook.id}`)}
                        className="cursor-pointer"
                      >
                        {titleCell.text}
                      </DropdownMenuItem>
                    );
                  })}

                  {props.srcbooks.length > 6 ? (
                    <DropdownMenuItem asChild className="cursor-pointer border-t mt-2 pt-2">
                      <Link to="/">See all</Link>
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!props.readOnly ? (
              <>
                <div className="w-[1px] h-5 bg-border" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="icon" className="w-8 h-8 p-0 active:translate-y-0">
                      <PlusIcon size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={onCreateSrcbook} className="cursor-pointer">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      <span>Create Srcbook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setTimeout(() => {
                          setShowGenSrcbookModal(true);
                        }, 0);
                      }}
                      className="cursor-pointer"
                    >
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      <span>Generate Srcbook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setTimeout(() => {
                          setShowImportSrcbookModal(true);
                        }, 0);
                      }}
                      className="cursor-pointer"
                    >
                      <ImportIcon className="mr-2 h-4 w-4" />
                      <span>Open Notebook</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>

          <LightDarkModeDebugChanger />

          <div className="flex items-center gap-2">
            {!props.readOnly ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => setShowDelete(true)}
                      className="active:translate-y-0"
                    >
                      <TrashIcon size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete this Srcbook</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => setShowSave(true)}
              className="active:translate-y-0"
            >
              <div className="flex gap-2">
                <ShareIcon size={16} />
                Share
              </div>
            </Button>
          </div>
        </nav>
      </header>
    </>
  );
}

export function Navbar() {
  return (
    <header className="h-12 w-full flex items-center justify-between fixed bg-background z-50 border-b border-border text-sm">
      <nav className="flex items-center justify-between px-4 flex-1">
        <div className="flex items-center gap-6">
          <NavLink to="/">
            <h1 className="font-mono font-bold">
              Codelive
            </h1>
          </NavLink>

          <ul className="flex items-center gap-6">
            <li>
              <NavLink
                to="/secrets"
                className="font-semibold text-tertiary-foreground visited:text-tertiary-foreground hover:text-foreground transition-colors"
              >
                Secrets
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className="font-semibold text-tertiary-foreground visited:text-tertiary-foreground hover:text-foreground transition-colors"
              >
                Settings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className="font-semibold text-tertiary-foreground visited:text-tertiary-foreground hover:text-foreground transition-colors"
              >
                About
              </NavLink>
            </li>
          </ul>
        </div>

        <LightDarkModeDebugChanger />

        <div className="flex items-center gap-2"></div>
      </nav>
    </header>
  );
}
