import React from 'react'
import {
     View,
     Text,
      StyleSheet,
      TextInput,
      Pressable,
      KeyboardAvoidingView,
      Platform,
      Image 
    } from 'react-native';
import  MessageComponent from '../Message'; 
import { MediaConvertClient, AssociateCertificateCommand } from "@aws-sdk/client-mediaconvert";   
import { SimpleLineIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { useState,useEffect } from 'react';
import { DataStore } from '@aws-amplify/datastore';
import { Message } from '../../src/models';
import { Auth, Storage } from 'aws-amplify';
import { ChatRoom } from '../../src/models';
import EmojiSelector from 'react-native-emoji-selector';
import * as ImagePicker from 'expo-image-picker';
import {Audio, AVPlaybackStatus, } from 'expo-av';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AudioPlayer from '../AudioPlayer';
uuidv4();





    const MessageInput = ({ chatRoom, messageReplyTo, removeMessageReplyTo }) => {
    const [message, setMessage] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [image, setImage] = useState<string|null>(null);
    const [progress, setProgress] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);

    const [soundURI, setSoundURI] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
          if (Platform.OS !== 'web') {
            const libraryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const photoResponse = await ImagePicker.requestCameraPermissionsAsync();
            await Audio.requestPermissionsAsync();


            if (libraryResponse.status !== 'granted' || libraryResponse.status !== 'granted') {
              alert('Sorry, we need camera roll permissions to make this work!');
            }
          }
        })();
      }, []);

    const sendMessage = async () => {
        // send message
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
            replyToMessageID: messageReplyTo?.id,
        })
        );

        updateLastMessage(newMessage);

        resetFields();
    };

    const updateLastMessage = async (newMessage) => {
        DataStore.save(ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
        updatedChatRoom.LastMessage = newMessage; 
        })
        );
    };



    const onPress = () => {
        if (image) {
          sendImage();
        }else if (soundURI) {
          sendAudio();
        
        }else if (message) {
          sendMessage();
        
        }else {
          return; 
             // проверить так ли это!!!
        }
    };
    const resetFields = () => {
      setMessage('');
      setIsEmojiPickerOpen(false);
      setImage(null);
      setProgress(0);
      setSoundURI(null); 
      removeMessageReplyTo();
    };

    // image picker 

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [9, 16],
          quality: 0.8,
          maxWidth:'100%',
          maxHeight:'100%',
          selectionLimit:0,
          mediaType:'mixed',
        });
    
        if (!result.cancelled) {
          setImage(result.uri);
        }
      };

      const takePhoto = async () => {
          const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              aspect:[4, 3],
              
          });
          if (!result.cancelled) {
            setImage(result.uri);
          }
      };
      const progressCallback = (progress) => {
        
        setProgress(progress.loaded/progress.total)
      }

      const sendImage = async () => {
        if(!image) {
          return;
        }
        const blob = await getBlob(image);
        const {key} = await Storage.put(`${uuidv4()}.png`, blob,{
          progressCallback,
        });

        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            image: key,
            userID: user.attributes.sub,
            chatroomID:chatRoom.id,
            replyToMessageID: messageReplyTo?.id,
        }));
        

        updateLastMessage(newMessage);

        resetFields();
      };
      const getBlob = async (uri: string) => {
       
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
      };

      // Audio 

      async function startRecording() {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS:true,

          });

          console.log('Starting recording..');
          const { recording } = await Audio.Recording.createAsync({
            android: {
              extension: ".wav",
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
            },
            ios: {
              extension: ".wav",
              sampleRate: 44100,
              numberOfChannels: 2,
              bitRate: 128000,
              audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
              outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
            },
          });
          setRecording(recording);
          console.log('Recording started');
        } catch (err) {
          console.error('Failed to start recording', err);
        }
      }

    
      async function stopRecording() {
        console.log('Stopping recording..');
        if (!recording) {
          return;
        }

        
        setRecording(null);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS:true,
          

           
        });

        const uri = recording.getURI(); 
        console.log('Recording stopped and stored at', uri);
        if (!uri) {
          return;
        }
        setSoundURI(uri); 
      }




      const sendAudio = async () => {
        if (!soundURI) {
          return;
        }
        const uriParts = soundURI.split(".");
        const extension = uriParts[uriParts.length - 1];
        const blob = await getBlob(soundURI);
        const { key } = await Storage.put(`${uuidv4()}.${extension}`, blob, {
          progressCallback,
        });

        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            audio: key,
            userID: user.attributes.sub,
            chatroomID:chatRoom.id,
            status:"SENT",
            replyToMessageID: messageReplyTo?.id,
        })
        );
        

        updateLastMessage(newMessage);

        resetFields();
      };


    return (
        <KeyboardAvoidingView
         style={[styles.root,{height: isEmojiPickerOpen ? '50%' : 'auto'}]}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
         keyboardVerticalOffset={70}
         >
           {messageReplyTo && (
             <View style={{backgroundColor:'#59595920', borderRadius:20,padding:5, flexDirection:'row',}}>
               <View style={{flex:1}}>
                 <SimpleLineIcons name="action-redo" size={18} color="black"/>
                 <Text>Reply to:</Text>
                 <MessageComponent message={messageReplyTo}  />
               </View>
               <Pressable onPress={() => removeMessageReplyTo(null)}>
               <SimpleLineIcons name="close" size={20} color="black" />
               </Pressable>
             </View>
           )}

             {image && (
                 <View style={styles.sendImageContainer}>
                   <Image source={{uri: image}} style={{width:100, height:100,borderRadius:10,}} />
                   <View style={{flex:1, justifyContent:'flex-start',alignSelf:'flex-end',}}>
                     <View style={{
                     height:5,
                     backgroundColor:'#4169E9',
                     width:`${progress * 100}%`,
                     
                     borderRadius:5,

                      }}/>
                   </View>
                   

        
                   <Pressable onPress={() => setImage(null)}>
                     <SimpleLineIcons name="close" size={24} color="#595959" style={{margin:3,}}/>  
                   </Pressable>
                   
                     
                 </View>
                 
             )}

            {soundURI && <AudioPlayer soundURI={soundURI} />}          

            <View style={styles.row }>
              <View style={styles.inputContainer}>
                <Pressable onPress={() => setIsEmojiPickerOpen((currentValue) => !currentValue)}>
                  <SimpleLineIcons name="emotsmile" size={24} color="#595959" style={styles.icon}/>  
                </Pressable>
              
              <TextInput
                style={styles.input}
                placeholder="Введите сообщение..."
                value={message}
                onChangeText={setMessage}
                multiline               
              />
              <Pressable onPress={takePhoto}>
                <SimpleLineIcons 
                name="camera" 
                size={24} 
                color="#595959" 
                style={styles.icon}/>
              </Pressable>
              
              <Pressable onPress={pickImage}>
                 <SimpleLineIcons 
                 name="picture" 
                 size={24} 
                 color="#595959" 
                 style={styles.icon} /> 
              </Pressable>

              
              </View>
              <Pressable onPress={onPress} style={styles.buttonContainer}>
                {message || image || soundURI ? <Ionicons name="send" size={18} color="white" /> : <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
                <SimpleLineIcons
                 name="microphone" 
                 size={recording ? 40 : 20}
                 color= "white"  
                 style={recording ? {width:60,height:60,backgroundColor:'#4169E9',borderRadius: 30, paddingHorizontal:10,paddingVertical:5,} : styles.icon }/>
              </Pressable>}

              </Pressable>
            </View>

            {isEmojiPickerOpen && <EmojiSelector
             onEmojiSelected={(emoji) => setMessage(currentMessage => currentMessage + emoji )} columns={10}
             showHistory={true}
             
              
            />}

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    sendImageContainer:{
        flexDirection:'row',
        marginVertical:10,
        alignSelf:"stretch",
        justifyContent:'space-between',
        borderWidth:1,
        borderColor:'#00000020',
        borderRadius:10,
    },
    row:{
        flexDirection:'row',
    },
    root:{
        
        padding: 10,
        

    },
    inputContainer:{
        backgroundColor:'#00000015',
        flex: 1,
        marginRight: 10,
        borderRadius:25,
        alignItems:'flex-start',
        borderWidth: 1,
        borderColor:'#00000020',
        flexDirection:'row',
        padding:5,

    },

    buttonContainer:{
        width: 40,  
        height: 40,
        backgroundColor:'#4169E9',
        borderRadius: 25,
        justifyContent:'center',
        alignItems:'center',
    },
    buttonText:{
        color:'white',
        fontSize: 30,
    },
    input:{
        flex: 1,
        marginHorizontal:5,

    },
    icon:{
        marginHorizontal:5,
    },

});


export default MessageInput;