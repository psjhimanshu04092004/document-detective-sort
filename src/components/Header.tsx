
import React from 'react';
import { FileSearch, Github } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSearch className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Document Detective</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              AI-powered document sorting
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
