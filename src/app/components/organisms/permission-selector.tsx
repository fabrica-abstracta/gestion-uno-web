import { useState } from "react";
import type { Module } from "../../core/types/users";

interface PermissionSelectorProps {
  modules: Module[];
  selectedPermissions: Record<string, string[]> | undefined;
  onChange: (permissions: Record<string, string[]>) => void;
}

export default function PermissionSelector({ modules, selectedPermissions, onChange }: PermissionSelectorProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  // Asegurarse de que selectedPermissions siempre sea un objeto
  const permissions = selectedPermissions || {};

  const toggleModule = (moduleCode: string) => {
    if (expandedModules.includes(moduleCode)) {
      setExpandedModules(expandedModules.filter(m => m !== moduleCode));
    } else {
      setExpandedModules([...expandedModules, moduleCode]);
    }
  };

  const togglePermission = (pageCode: string, permissionCode: string) => {
    const current = permissions[pageCode] || [];
    const updated = current.includes(permissionCode)
      ? current.filter(p => p !== permissionCode)
      : [...current, permissionCode];
    
    onChange({
      ...permissions,
      [pageCode]: updated
    });
  };

  const toggleAllPagePermissions = (pageCode: string, availablePermissions: string[]) => {
    const current = permissions[pageCode] || [];
    const allSelected = availablePermissions.every(p => current.includes(p));
    
    onChange({
      ...permissions,
      [pageCode]: allSelected ? [] : availablePermissions
    });
  };

  const getPermissionLabel = (code: string) => {
    const labels: Record<string, string> = {
      read: "Lectura",
      create: "Creación",
      update: "Actualización",
      delete: "Eliminación",
      import: "Importación",
      export: "Exportación"
    };
    return labels[code] || code;
  };

  const getPermissionColor = (code: string) => {
    const colors: Record<string, string> = {
      read: "bg-blue-100 text-blue-800",
      create: "bg-green-100 text-green-800",
      update: "bg-yellow-100 text-yellow-800",
      delete: "bg-red-100 text-red-800",
      import: "bg-purple-100 text-purple-800",
      export: "bg-indigo-100 text-indigo-800"
    };
    return colors[code] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {modules.map((module) => {
        const isExpanded = expandedModules.includes(module.code);
        
        return (
          <div key={module.code} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleModule(module.code)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold text-gray-900">{module.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {module.pages.length} página{module.pages.length !== 1 ? 's' : ''}
              </span>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-4 bg-white">
                {module.pages.map((page) => {
                  const pagePermissions = permissions[page.code] || [];
                  const allSelected = page.permissions.every((p) => pagePermissions.includes(p));

                  return (
                    <div key={page.code} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{page.name}</h4>
                        <button
                          type="button"
                          onClick={() => toggleAllPagePermissions(page.code, page.permissions)}
                          className={`text-xs font-medium px-3 py-1 rounded ${
                            allSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {page.permissions.map((permission) => {
                          const isSelected = pagePermissions.includes(permission);

                          return (
                            <button
                              key={permission}
                              type="button"
                              onClick={() => togglePermission(page.code, permission)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                                isSelected
                                  ? `${getPermissionColor(permission)} border-current`
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {getPermissionLabel(permission)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
