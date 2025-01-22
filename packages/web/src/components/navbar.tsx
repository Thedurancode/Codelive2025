import { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import {
  PlusIcon,
  ChevronDownIcon,
  SparklesIcon,
  ImportIcon,
  TrashIcon,
  ShareIcon,
  Settings2Icon,
  InfoIcon
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
    <div>
      <GenerateSrcbookModal
        open={showGenSrcbookModal}
        setOpen={setShowGenSrcbookModal}
        openSrcbook={openSrcbook}
      />
      <ImportSrcbookModal open={showImportSrcbookModal} onOpenChange={setShowImportSrcbookModal} />
      <DeleteSrcbookModal open={showDelete} onOpenChange={setShowDelete} session={props.session} />
      <ExportSrcbookModal open={showSave} onOpenChange={setShowSave} session={props.session} />

      <header className="h-24 w-full fixed bg-gradient-to-r from-blue-900 to-blue-800 z-50">
        <nav className="max-w-7xl mx-auto h-full flex items-start">
          <div className="pt-2 pl-4">
            <NavLink to="/" className="flex items-center space-x-6 group">
              <div className="relative">
                <img 
                  src="/assets/logo.png" 
                  alt="Codelive" 
                  className="w-60 h-16 transition-transform duration-200 group-hover:scale-105" 
                />
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Codelive
              </span>
            </NavLink>
          </div>
        </nav>
      </header>
    </div>
  );
}

export function Navbar() {
  return (
    <header className="h-16 w-full flex items-center justify-between fixed bg-black z-50 border-b border-border/20">
      <nav className="w-full flex items-center justify-between px-8">
        <div className="flex-1">
          <NavLink to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/assets/logo.png" 
                alt="Codelive" 
                className="w-48 h-10 transition-transform duration-200 group-hover:scale-105" 
              />
              <div className="absolute -inset-1 bg-red-950/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"></div>
            </div>
          </NavLink>
        </div>

        <div className="flex-1 flex justify-center">
          <ul className="flex items-center gap-12">
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => 
                  `group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-950/20 ${
                    isActive ? 'text-red-700 bg-red-950/10' : 'text-gray-300'
                  }`
                }
              >
                <Settings2Icon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" />
                <span className="text-lg font-semibold">Settings</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => 
                  `group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-red-950/20 ${
                    isActive ? 'text-red-700 bg-red-950/10' : 'text-gray-300'
                  }`
                }
              >
                <InfoIcon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-lg font-semibold">About</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="flex-1 flex justify-end">
          <LightDarkModeDebugChanger />
        </div>
      </nav>
    </header>
  );
}
