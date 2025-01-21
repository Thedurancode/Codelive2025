import { PlusIcon } from 'lucide-react';
import { DropdownMenuItem } from '@srcbook/components/src/components/ui/dropdown-menu';

const CreateAppButton = () => {
  return (
    <DropdownMenuItem className="cursor-pointer">
      <PlusIcon className="mr-2 h-4 w-4" />
      <span>Create New App</span>
    </DropdownMenuItem>
  );
};

export default CreateAppButton;
