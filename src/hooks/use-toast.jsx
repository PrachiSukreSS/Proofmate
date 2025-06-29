import { useEffect, useState } from "react";

const LIMIT = 3, REMOVE_DELAY = 4000;
let id = 0, state = { toasts: [] };
const timeouts = new Map(), listeners = [];

const dispatch = (action) => {
  state = reducer(state, action);
  listeners.forEach((fn) => fn(state));
};

const reducer = (s, a) => {
  switch (a.type) {
    case "ADD": return { ...s, toasts: [a.toast, ...s.toasts].slice(0, LIMIT) };
    case "UPDATE": return { ...s, toasts: s.toasts.map(t => t.id === a.toast.id ? { ...t, ...a.toast } : t) };
    case "DISMISS":
      const ids = a.id ? [a.id] : s.toasts.map(t => t.id);
      ids.forEach(queueRemove);
      return { ...s, toasts: s.toasts.map(t => ids.includes(t.id) ? { ...t, open: false } : t) };
    case "REMOVE":
      return { ...s, toasts: a.id ? s.toasts.filter(t => t.id !== a.id) : [] };
    default: return s;
  }
};

const queueRemove = (id) => {
  if (timeouts.has(id)) return;
  timeouts.set(id, setTimeout(() => {
    timeouts.delete(id);
    dispatch({ type: "REMOVE", id });
  }, REMOVE_DELAY));
};

const toast = ({ ...props }) => {
  const toastId = (++id).toString();
  const dismiss = () => {
    clearTimeout(timeouts.get(toastId));
    dispatch({ type: "REMOVE", id: toastId });
  };
  dispatch({
    type: "ADD",
    toast: {
      ...props,
      id: toastId,
      open: true,
      onOpenChange: (o) => !o && dismiss()
    },
  });
  return { id: toastId, dismiss };
};

const useToast = () => {
  const [s, set] = useState(state);
  useEffect(() => {
    listeners.push(set);
    return () => listeners.splice(listeners.indexOf(set), 1);
  }, []);
  return {
    ...s,
    toast,
    dismiss: (id) => {
      clearTimeout(timeouts.get(id));
      dispatch({ type: "REMOVE", id });
    },
    dismissAll: () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      dispatch({ type: "REMOVE" });
    }
  };
};

export { useToast, toast };
