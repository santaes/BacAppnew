import React, {useEffect, useState, } from "react";
import { View, Image, Text, Pressable,  } from "react-native";
import { Ionicons, MaterialCommunityIcons, } from "@expo/vector-icons";
import { DataStore,Auth } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import moment from "moment";
import { useNavigation } from "@react-navigation/core";





const ChatRoomHeader = ({id, children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>(undefined);
    const navigation = useNavigation();

    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
          .filter(chatRoomUser => chatRoomUser.chatroom.id === id )
          .map(chatRoomUser => chatRoomUser.user);

          setAllUsers(fetchedUsers);

          

     // setUsers(fetchedUsers);

      const authUser = await Auth.currentAuthenticatedUser();

      setUser(fetchedUsers.find(user => user.id !== authUser.attributes.sub) || null);
      };

      const fetchChatRoom = async () => {
 
        DataStore.query(ChatRoom, id ).then(setChatRoom);
      };

     

    

    useEffect(() => {

        if(!id) {
            return;
        }
        
        fetchUsers();
        fetchChatRoom();

    }, []);
    
    

    const getLastOnLineText = () => {
      if (!user?.lastOnlineAt) {
        return null;
      }
      
      //if less then 5 min = online
      const lastOnLineDiffMS = moment().diff(moment(user.lastOnlineAt));
      if (lastOnLineDiffMS < 5 * 60 * 1000) { 
        //less then 5 min
        return "online";
      } else {
        return  ` ${moment(user.lastOnlineAt).fromNow()}`;
      }
    };
    const getUsernames = () => {
      return allUsers.map(user => user.name).join(', ');
    };

    const openInfo = () => {
      navigation.navigate("GroupInfoScreen", {id });
    };

    const isGroup = allUsers.length > 2;



    return (
      <View style={{
        flexDirection:'row',
        justifyContent:'space-between',
        width: '100%',
        padding: 5,
        alignItems:'center',
        right:75,
        flex:1,
        height:50,
        borderBottomWidth:1,
        borderBottomColor:'#c7c7c790',
        
        }}>
        <Image
         source={{uri: chatRoom?.imageUri || user?.imageUri,}}
         style={{width:35, height:35, borderRadius:20,left:65,}}
        />
        <Pressable onPress={openInfo} style={{height:60,alignItems:'center',}}>
          <Text numberOfLines={1}
         style={{
          marginLeft:6,
          fontSize:16,
          fontWeight:'bold',
          bottom:-9,
          width:120,
          height:30,
          left:35,
          
        }}>{chatRoom?.name || user?.name}</Text>
        <Text numberOfLines={1} style={{color:'#00000070',width:140, height:20,fontSize:12,marginLeft:4,bottom:-2,left:43,}}>{isGroup ? getUsernames() : getLastOnLineText()}</Text>
        </Pressable >
           
          <Ionicons name="videocam-outline" size={26} color="black" style={{marginHorizontal:3,padding:3,left:50,}}/>
          <MaterialCommunityIcons name="phone-outline" size={22} color="black"  style={{marginHorizontal:3,padding:3,left:32,}}/>
          <MaterialCommunityIcons name="dots-vertical" size={25} color="black" style={{marginHorizontal:3,padding:3,left:8,}}/>       
      </View>
      
    );
  };

  export default ChatRoomHeader;