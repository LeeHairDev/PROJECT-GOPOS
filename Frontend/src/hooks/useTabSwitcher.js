import { useState, useCallback } from "react";

export function useTabSwitcher(defaultTab = "dashboard") {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [tabHistory, setTabHistory] = useState([defaultTab]);

  const switchTab = useCallback((tabName) => {
    setActiveTab(tabName);
    setTabHistory((prev) => [...prev, tabName]);
  }, []);

  const goBack = useCallback(() => {
    if (tabHistory.length > 1) {
      const newHistory = tabHistory.slice(0, -1);
      setTabHistory(newHistory);
      setActiveTab(newHistory[newHistory.length - 1]);
    }
  }, [tabHistory]);

  const reset = useCallback(() => {
    setActiveTab(defaultTab);
    setTabHistory([defaultTab]);
  }, [defaultTab]);

  return {
    activeTab,
    tabHistory,
    switchTab,
    goBack,
    reset,
    canGoBack: tabHistory.length > 1,
  };
}
