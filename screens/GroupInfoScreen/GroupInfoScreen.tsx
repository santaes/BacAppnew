import { SimpleLineIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/core';
import {  Auth, DataStore } from 'aws-amplify';
import React, { useEffect, useState } from 'react'
import { View, Text,StyleSheet, FlatList, Alert, Pressable } from 'react-native'
import UserItem from '../../components/UserItem';
import { useNavigation } from "@react-navigation/core";

import { ChatRoom, ChatRoomUser, User } from '../../src/models';





const GroupInfoScreen = () => {
    const [chatRoom, setChatRoom] = useState<ChatRoom|null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        fetchChatRoom();
        fetchUsers();
      }, []);

      const fetchChatRoom = async () => {
        if(!route.params.id) {
          console.warn("no chatroom id provided");
          return;
        }
        const chatRoom = await DataStore.query(ChatRoom, route.params.id);
          if (!chatRoom ) {
            console.error("can't find a chat room with this id");
  
          } else {
            setChatRoom(chatRoom);
          }
          
        };
        const fetchUsers = async () => {
            const fetchedUsers = (await DataStore.query(ChatRoomUser))
                .filter(chatRoomUser => chatRoomUser.chatroom.id === route.params?.id )
                .map(chatRoomUser => chatRoomUser.user);
      
                setAllUsers(fetchedUsers);
            };

    const confirmDelete = async  (user) => {

        const authData = await Auth.currentAuthenticatedUser();
        if (chatRoom?.Admin?.id !== authData.attributes.sub) {
            Alert.alert("You are not the Admin");
            return;
        }

        
        Alert.alert(
            "Confirm delete",
            `Are you sure you want to delete ${user.name} from the group `,
            [
                {
                    text: "Delete",
                    onPress:() => deleteUser(user),
                    style: 'destructive',
                },
                {
                    text:"Cancel",
                }
            ]
        )
    };

    const deleteUser = async (user) => {
        const chatRoomUsersToDelete = await (await DataStore.query(ChatRoomUser)).filter(cru => cru.chatroom.id === chatRoom.id && cru.user.id === user.id);
        if(chatRoomUsersToDelete.length > 0 ) {
            await DataStore.delete(chatRoomUsersToDelete[0]);
            setAllUsers(allUsers.filter(u => u.id !== user.id))
        }
        
    };
    const confirmDeleteChatRoom = async  (chatRoom) => {

        
        

        
        Alert.alert(
            "Confirm delete",
            `Are you sure you want to delete Chat Room  `,//${chatRoom.name} 
            [
                {
                    text: "Delete",
                    onPress:() => deleteChatRoom(ChatRoom),
                    style: 'destructive',
                },
                {
                    text:"Cancel",
                }
            ]
        )
    };

    const deleteChatRoom = async (chatRoom) => {
        const chatRoomToDelete = await (await DataStore.query(chatRoom));
        if(chatRoomToDelete.length > 0 ) {
            await DataStore.delete(chatRoomToDelete[0]);
            
            return navigation.navigate('HomeScreen');       
        }
        
    };
    
    
    const isGroup = allUsers.length > 2;

    return (
        <View style={styles.root}>
            {/* <Text style={styles.title}>"{chatRoom?.name}"</Text> */}
            <Text style={styles.title}>Participants ({allUsers.length})</Text>
            <FlatList 
            data={allUsers}
            style={{marginLeft:-10}}
            renderItem={({item}) => (
            <UserItem 
                user={item} 
                isAdmin={chatRoom?.Admin?.id === item.id}
                onLongPress={() => confirmDelete(item)}

            />)}
            />
            <Pressable onPress={confirmDeleteChatRoom} >
                <View style={{alignItems:'flex-start',flexDirection:'row',marginHorizontal:5,marginVertical:15}}>
                    <SimpleLineIcons  
                        name="trash" size={24} color="red" />
                        <Text style={{margin:5,}}>{(isGroup ? "Delete Group" : "Delete Chat")}</Text>
                </View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    root:{
        backgroundColor:'#ffffff',
        padding:10,
        flex:1,
    },
    title:{
        fontSize:18,
        fontWeight:'bold',
        paddingVertical:10,
        marginLeft:8,
    },
    users:{
        fontSize:16,
        fontWeight:'bold',
    },

});

export default GroupInfoScreen;
