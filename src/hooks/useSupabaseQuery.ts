import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useSupabaseQuery<T = any>(
  tableName: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: [tableName, options],
    enabled: options?.enabled !== false,
    queryFn: async () => {
      const client: any = supabase;
      let query = client.from(tableName).select(options?.select || '*');
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as T[];
    },
  });
}

export function useSupabaseInsert<T = any>(tableName: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (insertData: Record<string, any>) => {
      const client: any = supabase;

      // Ensure common owner fields are set so RLS policies expecting auth.uid() pass
      const ownerFields = ['created_by', 'user_id'];
      const payload = { ...insertData };
      if (user) {
        ownerFields.forEach((f) => {
          if (payload[f] === undefined || payload[f] === null || payload[f] === '') {
            payload[f] = user.id;
          }
        });
      }

      const { data: result, error } = await client
        .from(tableName)
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast.success('Record created successfully');
    },
    onError: (error: Error) => {
      const msg = error.message || String(error);
      if (msg.toLowerCase().includes('violates row-level security policy')) {
        toast.error('Insert blocked by row-level security policy. Ensure the client is authenticated with Supabase and that the record includes the correct owner field (e.g. created_by = auth.uid()). Check RLS policies in Supabase dashboard.');
      } else {
        toast.error(msg || 'Failed to create record');
      }
    },
  });
}

export function useSupabaseUpdate<T = any>(tableName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const client: any = supabase;
      const { data: result, error } = await client
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast.success('Record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update record');
    },
  });
}

export function useSupabaseDelete(tableName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast.success('Record deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });
}
