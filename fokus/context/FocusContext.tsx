import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NativeModules } from "react-native";

export type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type FocusCategory = "focus" | "goal" | "quote" | "reminder";

export interface FocusItem {
  id: string;
  text: string;
  category: FocusCategory;
  createdAt: string;
}

interface FocusContextValue {
  current: FocusItem | null;
  history: FocusItem[];
  isLoading: boolean;
  setFocus: (text: string, category: FocusCategory) => Promise<void>;
  activateHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY_CURRENT = "@fokus/current";
const STORAGE_KEY_HISTORY = "@fokus/history";
const HISTORY_CAP = 20;

const FocusContext = createContext<FocusContextValue | undefined>(undefined);

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function tryUpdateNativeWidget(item: FocusItem | null): void {
  try {
    const bridge = (NativeModules as { FokusWidgetBridge?: { updateData?: (json: string) => void } })
      .FokusWidgetBridge;
    if (!bridge || typeof bridge.updateData !== "function") return;
    const payload = item
      ? JSON.stringify({
          text: item.text,
          category: item.category,
          lastUpdated: item.createdAt,
        })
      : JSON.stringify({
          text: "",
          category: "focus",
          lastUpdated: new Date().toISOString(),
        });
    bridge.updateData(payload);
  } catch {
    // Expo Go or any other failure — never crash the JS layer.
  }
}

function dedupeAndCap(items: FocusItem[]): FocusItem[] {
  const seen = new Set<string>();
  const result: FocusItem[] = [];
  for (const item of items) {
    const key = item.text.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= HISTORY_CAP) break;
  }
  return result;
}

interface ProviderProps {
  children: React.ReactNode;
}

export function FocusProvider({ children }: ProviderProps) {
  const [current, setCurrent] = useState<FocusItem | null>(null);
  const [history, setHistory] = useState<FocusItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rawCurrent, rawHistory] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_CURRENT),
          AsyncStorage.getItem(STORAGE_KEY_HISTORY),
        ]);
        if (cancelled) return;
        const parsedCurrent: FocusItem | null = rawCurrent ? JSON.parse(rawCurrent) : null;
        const parsedHistory: FocusItem[] = rawHistory ? JSON.parse(rawHistory) : [];
        setCurrent(parsedCurrent);
        setHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
        tryUpdateNativeWidget(parsedCurrent);
      } catch {
        // Corrupt storage — start fresh.
        setCurrent(null);
        setHistory([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    async (nextCurrent: FocusItem | null, nextHistory: FocusItem[]) => {
      setCurrent(nextCurrent);
      setHistory(nextHistory);
      await Promise.all([
        nextCurrent
          ? AsyncStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(nextCurrent))
          : AsyncStorage.removeItem(STORAGE_KEY_CURRENT),
        AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(nextHistory)),
      ]);
      tryUpdateNativeWidget(nextCurrent);
    },
    [],
  );

  const setFocus = useCallback<FocusContextValue["setFocus"]>(
    async (text, category) => {
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      const next: FocusItem = {
        id: makeId(),
        text: trimmed.slice(0, 140),
        category,
        createdAt: new Date().toISOString(),
      };
      const rotated = current ? [current, ...history] : history;
      const nextHistory = dedupeAndCap(
        rotated.filter((it) => it.text.trim().toLowerCase() !== next.text.trim().toLowerCase()),
      );
      await persist(next, nextHistory);
    },
    [current, history, persist],
  );

  const activateHistoryItem = useCallback<FocusContextValue["activateHistoryItem"]>(
    async (id) => {
      const target = history.find((it) => it.id === id);
      if (!target) return;
      const remaining = history.filter((it) => it.id !== id);
      const rotated = current ? [current, ...remaining] : remaining;
      const nextHistory = dedupeAndCap(
        rotated.filter((it) => it.text.trim().toLowerCase() !== target.text.trim().toLowerCase()),
      );
      const activated: FocusItem = { ...target, createdAt: new Date().toISOString() };
      await persist(activated, nextHistory);
    },
    [current, history, persist],
  );

  const clearHistory = useCallback<FocusContextValue["clearHistory"]>(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);
    tryUpdateNativeWidget(current);
  }, [current]);

  const value = useMemo<FocusContextValue>(
    () => ({ current, history, isLoading, setFocus, activateHistoryItem, clearHistory }),
    [current, history, isLoading, setFocus, activateHistoryItem, clearHistory],
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus(): FocusContextValue {
  const ctx = useContext(FocusContext);
  if (!ctx) {
    throw new Error("useFocus must be used inside <FocusProvider>");
  }
  return ctx;
}

export const CATEGORY_META: Record<
  FocusCategory,
  { label: string; description: string; icon: IoniconName }
> = {
  focus: {
    label: "Today's Focus",
    description: "One thing to anchor your day.",
    icon: "locate",
  },
  goal: {
    label: "Goal",
    description: "Something you're working toward.",
    icon: "flag",
  },
  quote: {
    label: "Quote",
    description: "Words to keep you grounded.",
    icon: "chatbubble-ellipses",
  },
  reminder: {
    label: "Reminder",
    description: "A nudge for your future self.",
    icon: "notifications",
  },
};
