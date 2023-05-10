import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, SafeAreaView, Text } from 'react-native';
import WebviewComponent from './components/WebviewComponent';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  const [visible, setVisible] = useState(true);
  useEffect(()=>{
    if(!visible){
     SplashScreen.hide();
    }
  },[visible])
  return (
    <View style={styles.container}>
        {visible ?
          <View style={styles.splash}>
            <Image source={require('../assets/images/splash.png')} />
          </View>
          :
          <>
          </>}
        <WebviewComponent
          func={{
            setVisible
          }}
        />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  splash: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default App;
