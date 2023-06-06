import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import WebviewComponent from './components/WebviewComponent';
import SplashScreen from 'react-native-splash-screen';
import { BackHandler, Platform, StatusBar } from 'react-native';
import { getStatusBarHeight } from "react-native-status-bar-height";
import { isIphoneX, getBottomSpace } from "react-native-iphone-x-helper";

import { SafeAreaView } from 'react-native-safe-area-context';

const StatusBarHeight =
  Platform.OS === 'ios' ? (getStatusBarHeight(true)+10) : 0;

  console.log(StatusBarHeight)
const App = () => {
  const [visible, setVisible] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('');
  const [statusBarStyle, setStatusBarStyle] = useState('dark-content')
  useEffect(() => {
    if (!visible) {
      SplashScreen.hide();
    }
  }, [visible])
  useEffect(() => {
    setStatusBarStyle(isDark(backgroundColor) ? 'light-content' : 'dark-content')
  }, [backgroundColor])

  const isDark = (color) => {
    if (!color) {
      return false;
    }
    let c = color.charAt(0) === '#' ? color.substring(1) : color;
    let hex = c.length === 3 ? `${c.charAt(0)}${c.charAt(0)}${c.charAt(1)}${c.charAt(1)}${c.charAt(2)}${c.charAt(2)}` : c;
    let rgb = parseInt(hex, 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;
    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma < 40;
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor ?? "#fff" }}>
        {Platform.OS === 'ios' ?
          <>
            <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor ?? "#fff"} />
          </>
          :
          <>
          </>}
        <View style={{ ...styles.container, paddingTop: StatusBarHeight, backgroundColor: backgroundColor ?? "#fff" }}>
          <WebviewComponent
            func={{
              setVisible,
              setBackgroundColor
            }}
          />
        </View>
      </SafeAreaView>
    </>
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
