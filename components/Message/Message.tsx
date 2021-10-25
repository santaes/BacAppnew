import React, {useState, useEffect} from 'react'
import { ActivityIndicator, Pressable, StyleSheet,  Alert, ScrollView, Dimensions,Animated} from 'react-native'
import { View, Text } from 'react-native'

import { DataStore } from '@aws-amplify/datastore';
import { User } from '../../src/models';
import { Auth, Storage } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';

import AudioPlayer from '../AudioPlayer';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { Message as MessageModel } from '../../src/models';
import MessageReply from '../MessageReply';
import { useActionSheet } from '@expo/react-native-action-sheet';

import Lightbox from 'react-native-lightbox-zoom';









const blue = '#4169E970';
const gray = '#c7c7c790';



const Message = (props) => {
    const {setAsMessageReply, message: propMessage} = props;

    const [message, setMessage] = useState<MessageModel>(propMessage);
    const [repliedTo, setRepliedTo] = useState<MessageModel|undefined>(undefined);
    const [user, setUser] = useState<User|undefined>();
    const [isMe, setIsMe] = useState<boolean|null>(null);
    const [soundURI, setSoundURI] = useState<any>(null);
    const [isDeleted, setIsDeleted] = useState(false);
    

    
    const { showActionSheetWithOptions } = useActionSheet();



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
          
          if (msg.model === MessageModel  ) {
            if (msg.opType === 'UPDATE')  {
                setMessage((message) => ({...message, ...msg.element}));
            } else if (msg.opType === 'DELETE') {
                setIsDeleted(true);
            }
            
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
    };

    const deleteMessage = async () => {
       await DataStore.delete(message);
        
    }

    const confirmDelete =  () => {
        Alert.alert("Confirm delete", "Are you sure you want do delete the message?",[
            {
                text:"Delete",
                onPress: deleteMessage,
                style:"destructive",
            },
            {
                text:"Cancel",


            },
        ]
        );
      
    };


    const onActionPress = (index) => {

        if(index === 0) {
            setAsMessageReply();
        } else if(index === 1) {
            if (isMe) {
             confirmDelete();
            } else {
                Alert.alert("Warning", "This is not your message");
            }   
        }
    };

    const openActionMenu = () => {
        const options = ["Reply", "Delete", "Cancel"];
        const destructiveButtonIndex = 1;
        const cancelButtonIndex = 2;
        showActionSheetWithOptions(
         {
            options, 
            destructiveButtonIndex, 
            cancelButtonIndex,
         },
         onActionPress
        );
    };



    if (!user) {
        return <ActivityIndicator />
    };
    
    
    

    return (
        <Pressable
            onLongPress={openActionMenu}
            style={[
                styles.container, isMe ? styles.rightContainer : styles.leftContainer,
                {width: soundURI ? '75%' : 'auto'}
            ]}
        >
            {repliedTo && (
                <MessageReply message={repliedTo} />
            )}
            {message.image && (  
                
                    <View style={{marginBottom:message.content ? 10 : 0 , }}>  
                       <Lightbox >
                            <S3Image 
                            imgKey={message.image}
                            style={{ aspectRatio: 9/13.5, }}
                            resizeMode='contain'
                            /> 
                        </Lightbox>
                    </View>
            )}
            {soundURI && (<AudioPlayer soundURI={soundURI} />)}
            {!!message.content && <Text style={styles.text}>{isDeleted ? "message deleted" : message.content}</Text>}
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
