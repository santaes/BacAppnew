import React, {useState, useEffect} from 'react';
import { View, Text,Pressable,StyleSheet } from 'react-native';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';


const AudioPlayer = ({ soundURI }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [paused, setPause] = useState(true);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);

    useEffect(() => {
        loadSound();
        () => {
            // unload sound
            if (sound) {
               sound.unloadAsync();
            }
        };
    }, [soundURI]);

    const loadSound = async () => {
        if (!soundURI) {
            return;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri:soundURI },
          {},
          onPlaybackStatusUpdate,
          );
          setSound(sound);
    };



    const onPlaybackStatusUpdate = (status: AVPlaybackStatus ) => {
        if(!status.isLoaded) {
          return;
        }
        setAudioProgress(status.positionMillis / (status?.durationMillis || 1));
        setPause(!status.isPlaying);
        setAudioDuration(status.durationMillis || 0);
      };

    const playPauseSound = async () => {
        if (!sound) {
          return;
        }
        if (paused) {  
          await sound.playFromPositionAsync(0);
          
        } else {
          await sound.pauseAsync();
        }
        
      };

    const getDuration = () => {
        const minutes = Math.floor(audioDuration / (60 * 1000));
        const seconds = Math.floor(audioDuration % (60 * 1000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
      };
    return (
        <View style={styles.sendAudioContainer}>
       
        <Pressable onPress={playPauseSound}>
          <Ionicons name={paused? "play" : "pause"} size={24} color="#4169E9" />
        </Pressable>
        <View style={styles.audioProgressBG}>
          <View style={[styles.audioProgressFG,{left:`${audioProgress * 100 }%`}]}/>
        </View>
        <Text>{getDuration()}</Text>
        
        
      </View>
      
      
    );
};

const styles = StyleSheet.create({
    sendAudioContainer:{
      marginVertical: 10,
      padding:10,
      borderWidth: 1,
      borderRadius:10,
      borderColor:'#00000020',
      alignSelf:"stretch",
      justifyContent:'space-between',
      flexDirection:'row',
      alignItems:'center',
      width:'90%',
      
      

    },
    audioProgressBG:{
      height:3,
      flex:1,
      backgroundColor:'#00000015',
      borderRadius:10,
      margin:10,
    },
    audioProgressFG:{
      width:8,
      height:8,
      borderRadius:4,
      backgroundColor:'#4169E990',
      position:'absolute',
      top:-2.5,


    },
});


export default AudioPlayer;
