import { ref, onValue, set, off } from 'firebase/database';
import { database } from './firebase';

// Real-time live status management using Firebase
export class LiveStatusManager {
  constructor(channelId) {
    this.channelId = channelId;
    this.listeners = [];
    this.liveStatusRef = ref(database, `liveStatus/${channelId}`);
  }

  // Set live status (call this when you go live/offline)
  setLiveStatus(isLive, videoId = null) {
    const statusData = {
      isLive,
      videoId,
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString()
    };
    
    return set(this.liveStatusRef, statusData);
  }

  // Listen for real-time live status changes
  onLiveStatusChange(callback) {
    const unsubscribe = onValue(this.liveStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data.isLive, data.videoId, data.timestamp);
      } else {
        callback(false, null, null);
      }
    });

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  // Clean up listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners = [];
  }

  // Manual trigger for going live (for testing/manual control)
  goLive(videoId = null) {
    console.log('🔴 Going live manually');
    return this.setLiveStatus(true, videoId);
  }

  // Manual trigger for going offline
  goOffline() {
    console.log('⚫ Going offline manually');
    return this.setLiveStatus(false, null);
  }
}

// Singleton instance for the main channel
export const mainChannelLiveStatus = new LiveStatusManager('UCueZNkCd2FXGWY7CNrmzT-w');