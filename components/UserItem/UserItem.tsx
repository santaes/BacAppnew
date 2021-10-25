import React from "react";
import { Text,  View, Image, Pressable  } from 'react-native';
import { useNavigation } from "@react-navigation/core";
import styles from "./styles";
import { Feather, Ionicons } from '@expo/vector-icons';
import moment from "moment";





export default function UserItem({ user, onPress, onLongPress, isSelected, isAdmin = false,  }) {
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
          return  `Last Seen ${moment(user.lastOnlineAt).fromNow()}`;
        }
      };
    
    
                
    return (

        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.container}>
            <Image source={{uri:user.imageUri}} style={styles.image} />

            <View style={styles.rightContainer}>
               
               <View style={styles.row}>
                   
                <Text style={styles.name}>{user.name}</Text>
                {isAdmin && <Text style={{left:11,color:'#56565680'}}>Admin</Text>}
               </View>
               <Text style={{alignItems:'flex-start', color:'#56565670',fontSize:14,bottom:2,}}>{getLastOnLineText()}</Text>
            </View>
            {isSelected !== undefined  &&( <Ionicons name={isSelected ? "checkmark-circle-sharp" : "ellipse-outline"} size={24} color={isSelected ? '#4169E9' : '#56565670' } />)}
        </Pressable>
    );
}
