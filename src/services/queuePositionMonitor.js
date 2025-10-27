import { QueueService, supabase } from './supabaseService';
import { EmailNotificationService } from './emailService';

/**
 * Real-time queue position monitoring service
 * Tracks position changes and sends notifications
 */
export class QueuePositionMonitor {
  static subscriptions = new Map();
  static isMonitoring = false;

  /**
   * Start monitoring queue positions for real-time updates
   * @param {string} queueType - 'overseer' or 'pastor' 
   */
  static startMonitoring(queueType = 'all') {
    if (this.isMonitoring) {
      console.log('Position monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log(`Starting position monitoring for ${queueType} queue(s)`);

    if (queueType === 'all') {
      this.monitorQueue('overseer');
      this.monitorQueue('pastor');
    } else {
      this.monitorQueue(queueType);
    }
  }

  /**
   * Monitor a specific queue type
   * @param {string} queueType - 'overseer' or 'pastor'
   */
  static monitorQueue(queueType) {
    // Store previous positions to detect changes
    const previousPositions = new Map();

    const subscription = QueueService.subscribeToQueueUpdates(queueType, async (payload) => {
      console.log(`Queue update detected for ${queueType}:`, payload);

      try {
        // Get current queue state
        const currentEntries = await QueueService.getQueueEntries(queueType);
        
        // Check for position changes
        await this.checkPositionChanges(currentEntries, previousPositions, queueType);
        
        // Update previous positions
        currentEntries.forEach(entry => {
          previousPositions.set(entry.id, entry.position);
        });

      } catch (error) {
        console.error('Error processing queue update:', error);
      }
    });

    this.subscriptions.set(queueType, subscription);
  }

  /**
   * Check for position changes and send notifications
   * @param {Array} currentEntries - Current queue entries
   * @param {Map} previousPositions - Previous position map
   * @param {string} queueType - Queue type
   */
  static async checkPositionChanges(currentEntries, previousPositions, queueType) {
    for (const entry of currentEntries) {
      const previousPosition = previousPositions.get(entry.id);
      const currentPosition = entry.position;

      // If position changed and we have an email
      if (previousPosition && 
          previousPosition !== currentPosition && 
          entry.email && 
          entry.status === 'approved') {
        
        console.log(`Position change detected for ${entry.first_name} ${entry.last_name}: ${previousPosition} → ${currentPosition}`);
        
        // Send position update notification
        try {
          await EmailNotificationService.sendPositionUpdateEmail(entry, currentPosition);
          console.log(`Position update email sent to ${entry.email}`);
        } catch (emailError) {
          console.error('Failed to send position update email:', emailError);
        }

        // Update position in backend for email tracking
        try {
          await QueueService.updateQueuePosition(entry.id, currentPosition, queueType);
        } catch (updateError) {
          console.error('Failed to update position via backend:', updateError);
        }
      }
    }
  }

  /**
   * Stop monitoring queue positions
   * @param {string} queueType - Optional queue type to stop monitoring
   */
  static stopMonitoring(queueType = 'all') {
    if (queueType === 'all') {
      this.subscriptions.forEach((subscription, type) => {
        subscription.unsubscribe();
        console.log(`Stopped monitoring ${type} queue`);
      });
      this.subscriptions.clear();
      this.isMonitoring = false;
    } else if (this.subscriptions.has(queueType)) {
      this.subscriptions.get(queueType).unsubscribe();
      this.subscriptions.delete(queueType);
      console.log(`Stopped monitoring ${queueType} queue`);
      
      if (this.subscriptions.size === 0) {
        this.isMonitoring = false;
      }
    }
  }

  /**
   * Manually trigger position recalculation and notifications
   * @param {string} queueType - 'overseer' or 'pastor'
   */
  static async triggerPositionUpdate(queueType) {
    try {
      console.log(`Triggering position update for ${queueType} queue`);
      
      if (!queueType) {
        throw new Error('Queue type is required');
      }

      // Get current approved entries
      const { data: entries, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('queue_type', queueType)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!entries || entries.length === 0) {
        console.log(`No approved entries found for ${queueType} queue`);
        return {
          success: true,
          message: `No entries to update in ${queueType} queue`,
          updatedCount: 0
        };
      }

      // Update positions and send notifications
      let updatedCount = 0;
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const newPosition = i + 1;
        
        if (entry.position !== newPosition) {
          // Update position in database
          const { error: updateError } = await supabase
            .from('queue_entries')
            .update({ position: newPosition })
            .eq('id', entry.id);

          if (updateError) {
            console.error('Error updating position:', updateError);
            continue;
          }

          updatedCount++;

          // Send notification if significant position change (top 3 or your turn)
          if (entry.email && (newPosition <= 3 || newPosition === 1)) {
            try {
              await EmailNotificationService.sendPositionUpdateEmail({
                ...entry,
                position: newPosition
              }, newPosition);
              console.log(`Position notification sent to ${entry.first_name} ${entry.last_name} (position ${newPosition})`);
            } catch (emailError) {
              console.error('Failed to send position notification:', emailError);
              // Don't fail the whole operation for email errors
            }
          }
        }
      }

      return {
        success: true,
        message: `Updated positions for ${updatedCount} entries in ${queueType} queue`,
        updatedCount: updatedCount,
        totalEntries: entries.length
      };

    } catch (error) {
      console.error('Error triggering position update:', error);
      return {
        success: false,
        error: error.message,
        updatedCount: 0
      };
    }
  }

  /**
   * Get monitoring status
   * @returns {Object} Monitoring status information
   */
  static getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      activeSubscriptions: Array.from(this.subscriptions.keys()),
      subscriptionCount: this.subscriptions.size
    };
  }
}

// Auto-start monitoring when the service is imported
// Uncomment the line below to enable automatic monitoring
// QueuePositionMonitor.startMonitoring();

export default QueuePositionMonitor;