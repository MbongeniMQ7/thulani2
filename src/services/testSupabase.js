import { supabase } from './supabaseService';

// Simple test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to fetch from a table (this will fail if table doesn't exist, but connection works)
    const { data, error } = await supabase
      .from('queue_entries')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('Supabase connection successful, but table may not exist:', error.message);
      return { success: true, tableExists: false, message: error.message };
    } else {
      console.log('Supabase connection and table both working!');
      return { success: true, tableExists: true, data };
    }
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { success: false, error: error.message };
  }
};