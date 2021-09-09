import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';


import Amplify,{Auth,Hub,DataStore} from "aws-amplify";
import config from "./src/aws-exports";
import {withAuthenticator} from 'aws-amplify-react-native';
Amplify.configure(config);
import { LogBox } from 'react-native';
import { Message, User } from './src/models';
import moment from 'moment';

LogBox.ignoreLogs(['Setting a timer']);

 function App() {

  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
        // Create listener
    const listener = Hub.listen('datastore', async (hubData) => {
      const  { event, data } = hubData.payload;
      
      if(event === 'outboxMutationProcessed' 
      && data.model === Message 
      && !(["DELIVERED", "READ"].includes(data.element.status ))) {
         
        
           // set the message status to delivered
           DataStore.save(
             Message.copyOf(data.element, (updated) => {
               updated.status = 'DELIVERED';
             })
           );
        }
      });

    // Remove listener
     return () => listener();
  },[]);

  useEffect(() => {
    if (!user) {return}
    const subscription = DataStore.observe(User, user.id).subscribe(msg => {
      //console.log(msg.model, msg.opType, msg.element);
      if (msg.model === User && msg.opType === 'UPDATE') {
        setUser(msg.element);
      }
    });

    return () => subscription.unsubscribe();
  },[user?.id]);

  useEffect(() => {
    fetchUser();
  },[])

  useEffect(() => {
    const interval = setInterval(() => {
      updateLastOnLine();
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  },[user])

  const fetchUser = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    const user = await DataStore.query(User, userData.attributes.sub);
    if (user) {
      setUser(user);
    }
  }

  const updateLastOnLine = async () => {


    if (!user) {
      return;
    }
    
     const response = await DataStore.save(
      User.copyOf(user, (updated) => {
        updated.lastOnlineAt = +new Date();
      })
    );
    setUser(response);
  };

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App);