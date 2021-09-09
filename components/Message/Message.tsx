import React, {useState, useEffect} from 'react'
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { View, Text } from 'react-native'

import { DataStore } from '@aws-amplify/datastore';
import { User } from '../../src/models';
import { Auth, Storage } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';
import { useWindowDimensions } from 'react-native';
import AudioPlayer from '../AudioPlayer';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { Message as MessageModel } from '../../src/models';
import MessageReply from '../MessageReply';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';









const blue = '#4169E970';
const gray = '#c7c7c790';



const Message = (props) => {
    const {setAsMessageReply, message: propMessage} = props;

    const [message, setMessage] = useState<MessageModel>(propMessage);
    const [repliedTo, setRepliedTo] = useState<MessageModel|undefined>(undefined);
    const [user, setUser] = useState<User|undefined>();
    const [isMe, setIsMe] = useState<boolean|null>(null);
    const [soundURI, setSoundURI] = useState<any>(null);

    const {width} = useWindowDimensions();


    useEffect(() => {
        DataStore.query(User, message.userID).then(setUser);
    }, []);

    useEffect(() => {
        setMessage(propMessage);
    },[propMessage]);

    useEffect(() => {
        if (message?.replyToMessageID) {
            DataStore.query(MessageModel, message.replyToMessageID).then(setRepliedTo);

        }
    },[message])



    useEffect(() => {
        const subscription = DataStore.observe(MessageModel, message.id).subscribe(msg => {
          //console.log(msg.model, msg.opType, msg.element);
          if (msg.model === MessageModel && msg.opType === 'UPDATE') {
            setMessage((message) => ({...message, ...msg.element}));
          }
        });
  
        return () => subscription.unsubscribe();
      },[]);

      useEffect(() => {
        setAsRead();
      },[isMe, message])

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

    const setAsRead = async () => {
        if (isMe === false  && message.status !== "READ") {
           await  DataStore.save(MessageModel.copyOf(message, (updated) => {updated.status = "READ";})); 
        }
    }



    if (!user) {
        return <ActivityIndicator />
    };
    


    return (
        <Pressable
            onLongPress={setAsMessageReply}
            style={[
                styles.container, isMe ? styles.rightContainer : styles.leftContainer,
                {width: soundURI ? '75%' : 'auto'}
            ]}
        >
            {repliedTo && (
                <MessageReply message={repliedTo} />
            )}
            {message.image && (            
                <View style={{marginBottom:message.content ? 10 : 0 }}>  
                        <S3Image 
                            imgKey={message.image}
                            style={{width: '90%', aspectRatio: 3/4 }}
                            resizeMode='contain'   
                        />
                </View>           
            )}
            {soundURI && (<AudioPlayer soundURI={soundURI} />)}
            {!!message.content && <Text style={styles.text}>{message.content}</Text>}
            {isMe && !!message.status && message.status !== "SENT" && <Ionicons 
            name={message.status=== 'DELIVERED' ? "checkmark-sharp" : "checkmark-done-sharp"} 
            size={20} color='#4169E9' 
            style={{marginHorizontal:5,alignSelf:'flex-end',}}/>}
        </Pressable>
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
export default Message;
