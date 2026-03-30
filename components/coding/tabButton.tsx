import { Button } from "../ui/button";
import { ReactNode } from "react";

interface TabButtonProps<T extends string> {
  tabs: readonly { id: T; icon: React.ComponentType<{ className?: string }>; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
  extraContent?: ReactNode;
}

export function TabButtons<T extends string>({
  tabs,
  activeTab,
  onChange,
  extraContent,
}: TabButtonProps<T>) {
  return (
    <div className="flex items-center border-b border-[#30363d] bg-[#161b22] shrink-0 overflow-x-auto">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(tab.id)}
          className="flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap rounded-none cursor-pointer"
        >
          <tab.icon className="h-3.5 w-3.5" />
          {tab.label}
          {extraContent && activeTab === tab.id && extraContent}
        </Button>
      ))}
    </div>
  );
}

export default TabButtons;