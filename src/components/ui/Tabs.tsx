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

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="w-full">
      {/* Scrollable tab strip - touch-friendly on mobile */}
      <div className="border-b-2 border-gray-200 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 sm:gap-2 min-w-max sm:min-w-0 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3 font-medium whitespace-nowrap rounded-t-xl transition-all
                min-h-[48px] sm:min-h-[44px] touch-manipulation
                ${activeTab === tab.id
                  ? 'text-african-green border-b-2 border-african-green -mb-[2px] bg-african-green/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon}
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 sm:mt-6">{children(activeTab)}</div>
    </div>
  );
}
