import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
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
          <Text style={styles.messageUserName}>{item.userName}</Text>
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
        {/* Header */}
        <LinearGradient
          colors={['#8B1538', '#A61B46', '#C02454']}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{forumName}</Text>
              <Text style={styles.headerSubtitle}>Welcome, {userName}</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <MaterialCommunityIcons name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Messages List */}
        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="forum" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
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

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              <MaterialCommunityIcons 
                name={isLoading ? "loading" : "send"} 
                size={24} 
                color="#fff" 
              />
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
    paddingTop: height * 0.01,
    paddingBottom: height * 0.02,
    paddingHorizontal: width * 0.04,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.1,
  },
  emptyText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    color: '#666',
    marginTop: height * 0.02,
  },
  emptySubtext: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#999',
    marginTop: height * 0.01,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
  },
  messageContainer: {
    marginBottom: height * 0.015,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageUserName: {
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    color: '#8B1538',
    marginBottom: height * 0.005,
    marginLeft: width * 0.03,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 20,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  myMessageBubble: {
    backgroundColor: '#8B1538',
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: Math.min(width * 0.04, 16),
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: Math.min(width * 0.025, 10),
    marginTop: height * 0.005,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
    maxHeight: height * 0.12,
    paddingVertical: height * 0.01,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B1538',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width * 0.02,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});