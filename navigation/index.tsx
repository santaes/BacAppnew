
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation, } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName,Image,Text, View, Pressable, } from 'react-native';
import { SimpleLineIcons, } from '@expo/vector-icons';



import NotFoundScreen from '../screens/NotFoundScreen';
import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import ModalScreen from '../screens/ModalScreen';

import { RootStackParamList,  } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ChatRoomHeader from './ChatRoomHeader';
import GroupInfoScreen from '../screens/GroupInfoScreen';



export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}


const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
       name="HomeScreen"
       component={HomeScreen}
       options={{
          headerTitle: HomeHeader ,
          headerShadowVisible:true,
          
        }}
        
       />
       <Stack.Screen
       name="ModalScreen"
       component={ModalScreen}
       options={{
          headerTitle: ModalScreenHeader ,
          headerShadowVisible:true, 
        }}
       />
      <Stack.Screen
       name="ChatRoom"
       component={ChatRoomScreen}
       options={({ route }) => ({
          headerTitle: () =>  <ChatRoomHeader id={route.params?.id}  />,
          headerShadowVisible:true,
        })} 
      /> 
      <Stack.Screen
        name="GroupInfoScreen"
        component={GroupInfoScreen}
        options={{
          headerTitle: "New Group",
          headerShadowVisible:true,
        }}
      />
      <Stack.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{
         title: "Users",
         headerShadowVisible:true,
         
       }}
      /> 
   <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
  const HomeHeader = (props) => {
    

    
  const navigation = useNavigation();

  return (
    <View style={{
      flexDirection:'row',
      justifyContent:'space-between',
      width: '100%',
      padding: 10,
      borderBottomWidth:1,
      borderBottomColor:'#c7c7c790',
      right:15,
      height:60,
      

    }}>
      <Pressable onPress={() => navigation.navigate('ModalScreen')} style={{width:40,height:40}}>
        <Image
          source={{uri:'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/elon.png'}}
          style={{width:35, height:35, borderRadius:20,left:15,bottom:5}}
        />
      </Pressable>
      
      <Text style={{
        flex: 1,
        marginLeft:16,
        fontSize:20,
        fontWeight:'bold',
        left: 12,
      }}>БацApp</Text>
      <SimpleLineIcons name="camera" size={24} color="black" style={{marginHorizontal:22, left:15,}}/>
        <Pressable onPress={() => navigation.navigate('UsersScreen')}>
          <SimpleLineIcons name="pencil" size={20} color="black" style={{marginRight:21,left:15,}}/>
        </Pressable>
    </View>
    
  )
}
   

const ModalScreenHeader = (props) => {

  

  return (
    <View style={{
      flexDirection:'row',
      justifyContent:'space-between',
      width: '100%',
      padding: 10,
      alignItems:'center',
      
      }}>
      
      <Text style={{
        marginLeft:16,
        fontSize:20,
        fontWeight:'bold',
        right:10,
      }}>Settings</Text>
      <SimpleLineIcons name="pencil" size={20} color="black" style={{right:80}}/>
           
    </View>
    
  )
}



