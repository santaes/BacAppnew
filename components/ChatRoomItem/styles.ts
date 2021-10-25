import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    rightContainer:{
      flex: 1,
      justifyContent: 'center',
     
    },
  
    container:{
      flexDirection:'row',
      padding: 16,
      marginBottom:-5,
      marginTop:5
      
      
    },
    row:{
      flexDirection:'row',
      justifyContent:'space-between',
      
    },
    text:{
      
      fontSize:14,
        color:'#565656',
        marginTop: 3,
    },
    image:{
      height:50,
      width:50,
      borderRadius:25,
      marginRight:15,
    },
    name:{
      fontSize:16,
      fontWeight:'bold',
      maxWidth:'60%',
      
  
    },
    time:{
      color:'#565656',
      fontSize: 16,
      padding:3,
      width:120,
      textAlign:'justify',
      
      
      
      
    },
    badgeText:{
      color: 'white',
      fontSize: 12,
  
    },
    badgeContainer:{
      backgroundColor:'#4169E9',
      width:20,
      height:20,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius:10,
      position:'absolute',
      left: 50,
      top: 17,
      borderWidth:1,
      borderColor:'white',
    },
  });
  export default styles;