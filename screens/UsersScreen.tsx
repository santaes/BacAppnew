import React, {useState, useEffect} from 'react';
import { StyleSheet, View, FlatList, Pressable, Text, SafeAreaView } from 'react-native';
;
import UserItem from '../components/UserItem';


import NewGroupButton from '../components/NewGroupButton';
import { useNavigation } from '@react-navigation/native';
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser } from "../src/models";
import { AntDesign } from '@expo/vector-icons';






export default function UsersScreen() {

  const [users, setUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);


  const navigation = useNavigation();
  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, [])

  useEffect(()=> {
    //query users
    const fetchUsers = async () => {
      const fetchedUsers = await DataStore.query(User);
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, [])

  const addUserToChatRoom = async (user, chatroom) => {
    DataStore.save(
      new ChatRoomUser({
        user,
        chatroom,
      })
      )
  }

  const createChatRoom = async (users) => {

    // TODO if there is already a chat room between these 2 users 
    // then redirect to the existing chat room
    // otherwise, create a new chatroom with these users 
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
    

  // Create a chatroom 
  const newChatRoomData =  {
    newMessages: 0,
    admin : dbUser,


  };
  if (users.length > 1) {
    newChatRoomData.name = 'New Group';
    newChatRoomData.imageUri = 'https://111111abab.s3.eu-central-1.amazonaws.com/group.png';
  }
  const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));

  // connect Auth User
  
  if (dbUser) {
    await addUserToChatRoom(dbUser, newChatRoom);
    
  }

  


    // connect Clicked User
    await Promise.all(
      users.map((user) => addUserToChatRoom(user, newChatRoom))
      );

    navigation.navigate('ChatRoom', { id: newChatRoom.id });
};

const isUserSelected = (user) => {
  return selectedUsers.some((selectedUser) => selectedUser.id === user.id);
};

const onUserPress = async (user) => {
  if (isNewGroup) {
    if (isUserSelected(user)) {
      setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
    
  } else {
    await createChatRoom([user]);
  }
  
};
  const createGroup = async () => {
    await createChatRoom(selectedUsers);
  };

  return (
  <SafeAreaView style={styles.page}> 
    <FlatList 
      data={users}
      renderItem={({item}) => ( <UserItem user={item} onPress={() => onUserPress(item)} isSelected={isNewGroup ? isUserSelected(item) : undefined }/>)}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => <NewGroupButton onPress={() =>setIsNewGroup(!isNewGroup)} /> }
    />
    {isNewGroup && ( <Pressable style={styles.button} onPress={createGroup}>
      <AntDesign name="pluscircleo" size={24} color="black" />
      <Text style={styles.buttonText}>Create Group ({selectedUsers.length})</Text>
    </Pressable>)}
  </SafeAreaView> 
  );
}
const styles = StyleSheet.create({
  page:{
    backgroundColor:'white',
    flex:1,
  },
  button:{
    flexDirection:'row',
    margin:10,
    padding:10,
    alignItems:'center',
    justifyContent:'center',

  },
  buttonText:{
    fontWeight:'bold',
    margin:10,
  },
});

