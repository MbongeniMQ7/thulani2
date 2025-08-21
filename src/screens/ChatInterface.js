import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import chatData from '../data/chatResponses.json';

const { width, height } = Dimensions.get('window');

const ChatInterface = ({ navigation, route }) => {
  const { userEmail, userName, userRole } = route.params;
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Welcome to AFMA Chat, ${userName}! How can we help you today?`,
      isUser: false,
      timestamp: new Date(),
      sender: 'Overseer'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef();

  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check all response categories
    const allResponses = chatData.responses;
    
    for (const [category, responses] of Object.entries(allResponses)) {
      for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          return response;
        }
      }
    }
    
    // Return random default response
    const defaultResponses = chatData.default_responses;
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const getRandomSender = () => {
    const senders = ['Overseer', 'Mfundisi Malinga', 'Pastor'];
    return senders[Math.floor(Math.random() * senders.length)];
  };

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      sender: 'You'
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate response delay
    setTimeout(() => {
      const response = getResponse(inputMessage);
      const sender = getRandomSender();
      const botMessage = {
        id: messages.length + 2,
        text: response,
        timestamp: new Date(),
        isUser: false,
        sender: sender
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds

    setInputMessage('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      <View style={styles.messageHeader}>
        <Text style={styles.senderName}>{item.sender}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : styles.botMessageText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="AFMA Chat" 
          subtitle="Connected • Live conversation"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        
        <View style={styles.chatContainer}>
          <FlatList
            ref={scrollViewRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
          
          <View style={styles.inputContainer}>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={inputMessage.trim() === ''}
              >
                <MaterialCommunityIcons 
                  name="send" 
                  size={24} 
                  color={inputMessage.trim() === '' ? '#999' : '#8B1538'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: height * 0.02,
  },
  messageContainer: {
    marginBottom: height * 0.02,
    maxWidth: width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B1538',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: width * 0.03,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: width * 0.03,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.005,
  },
  senderName: {
    fontSize: width * 0.03,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: width * 0.025,
    opacity: 0.7,
  },
  messageText: {
    fontSize: width * 0.04,
    lineHeight: width * 0.05,
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    paddingVertical: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageInput: {
    flex: 1,
    fontSize: width * 0.04,
    color: '#333',
    maxHeight: height * 0.12,
    paddingVertical: height * 0.01,
  },
  sendButton: {
    marginLeft: width * 0.02,
    padding: width * 0.02,
  },
});

export default ChatInterface;
