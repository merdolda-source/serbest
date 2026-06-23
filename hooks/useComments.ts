import { useEffect, useState } from "react";
import { subscribeToTopLevelComments } from "@/services/commentService";
import type { AsyncState, Comment } from "@/utils/types";

export function useComments(contentId: string) {
  const [state, setState] = useState<AsyncState<Comment[]>>({ status: "loading" });

  useEffect(() => {
    setState({ status: "loading" });
    const unsubscribe = subscribeToTopLevelComments(
      contentId,
      (items) => setState({ status: "success", data: items }),
      (error) => setState({ status: "error", error: error.message })
    );
    return unsubscribe;
  }, [contentId]);

  return state;
}
