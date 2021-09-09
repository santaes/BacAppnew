import { Auth } from 'aws-amplify';

import * as React from 'react';

import {  Image, Pressable, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { Ionicons, } from '@expo/vector-icons';




export default function ModalScreen() {

  return (

    
    <View style={styles.container}>
      <View style={styles.userContainer}>
          <Image source={{uri: 'https://i.ytimg.com/vi/xV2RLjQIOvU/hqdefault.jpg'}} style={styles.image} />
          <View style={{flexDirection:'column',bottom:10}}>
            <Text style={styles.name}>Name Surname</Text>
            <Text style={styles.email}>BacApp@gmail.com</Text>
          </View>    
      </View>
      <View style={styles.icon}>
        <Ionicons name="person-outline" size={24} color="black" />
        <Text style={styles.text}>Account</Text>
      </View>
      <View style={styles.icon}>
        <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
        <Text style={styles.text}>Chats</Text>
      </View>
      <View style={styles.icon}>
        <Ionicons name="notifications-outline" size={24} color="black" />
        <Text style={styles.text}>Notifications</Text>
      </View>
      <View style={styles.icon}>
        <Ionicons name="md-lock-closed-outline" size={24} color="black" />
        <Text style={styles.text}>Privacy</Text>
      </View>
      <View style={styles.icon}>
        <Ionicons name="md-sync-sharp" size={24} color="black" />
        <Text style={styles.text}>Data usage</Text>
      </View>
      <View style={styles.icon}>
        <Ionicons name="ios-help-circle-outline" size={24} color="black" />
        <Text style={styles.text}>Help</Text>
      </View>
      <Pressable onPress={logOut} style={styles.icon} >
       <Ionicons name="log-out-outline" size={24} color="black" /> 
       <Text style={styles.text}>Log out</Text>
      </Pressable>

      
      
      
    </View>
  );
}


const logOut = () => {
  Auth.signOut();
}

const styles = StyleSheet.create({
  text:{
    marginHorizontal:10,
    fontSize:16,
    left: 4,
    top:2,
  },
  icon:{
    marginLeft:16,
    flexDirection:'row',
    marginTop:16,
    
    
  },
  email:{
    fontSize: 14,
    marginLeft:16,
    marginTop:8,
    color:'#565656',
    

  },
  name:{
    fontSize:18,
    fontWeight:'bold',
    marginLeft:16,
    marginTop:12,

  },
  userContainer:{
   flexDirection:'row',
   width:'100%',
   marginTop:16,
   

   
   
  },
  container: {
    flex: 1,
    width:'100%',
    
  },
  
  image:{
    height:60,
    width:60,
    borderRadius:30,
    marginLeft:16,
    
    
  },
});
