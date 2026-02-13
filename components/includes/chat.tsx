import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// Adjust path as needed based on your folder structure
import chatServices from '@/services/api/methods/chatServices';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Types ---
interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  rawDate: number;
  isPending?: boolean;
}

// --- Constants & Theme ---
const COLORS = {
  primary: '#2A2A2A',
  accent: '#007AFF',
  headerAvatarBg: '#0D8ABC',
  background: '#F5F5F7',
  white: '#FFFFFF',
  grayLight: '#E5E5EA',
  textDark: '#000000',
  textLight: '#8E8E93',
  greenOnline: '#34C759',
  error: '#FF3B30',
};

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const flatListRef = useRef<FlatList>(null);
  
  // FIX: Use 'number' for React Native intervals
  const intervalRef = useRef<number | null>(null);

  // --- 1. Lifecycle: Load & Poll ---
  useEffect(() => {
    fetchInitialData();

    // Poll every 3 seconds
    // We cast the setInterval return to 'unknown' then 'number' to satisfy TS in all envs
    intervalRef.current = setInterval(() => {
      fetchLatestMessagesSilently();
    }, 3000) as unknown as number;

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  // --- 2. Data Fetching ---
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        getAndMergeMessages(),
        chatServices.markAllNotificationsRead().catch(() => {}),
      ]);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestMessagesSilently = async () => {
    await getAndMergeMessages();
  };

  const getAndMergeMessages = async () => {
    try {
      const historyData = await chatServices.getChatHistory();
      
      // Debug Log: Check your terminal to see if data arrives
      // console.log("Fetched History Data:", historyData);

      if (!Array.isArray(historyData)) {
        console.warn("Expected array for chat history but got:", typeof historyData);
        return;
      }

      // Convert Server Data to UI Data
      const serverMessages = historyData.map(mapToUIMessage);

      setMessages((currentMessages) => {
        // 1. Preserve pending messages
        const pendingMessages = currentMessages.filter((m) => m.isPending);

        // 2. Merge Server Messages with Pending Messages
        const merged = [...serverMessages, ...pendingMessages];

        // 3. Remove duplicates by ID
        const uniqueMap = new Map();
        merged.forEach(item => uniqueMap.set(item.id, item));
        const uniqueMessages = Array.from(uniqueMap.values());

        // 4. Sort by Date
        uniqueMessages.sort((a, b) => a.rawDate - b.rawDate);

        return uniqueMessages;
      });
    } catch (error) {
      console.log('Polling error:', error);
    }
  };

  // --- 3. Mapper Logic ---
  const mapToUIMessage = (item: any): Message => {
    // Determine Sender based on 'from_role' ('user' or 'admin')
    const isMe = item.from_role === 'user';

    // Safe Date Parsing
    let dateObj = new Date();
    if (item.created_at) {
        const parsed = new Date(item.created_at);
        if (!isNaN(parsed.getTime())) {
            dateObj = parsed;
        }
    }

    return {
      id: item.id ? item.id.toString() : `server-${Math.random()}`,
      text: item.message || '', 
      sender: isMe ? 'me' : 'other',
      timestamp: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: dateObj.getTime(),
      isPending: false,
    };
  };

  // --- 4. Auto Scroll ---
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages.length]);

  // --- 5. Send Message ---
  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (textToSend.length === 0 || sending) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const now = new Date();
    const optimisticMessage: Message = {
      id: tempId,
      text: textToSend,
      sender: 'me',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawDate: now.getTime(),
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');
    setSending(true);

    try {
      const response = await chatServices.sendMessage({ message: textToSend });
      
      if (response) {
        const realMessage = mapToUIMessage(response);
        setMessages((prev) => 
          prev.map((msg) => (msg.id === tempId ? realMessage : msg))
        );
      } else {
        // Fallback: just remove pending flag
        setMessages((prev) => 
            prev.map((msg) => (msg.id === tempId ? { ...msg, isPending: false } : msg))
        );
      }
      
      // Immediate refresh
      fetchLatestMessagesSilently();

    } catch (error) {
      console.error('Send failed:', error);
      Alert.alert('Failed', 'Message could not be sent.');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  // --- Renderers ---
  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender === 'me';
    const isNextSame = messages[index + 1]?.sender === item.sender;

    return (
      <View style={[
        styles.messageRow,
        isMe ? styles.rowEnd : styles.rowStart,
        { marginBottom: isNextSame ? 4 : 16 }
      ]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            {!isNextSame ? (
                <View style={[styles.avatarCircle, { backgroundColor: COLORS.headerAvatarBg }]}>
                    <MaterialIcons name="support-agent" size={16} color="#fff" />
                </View>
            ) : (
                <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
          isMe && !isNextSame ? { borderBottomRightRadius: 4 } : {},
          !isMe && !isNextSame ? { borderBottomLeftRadius: 4 } : {},
          item.isPending && { opacity: 0.6 }
        ]}>
          <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
            {item.text}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={[styles.timestamp, isMe ? styles.timeMe : styles.timeOther]}>
              {item.timestamp}
            </Text>
            {item.isPending && (
               <Ionicons name="time-outline" size={10} color={COLORS.white} style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
               <MaterialIcons name="support-agent" size={24} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
               <Text style={styles.headerTitle}>Support</Text>
               <View style={{flexDirection:'row', alignItems:'center'}}>
                 <View style={{width:8, height:8, borderRadius:4, backgroundColor: COLORS.greenOnline, marginRight: 5}} />
                 <Text style={styles.headerSubtitle}>Live</Text>
               </View>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={fetchInitialData}>
             <Ionicons name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && messages.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="interactive"
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Start a conversation...</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
      >
        <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add" size={28} color={COLORS.accent} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                />
            </View>

            <TouchableOpacity 
                style={[
                    styles.sendButton, 
                    { backgroundColor: inputText.trim() ? COLORS.accent : COLORS.grayLight }
                ]} 
                onPress={handleSendMessage}
                disabled={!inputText.trim() || sending}
            >
                {sending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons 
                    name="arrow-up" 
                    size={20} 
                    color={inputText.trim() ? COLORS.white : '#A0A0A0'} 
                  />
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.textLight, fontSize: 16 },
  
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.headerAvatarBg,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  headerTextContainer: { justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  headerSubtitle: { fontSize: 13, color: COLORS.greenOnline, fontWeight: '600' },
  iconButton: { padding: 8 },

  listContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 20, flexGrow: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', width: '100%' },
  rowStart: { justifyContent: 'flex-start' },
  rowEnd: { justifyContent: 'flex-end' },
  
  avatarContainer: { marginRight: 8, width: 28 },
  avatarCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarSpacer: { width: 28, height: 28 },

  bubble: {
    maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 4, 
  },
  bubbleMe: {
    backgroundColor: COLORS.accent,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 4,
  },
  
  messageText: { fontSize: 16, lineHeight: 22 },
  textOther: { color: COLORS.textDark },
  textMe: { color: COLORS.white },
  metaContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  timestamp: { fontSize: 10 },
  timeOther: { color: '#8E8E93' },
  timeMe: { color: 'rgba(255,255,255,0.7)' },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 10,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  attachButton: { padding: 10, marginBottom: 4 },
  inputContainer: {
    flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20, paddingHorizontal: 12, marginRight: 8, minHeight: 40, justifyContent: 'center', marginBottom: 4, 
  },
  input: { fontSize: 16, color: COLORS.textDark, paddingTop: 8, paddingBottom: 8, maxHeight: 100 },
  sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
});