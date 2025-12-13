import React, { useState } from 'react';
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}
interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}
export function Tabs({
  tabs,
  defaultTab,
  onChange,
  children
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };
  return <div className="w-full">
      <div className="flex gap-2 border-b-2 border-gray-200 overflow-x-auto">
        {tabs.map(tab => <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-african-green border-b-2 border-african-green -mb-[2px]' : 'text-gray-600 hover:text-gray-900'}`}>
            {tab.icon}
            {tab.label}
          </button>)}
      </div>
      <div className="mt-6">{children(activeTab)}</div>
    </div>;
}