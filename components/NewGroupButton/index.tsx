import React from 'react';
import { Pressable, Text,View, } from 'react-native';
import { AntDesign } from '@expo/vector-icons';



const NewGroupButton = ({onPress}) => {
    return (
        <Pressable onPress={onPress}>
            <View style={{flexDirection:'row', padding:10, alignItems:'center',marginLeft:6}}>
                <AntDesign name="addusergroup" size={24} color="black" />
                <Text style={{marginLeft:10,fontWeight:'bold',}}>New Group</Text>  
            </View>
            
        </Pressable>
    );
};



export default NewGroupButton;
