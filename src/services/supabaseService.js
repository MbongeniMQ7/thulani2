import { createClient } from '@supabase/supabase-js';
import { EmailNotificationService } from './emailService';

// Supabase configuration
const SUPABASE_URL = 'https://imiojmzohfizckxbnfmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaW9qbXpvaGZpemNreGJuZm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzU5NDQsImV4cCI6MjA3MzcxMTk0NH0.UFLP33abaKTI1PC4BvejFBiVhjKaZhw5G7pPtaypFG8';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Queue service functions
export class QueueService {
  
  /**
   * Add a user to the queue
   * @param {Object} queueEntry - The queue entry object
   * @param {string} queueEntry.firstName - User's first name
   * @param {string} queueEntry.lastName - User's last name
   * @param {string} queueEntry.email - User's email address
   * @param {string} queueEntry.reason - Reason for joining queue
   * @param {string} queueEntry.queueType - 'overseer' or 'pastor'
   * @returns {Promise<Object>} The created queue entry
   */
  static async addToQueue({ firstName, lastName, email, reason, queueType }) {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            email: email,
            reason: reason,
            queue_type: queueType,
            status: 'waiting',
            created_at: new Date().toISOString(),
            position: await this.getNextPosition(queueType)
          }
        ])
        .select();

      if (error) {
        console.error('Error adding to queue:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in addToQueue:', error);
      throw error;
    }
  }

  /**
   * Get the next position in queue for a specific queue type
   * @param {string} queueType - 'overseer' or 'pastor'
   * @returns {Promise<number>} The next position number
   */
  static async getNextPosition(queueType) {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('position')
        .eq('queue_type', queueType)
        .eq('status', 'waiting')
        .order('position', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error getting next position:', error);
        return 1; // Return 1 if table doesn't exist yet
      }

      return data && data.length > 0 ? data[0].position + 1 : 1;
    } catch (error) {
      console.error('Error in getNextPosition:', error);
      return 1;
    }
  }

  /**
   * Get current queue count for a specific queue type
   * @param {string} queueType - 'overseer' or 'pastor'
   * @returns {Promise<number>} The current queue count
   */
  static async getQueueCount(queueType) {
    try {
      const { count, error } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('queue_type', queueType)
        .eq('status', 'waiting');

      if (error) {
        console.error('Error getting queue count:', error);
        return 0; // Return 0 if table doesn't exist yet
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getQueueCount:', error);
      return 0;
    }
  }

  /**
   * Get all waiting queue entries for a specific queue type
   * @param {string} queueType - 'overseer' or 'pastor'
   * @returns {Promise<Array>} Array of queue entries
   */
  static async getQueueEntries(queueType) {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('queue_type', queueType)
        .eq('status', 'waiting')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error getting queue entries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getQueueEntries:', error);
      return [];
    }
  }

  /**
   * Get all queue entries (all queue types and statuses)
   * @returns {Promise<Array>} Array of all queue entries
   */
  static async getAllQueueEntries() {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all queue entries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllQueueEntries:', error);
      return [];
    }
  }

  /**
   * Update queue entry status
   * @param {number} id - Queue entry ID
   * @param {string} status - New status ('waiting', 'in_consultation', 'completed', 'cancelled')
   * @returns {Promise<Object>} Updated queue entry
   */
  static async updateQueueStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating queue status:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in updateQueueStatus:', error);
      throw error;
    }
  }

  /**
   * Remove user from queue
   * @param {number} id - Queue entry ID
   * @returns {Promise<boolean>} Success status
   */
  static async removeFromQueue(id) {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing from queue:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in removeFromQueue:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time queue updates
   * @param {string} queueType - 'overseer' or 'pastor'
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  static subscribeToQueueUpdates(queueType, callback) {
    return supabase
      .channel(`queue_${queueType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `queue_type=eq.${queueType}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Get queue statistics
   * @returns {Promise<Object>} Queue statistics
   */
  static async getQueueStats() {
    try {
      const [overseerCount, pastorCount] = await Promise.all([
        this.getQueueCount('overseer'),
        this.getQueueCount('pastor')
      ]);

      // Get today's completed consultations
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCompleted, error } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('updated_at', `${today}T00:00:00.000Z`)
        .lt('updated_at', `${today}T23:59:59.999Z`);

      if (error) {
        console.error('Error getting today\'s stats:', error);
      }

      return {
        overseerQueue: overseerCount,
        pastorQueue: pastorCount,
        todayCompleted: todayCompleted || 0
      };
    } catch (error) {
      console.error('Error in getQueueStats:', error);
      return {
        overseerQueue: 0,
        pastorQueue: 0,
        todayCompleted: 0
      };
    }
  }

  /**
   * Get all pending queue entries for admin review
   * @returns {Promise<Array>} Array of pending queue entries
   */
  static async getPendingQueueEntries() {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting pending entries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPendingQueueEntries:', error);
      return [];
    }
  }

  /**
   * Approve a queue entry
   * @param {number} id - Queue entry ID
   * @param {string} adminNotes - Optional admin notes
   * @returns {Promise<Object>} Updated queue entry
   */
  static async approveQueueEntry(id, adminNotes = '') {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'approved',
          admin_notes: adminNotes,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error approving queue entry:', error);
        throw error;
      }

      // Send approval email notification
      try {
        await EmailNotificationService.sendApprovalEmail(data[0], adminNotes);
        console.log('Approval email sent successfully');
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Don't throw error for email failure - the approval still succeeded
      }

      return data[0];
    } catch (error) {
      console.error('Error in approveQueueEntry:', error);
      throw error;
    }
  }

  /**
   * Decline a queue entry
   * @param {number} id - Queue entry ID
   * @param {string} reason - Reason for declining
   * @returns {Promise<Object>} Updated queue entry
   */
  static async declineQueueEntry(id, reason = '') {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .update({ 
          status: 'declined',
          decline_reason: reason,
          declined_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error declining queue entry:', error);
        throw error;
      }

      // Send decline email notification
      try {
        await EmailNotificationService.sendDeclineEmail(data[0], reason);
        console.log('Decline email sent successfully');
      } catch (emailError) {
        console.error('Failed to send decline email:', emailError);
        // Don't throw error for email failure - the decline still succeeded
      }

      return data[0];
    } catch (error) {
      console.error('Error in declineQueueEntry:', error);
      throw error;
    }
  }

  /**
   * Get queue entry by ID
   * @param {number} id - Queue entry ID
   * @returns {Promise<Object>} Queue entry details
   */
  static async getQueueEntryById(id) {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting queue entry:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getQueueEntryById:', error);
      throw error;
    }
  }

  /**
   * Update queue position using PHP backend
   * @param {number} entryId - Queue entry ID
   * @param {number} newPosition - New position in queue
   * @param {string} queueType - 'overseer' or 'pastor'
   * @returns {Promise<Object>} Update result
   */
  static async updateQueuePosition(entryId, newPosition, queueType) {
    try {
      const response = await fetch('http://localhost:3000/api/position-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: entryId,
          newPosition: newPosition,
          queueType: queueType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Position updated successfully:', result);
        return result;
      } else {
        throw new Error(result.error || 'Position update failed');
      }
    } catch (error) {
      console.error('Error updating position via backend:', error);
      
      // Fallback to direct database update if backend is not available
      console.warn('Falling back to direct database update');
      const { data, error: dbError } = await supabase
        .from('queue_entries')
        .update({ position: newPosition })
        .eq('id', entryId)
        .select();

      if (dbError) {
        throw dbError;
      }

      return {
        success: true,
        message: 'Position updated (fallback mode)',
        emailSent: false
      };
    }
  }

  /**
   * Recalculate all queue positions after removal or status change
   * @param {string} queueType - 'overseer' or 'pastor'
   * @returns {Promise<boolean>} Success status
   */
  static async recalculateQueuePositions(queueType) {
    try {
      // Get all approved entries for this queue type, ordered by created_at
      const { data: entries, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('queue_type', queueType)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting entries for recalculation:', error);
        return false;
      }

      // Update positions
      const updates = entries.map((entry, index) => ({
        id: entry.id,
        position: index + 1
      }));

      if (updates.length > 0) {
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('queue_entries')
            .update({ position: update.position })
            .eq('id', update.id);

          if (updateError) {
            console.error('Error updating position:', updateError);
          }
        }
      }

      console.log(`Recalculated positions for ${entries.length} entries in ${queueType} queue`);
      return true;
    } catch (error) {
      console.error('Error in recalculateQueuePositions:', error);
      return false;
    }
  }

  /**
   * Remove from queue and update positions
   * @param {number} id - Queue entry ID
   * @param {string} queueType - 'overseer' or 'pastor'
   * @returns {Promise<boolean>} Success status
   */
  static async removeFromQueueWithUpdate(id, queueType) {
    try {
      // Remove the entry
      const { error } = await supabase
        .from('queue_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing from queue:', error);
        throw error;
      }

      // Recalculate positions
      await this.recalculateQueuePositions(queueType);

      return true;
    } catch (error) {
      console.error('Error in removeFromQueueWithUpdate:', error);
      return false;
    }
  }
}