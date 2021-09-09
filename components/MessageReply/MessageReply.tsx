import React, {useState, useEffect} from 'react'
import { ActivityIndicator,  StyleSheet } from 'react-native'
import { View, Text } from 'react-native'

import { DataStore } from '@aws-amplify/datastore';
import { User } from '../../src/models';
import { Auth, Storage } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';
import AudioPlayer from '../AudioPlayer';
import {  SimpleLineIcons } from '@expo/vector-icons';
import { Message as MessageModel } from '../../src/models';
const blue = '#4169E970';
const gray = '#c7c7c790';



const MessageReply = (props) => {
    const { message: propMessage} = props;

    const [message, setMessage] = useState<MessageModel>(propMessage);
    
    const [user, setUser] = useState<User|undefined>();
    const [isMe, setIsMe] = useState<boolean|null>(null);
    const [soundURI, setSoundURI] = useState<any>(null);


    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser);
    }, []);

    useEffect(() => {
        setMessage(propMessage);
    },[propMessage]);


    useEffect(() => {
        if (message.audio) {
            Storage.get(message.audio).then(setSoundURI);
        }
    }, [message]);

    useEffect(() => {
        const checkIfMe = async () => {
            if (!user) {
                return;
            }
            const authUser = await Auth.currentAuthenticatedUser();
            setIsMe(user.id === authUser.attributes.sub)
        }
        checkIfMe();
    }, [user]);

    if (!user) {
        return <ActivityIndicator />
    }


    return (
        <View           
            style={[
                styles.container, isMe ? styles.rightContainer : styles.leftContainer,
                {width: soundURI ? '75%' : 'auto'}
            ]}
        >
            <View style={{flexDirection:'row',}}>
                <SimpleLineIcons name="action-redo" size={18} color='#00000090' style={{padding:5,transform: [{rotateY: '180deg'}]}} />
                <Text style={{padding:5}}>in reply to:</Text>
            </View>
            
            {message.image && (
                <View style={{marginBottom:message.content ? 10 : 0  }}>
                 <S3Image 
                 imgKey={message.image}
                 style={{width: '90%', aspectRatio: 3/4, }}
                 resizeMode='contain'
                 />
                 </View>
            )}
            {soundURI && (<AudioPlayer soundURI={soundURI} />)}
            {!!message.content && <Text style={styles.text}>{message.content}</Text>}
            
        </View>
    )
};


const styles = StyleSheet.create({
    container:{
        
        padding: 10,
        margin: 5,
        borderRadius: 10,
        maxWidth:'70%',
        


    },
    text:{
        color:'#000000',
        
        
        
       
       

    },
    leftContainer:{
        backgroundColor:'#c7c7c790',
        marginLeft: 10,
        marginRight: 'auto',
        
        
    },
    rightContainer:{
        backgroundColor: '#4169E940',
        marginLeft: 'auto',
        marginRight: 10,
        
    },

});
export default MessageReply;
