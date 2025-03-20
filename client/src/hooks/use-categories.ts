import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Category, InsertCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Hook to fetch and manage categories
export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all categories
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Add a new category
  const addCategory = useMutation({
    mutationFn: async (newCategory: Omit<InsertCategory, "userId">) => {
      const res = await apiRequest("POST", "/api/categories", newCategory);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "Your new category has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating category",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update a category
  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertCategory>) => {
      const res = await apiRequest("PATCH", `/api/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category updated",
        description: "Your category has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating category",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete a category
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "Your category has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting category",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get category by ID (useful for getting color information)
  const getCategoryById = (id?: number) => {
    return categories.find(cat => cat.id === id);
  };

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
