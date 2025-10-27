import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { database, auth } from '../config/firebase';
import { ref, push, onValue, off, orderByChild, query } from 'firebase/database';

const { width, height } = Dimensions.get('window');

const ChatInterface = ({ navigation, route }) => {
  const { userEmail, userName, userId, isAdmin } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    // Listen for messages from admin chat
    const messagesRef = ref(database, 'adminChat');
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    try {
      const messagesRef = ref(database, 'adminChat');
      await push(messagesRef, {
        text: inputMessage.trim(),
        userId: userId,
        userName: userName,
        userRole: 'member',
        isAdmin: false,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      });
      
      setInputMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.navigate('ChatScreenNew');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.userId === userId;
    const messageTime = new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && (
            <View style={styles.senderInfo}>
              <MaterialCommunityIcons 
                name={item.isAdmin ? (item.userRole === 'overseer' ? 'account-star' : 'account-tie') : 'account'} 
                size={16} 
                color={item.isAdmin ? '#8B1538' : '#666'} 
              />
              <Text style={styles.senderName}>
                {item.userName} {item.isAdmin && `(${item.userRole})`}
              </Text>
            </View>
          )}
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
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B1538', '#A61B46']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>AFMA Chat</Text>
          <Text style={styles.headerSubtitle}>
            Welcome {userName}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message to church leadership..."
            placeholderTextColor="#999"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <MaterialCommunityIcons
              name={isLoading ? "loading" : "send"}
              size={24}
              color={(!inputMessage.trim() || isLoading) ? "#ccc" : "#8B1538"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    paddingTop: height * 0.05,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255,255,255,0.9)',
  },
  signOutButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    padding: width * 0.04,
    paddingBottom: height * 0.02,
  },
  messageContainer: {
    marginBottom: height * 0.015,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: width * 0.03,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#8B1538',
  },
  otherMessageBubble: {
    backgroundColor: '#f0f0f0',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
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
    fontSize: Math.min(width * 0.028, 11),
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    maxHeight: height * 0.15,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
    paddingVertical: height * 0.01,
    maxHeight: height * 0.12,
  },
  sendButton: {
    marginLeft: width * 0.02,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatInterface;
