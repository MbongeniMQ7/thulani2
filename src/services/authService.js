import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

class AuthService {
  // Check if user is authenticated
  static isAuthenticated() {
    return !!auth.currentUser;
  }

  // Get current user email
  static getUserEmail() {
    return auth.currentUser?.email || '';
  }

  // Get current user name
  static getUserName() {
    return auth.currentUser?.displayName || 
           auth.currentUser?.email?.split('@')[0] || 
           'User';
  }

  // Get current user ID
  static getUserId() {
    return auth.currentUser?.uid || '';
  }

  // Navigate to admin interface if authenticated
  static navigateToAdminIfAuthenticated(navigation, selectedRole, adminCode, currentAdminCodes) {
    if (!this.isAuthenticated()) {
      return { success: false, message: 'User not authenticated' };
    }

    if (!selectedRole || !adminCode.trim()) {
      return { success: false, message: 'Please select your role and enter the admin code' };
    }

    // Verify admin code
    if (adminCode !== currentAdminCodes[selectedRole]) {
      return { success: false, message: 'The admin code you entered is incorrect.' };
    }

    // Navigate to admin chat interface
    navigation.navigate('AdminChatInterface', {
      userEmail: this.getUserEmail(),
      userName: this.getUserName(),
      userId: this.getUserId(),
      role: selectedRole,
      isAdmin: true
    });

    return { success: true };
  }

  // Navigate to forum if authenticated
  static navigateToForumIfAuthenticated(navigation, selectedForum, forums) {
    if (!this.isAuthenticated()) {
      return { success: false, message: 'User not authenticated' };
    }

    if (!selectedForum) {
      return { success: false, message: 'Please select a forum to continue' };
    }

    const selectedForumData = forums.find(f => f.id === selectedForum);
    
    // Navigate to forum chat
    navigation.navigate('ForumChat', {
      userEmail: this.getUserEmail(),
      userName: this.getUserName(),
      userId: this.getUserId(),
      forum: selectedForum,
      forumName: selectedForumData.name
    });

    return { success: true };
  }
}

export default AuthService;