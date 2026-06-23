import { useEffect, useState } from "react";
import { subscribeToFeed } from "@/services/contentService";
import type { AsyncState, CategorySlug, Content } from "@/utils/types";

export function useContents(category: CategorySlug | "all") {
  const [state, setState] = useState<AsyncState<Content[]>>({ status: "loading" });

  useEffect(() => {
    setState({ status: "loading" });
    const unsubscribe = subscribeToFeed(
      category,
      (items) => setState({ status: "success", data: items }),
      (error) => setState({ status: "error", error: error.message })
    );
    return unsubscribe;
  }, [category]);

  return state;
}
