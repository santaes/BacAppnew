import React, {useState, useEffect} from 'react';
import { Text, StyleSheet, View, Image, FlatList, Pressable  } from 'react-native';
import ChatRoomItem from '../components/ChatRoomItem';
import {Auth, DataStore} from 'aws-amplify';
import { ChatRoom, ChatRoomUser, User } from '../src/models';





export default function HomeScreen() {

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



  return (
  <View style={styles.page}> 
    <FlatList 
      data={chatRooms}
      renderItem={({item}) => <ChatRoomItem chatRoom={item} />}
      showsVerticalScrollIndicator={false}
   />


  </View> 
  );
}
const styles = StyleSheet.create({
  page:{
    backgroundColor:'white',
    flex:1,
  },
});

