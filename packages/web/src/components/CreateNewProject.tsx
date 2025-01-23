import { useState } from 'react';
import CreateAppButton from './CreateAppButton';

interface ProjectForm {
  name: string;
  description: string;
  template: string;
}

export default function CreateNewProject() {
  const [formData, setFormData] = useState<ProjectForm>({
    name: '',
    description: '',
    template: 'react-typescript',
  });

  const templates = [
    { value: 'react-typescript', label: 'React + TypeScript' },
    { value: 'react-javascript', label: 'React + JavaScript' },
    { value: 'node-typescript', label: 'Node.js + TypeScript' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement project creation logic
    console.log('Creating project:', formData);
  };

  return (
    <div className="w-[600px] mx-auto p-8 group relative bg-[hsl(240_4%_12%)] hover:bg-[hsl(240_4%_14%)] hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 border border-[hsl(240_4%_16%)] hover:border-[hsl(240_4%_20%)] active:translate-y-0 rounded-lg backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      
      <h2 className="text-3xl font-bold mb-8 text-white/90 group-hover:text-white transition-colors duration-300">Create New Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[hsl(240_4%_10%)] border-[hsl(240_4%_16%)] text-white/90 focus:border-[hsl(240_4%_20%)] focus:ring-[hsl(240_4%_20%)] sm:text-sm p-2.5 transition-colors duration-300"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[hsl(240_4%_10%)] border-[hsl(240_4%_16%)] text-white/90 focus:border-[hsl(240_4%_20%)] focus:ring-[hsl(240_4%_20%)] sm:text-sm p-2.5 transition-colors duration-300"
              rows={4}
            />
          </div>

          <div>
            <label htmlFor="template" className="block text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300 mb-2">
              Template
            </label>
            <select
              id="template"
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="mt-1 block w-full rounded-md bg-[hsl(240_4%_10%)] border-[hsl(240_4%_16%)] text-white/90 focus:border-[hsl(240_4%_20%)] focus:ring-[hsl(240_4%_20%)] sm:text-sm p-2.5 transition-colors duration-300"
            >
              {templates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-[hsl(240_4%_20%)] text-white/90 hover:bg-[hsl(240_4%_22%)] hover:text-white rounded-md px-6 py-3 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(240_4%_20%)] focus-visible:ring-offset-2"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
