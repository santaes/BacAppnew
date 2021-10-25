import React, {useState, useEffect, useCallback,} from 'react';
import { Text, StyleSheet, View, Image, FlatList, Pressable,RefreshControl  } from 'react-native';
import ChatRoomItem from '../components/ChatRoomItem';
import {Auth, DataStore} from 'aws-amplify';
import { ChatRoom, ChatRoomUser, User } from '../src/models';





export default function HomeScreen() {
    const fetchChatRooms = async () => {
    const userData = await Auth.currentAuthenticatedUser();

    const chatRooms = (await DataStore.query(ChatRoomUser))
    .filter(chatRoomUser => chatRoomUser.user.id === userData.attributes.sub)
    .map(chatRoomUser => chatRoomUser.chatroom);
    
    setChatRooms(chatRooms);
  };
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
      const fetchChatRooms = async () => {
      const userData = await Auth.currentAuthenticatedUser();

      const chatRooms = (await DataStore.query(ChatRoomUser))
      .filter(chatRoomUser => chatRoomUser.user.id === userData.attributes.sub)
      .map(chatRoomUser => chatRoomUser.chatroom);
      
      setChatRooms(chatRooms);
    };
    fetchChatRooms();
  }, []);

  const wait = (timeout: number) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    
    setChatRooms(chatRooms);
    fetchChatRooms();
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, []);

  return (
  <View style={styles.page}> 
    <FlatList 
      data={chatRooms}
      renderItem={({item}) => <ChatRoomItem chatRoom={item} />}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      
   />
  </View> 
  );
}
const styles = StyleSheet.create({
  page:{
    backgroundColor:'#ffffff',
    flex:1,
    
    
    
    
  },
});

