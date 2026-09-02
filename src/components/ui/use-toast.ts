import { toast as realToast } from "./toast";

export function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  const type = props.variant === "destructive" ? "error" : "info";
  realToast.add({
    title: props.title,
    description: props.description,
    type,
  });
}

export function useToast() {
  return {
    toast,
  };
}
