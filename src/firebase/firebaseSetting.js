import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// 플랫폼별 설정
const channelConfig = Platform.select({
    android: {
        channelId: 'YOUR_ANDROID_CHANNEL_ID',
        channelName: 'YOUR_ANDROID_CHANNEL_NAME',
    },
    ios: {
        sound: true,
    },
});
const firebaseSetting = () => {

    // Firebase Messaging 객체를 생성합니다.
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
    });
    messaging().getToken().then(token => {
        console.log('FCM Token:', token);
    });

    // Foreground 상태에서 수신한 메시지 처리
    messaging().onMessage(remoteMessage => {
        console.log('Message received in foreground:', remoteMessage);
    });

    // 앱이 Background에서 실행 중일 때 수신한 메시지 처리
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage);
    });

    // 앱이 종료된 상태에서 수신한 메시지 처리
    messaging().getInitialNotification().then(remoteMessage => {
        console.log('Notification caused app to open from quit state:', remoteMessage);
    });

    // 디바이스 등록
    messaging()
        .registerDeviceForRemoteMessages()
        .then(() => console.log('기기 등록 성공!'))
        .catch((err) => console.error('기기 등록 실패:', err));

    // 푸시 알림 채널 생성
    if (Platform.OS === 'android') {
        messaging().createNotificationChannel(channelConfig);
    }
}
//export default firebaseSetting;