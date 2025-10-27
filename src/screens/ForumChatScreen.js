import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { auth } from '../config/firebase';

// Import Firebase Realtime Database
import { getDatabase, ref, push, onValue, off, serverTimestamp } from 'firebase/database';

const { width, height } = Dimensions.get('window');

export default function ForumChatScreen({ route, navigation }) {
  const { userEmail, userName, userId, forum, forumName } = route.params;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const flatListRef = useRef(null);
  const database = getDatabase();

  useEffect(() => {
    // Set up real-time listener for messages
    const messagesRef = ref(database, `forums/${forum}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
        
        // Auto scroll to bottom when new messages arrive
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
      setInitialLoading(false);
    });

    // Cleanup listener on unmount
    return () => off(messagesRef, 'value', unsubscribe);
  }, [forum]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const messagesRef = ref(database, `forums/${forum}/messages`);
      await push(messagesRef, {
        text: message.trim(),
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'ChoirScreen' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.userId === userId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <View style={styles.otherMessageHeader}>
            <View style={styles.userAvatar}>
              <MaterialCommunityIcons name="account" size={16} color="#8B1538" />
            </View>
            <Text style={styles.messageUserName}>{item.userName}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Enhanced Header */}
        <LinearGradient
          colors={['#8B1538', '#A61B46', '#C02454']}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <View style={styles.forumIconContainer}>
                <MaterialCommunityIcons name="forum" size={20} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{forumName}</Text>
                <View style={styles.userBadgeContainer}>
                  <MaterialCommunityIcons name="account-circle" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.headerSubtitle}>{userName}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <MaterialCommunityIcons name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages List */}
        <View style={styles.messagesContainer}>
          {initialLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <LinearGradient
                  colors={['#8B1538', '#A61B46']}
                  style={styles.loadingIconGradient}
                >
                  <MaterialCommunityIcons name="forum" size={36} color="#fff" />
                </LinearGradient>
                <Text style={styles.loadingTitle}>Loading Messages</Text>
                <Text style={styles.loadingSubtitle}>Connecting to {forumName}...</Text>
                <ActivityIndicator size="large" color="#8B1538" style={styles.loadingSpinner} />
              </View>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={['#8B1538', '#A61B46']}
                  style={styles.emptyIconGradient}
                >
                  <MaterialCommunityIcons name="forum" size={48} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.emptyText}>Welcome to {forumName}</Text>
              <Text style={styles.emptySubtext}>Be the first to share your thoughts and start meaningful conversations with fellow members.</Text>
              <View style={styles.emptyFeatures}>
                <View style={styles.emptyFeatureItem}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#8B1538" />
                  <Text style={styles.emptyFeatureText}>Respectful Discussion</Text>
                </View>
                <View style={styles.emptyFeatureItem}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#8B1538" />
                  <Text style={styles.emptyFeatureText}>Community Driven</Text>
                </View>
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Enhanced Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputMessageContainer}>
              <MaterialCommunityIcons name="message-outline" size={20} color="#8B1538" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Share your thoughts..."
                placeholderTextColor="#94a3b8"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              <Text style={styles.characterCount}>{message.length}/500</Text>
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <MaterialCommunityIcons name="loading" size={22} color="#fff" />
              ) : (
                <LinearGradient
                  colors={message.trim() ? ['#8B1538', '#A61B46'] : ['#94a3b8', '#64748b']}
                  style={styles.sendButtonGradient}
                >
                  <MaterialCommunityIcons name="send" size={22} color="#fff" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: height * 0.015,
    paddingBottom: height * 0.025,
    paddingHorizontal: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.04,
  },
  forumIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: width * 0.025,
    borderRadius: 12,
    marginRight: width * 0.03,
  },
  headerText: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Math.min(width * 0.052, 21),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  userBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.005,
    borderRadius: 12,
    marginTop: height * 0.005,
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.032, 13),
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    marginLeft: 4,
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.08,
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginVertical: height * 0.02,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIconContainer: {
    marginBottom: height * 0.025,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyText: {
    fontSize: Math.min(width * 0.052, 21),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.015,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: Math.min(width * 0.038, 15),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
    marginBottom: height * 0.03,
    fontWeight: '500',
  },
  emptyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 280,
  },
  emptyFeatureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.05)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.1)',
    flex: 0.45,
  },
  emptyFeatureText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#8B1538',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
  },
  messageContainer: {
    marginBottom: height * 0.02,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  otherMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.008,
    marginLeft: width * 0.02,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.02,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.2)',
  },
  messageUserName: {
    fontSize: Math.min(width * 0.032, 13),
    fontWeight: '700',
    color: '#8B1538',
  },
  messageBubble: {
    maxWidth: width * 0.78,
    borderRadius: 22,
    paddingHorizontal: width * 0.045,
    paddingVertical: height * 0.018,
  },
  myMessageBubble: {
    backgroundColor: '#8B1538',
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  messageText: {
    fontSize: Math.min(width * 0.042, 17),
    lineHeight: Math.min(width * 0.055, 22),
    fontWeight: '500',
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: Math.min(width * 0.028, 11),
    marginTop: height * 0.008,
    fontWeight: '600',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#64748b',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: width * 0.03,
  },
  inputMessageContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputIcon: {
    marginRight: width * 0.025,
    marginBottom: height * 0.008,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.042, 17),
    color: '#1e293b',
    maxHeight: height * 0.12,
    paddingVertical: height * 0.008,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: Math.min(width * 0.025, 10),
    color: '#94a3b8',
    marginLeft: width * 0.02,
    marginBottom: height * 0.008,
    fontWeight: '600',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
    shadowOpacity: 0.1,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.08,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.08,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 280,
  },
  loadingIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.008,
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#64748b',
    textAlign: 'center',
    marginBottom: height * 0.025,
    fontWeight: '500',
  },
  loadingSpinner: {
    marginTop: height * 0.01,
  },
});