import React from "react";
import { Text,  View, Image, Pressable  } from 'react-native';
import { useNavigation } from "@react-navigation/core";
import styles from "./styles";
import { Feather, Ionicons } from '@expo/vector-icons';



export default function UserItem({ user, onPress, isSelected  }) {

    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Image source={{uri:user.imageUri}} style={styles.image} />

            <View style={styles.rightContainer}>
               <View style={styles.row}>
                <Text style={styles.name}>{user.name}</Text>
               </View>
            </View>
            {isSelected !== undefined  &&( <Ionicons name={isSelected ? "checkmark-circle-sharp" : "ellipse-outline"} size={24} color={isSelected ? '#4169E9' : '#56565670' } />)}
        </Pressable>
    );
}
