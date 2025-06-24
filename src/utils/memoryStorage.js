const STORAGE_KEY = "memories";

export const generateId = () => {
  return "memory_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
};

export const saveMemory = (memory) => {
  try {
    const memories = getMemories();
    const newMemory = {
      ...memory,
      id: memory.id || generateId(),
      timestamp: memory.timestamp || new Date().toISOString(),
    };

    memories.unshift(newMemory); // Add to beginning for chronological order
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));

    console.log("Memory saved successfully:", newMemory);
    return newMemory;
  } catch (error) {
    console.error("Error saving memory:", error);
    throw error;
  }
};

export const getMemories = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading memories:", error);
    return [];
  }
};

export const getMemoryById = (id) => {
  const memories = getMemories();
  return memories.find((memory) => memory.id === id);
};

export const updateMemory = (id, updatedMemory) => {
  try {
    const memories = getMemories();
    const index = memories.findIndex((memory) => memory.id === id);

    if (index !== -1) {
      memories[index] = { ...memories[index], ...updatedMemory };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
      return memories[index];
    }

    throw new Error("Memory not found");
  } catch (error) {
    console.error("Error updating memory:", error);
    throw error;
  }
};

export const deleteMemory = (id) => {
  try {
    const memories = getMemories();
    const filteredMemories = memories.filter((memory) => memory.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredMemories));
    return true;
  } catch (error) {
    console.error("Error deleting memory:", error);
    throw error;
  }
};

export const searchMemories = (query) => {
  const memories = getMemories();
  const lowercaseQuery = query.toLowerCase();

  return memories.filter(
    (memory) =>
      memory.title?.toLowerCase().includes(lowercaseQuery) ||
      memory.summary?.toLowerCase().includes(lowercaseQuery) ||
      memory.transcript?.toLowerCase().includes(lowercaseQuery) ||
      memory.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(lowercaseQuery)
      )
  );
};
