import { useState, useEffect } from "react";

interface InventorySettings {
  refreshInterval: number;
}

const SETTINGS_KEY = "inventory_settings";

const defaultSettings: InventorySettings = {
  refreshInterval: 0,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<InventorySettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [settings]);

  const updateSettings = (updates: Partial<InventorySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const clearSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_KEY);
  };

  return { settings, updateSettings, clearSettings };
};
