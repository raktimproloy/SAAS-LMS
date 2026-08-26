export function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  // Fallback toast function that just logs to console
  console.log("Toast:", props);
}

export function useToast() {
  return {
    toast,
  };
}
