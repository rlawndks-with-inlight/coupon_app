import { useEffect, useRef, useState } from 'react';
//import { WebView } from 'react-native-webview';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { login, logout, getProfile as getKakaoProfile, unlink } from '@react-native-seoul/kakao-login';
import { SHARED_PREFERENCE, deleteSharedPreference, getSharedPreference, setSharedPreference } from '../shared-preference';
import { WebView } from 'react-native-webview';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
// import SmsRetriever from 'react-native-sms-retriever';
import GetLocation from 'react-native-get-location';

const WEBVIEW_URL = `https://team.comagain.kr`;
const ON_END_URL_LIST = [
    `${WEBVIEW_URL}/app/`,
    `${WEBVIEW_URL}/app/login/`,
    `${WEBVIEW_URL}/app/home/`,
]
async function onAppleButtonPress() {
    // start a login request
    try {
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME],
        });
        return appleAuthRequestResponse
    } catch (error) {
        return {};
    }
}
const WebviewComponent = (props) => {
    const {
        func: {
            setVisible,
            setBackgroundColor
        }
    } = props;


    // SMS 수신 이벤트 등록
    const webViewRef = useRef(null);

    const [canGoBack, setCanGoBack] = useState(false);
    const [backButtonCount, setBackButtonCount] = useState(0);
    const [currentURL, setCurrentURL] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    // useEffect(() => {
    //     // SMS 수신 이벤트 리스너 등록
    //     const startSmsRetriever = async () => {
    //         try {
    //             const registered = await SmsRetriever.startSmsRetriever();
    //             if (registered) {
    //                 SmsRetriever.addSmsListener((event) => {
    //                     const { message } = event;
    //                     ToastAndroid.BOTTOM('SMS 수신:', event)
    //                     // SMS 메시지에서 인증번호 추출
    //                     //const regex = /([0-9]{6})/; // 인증번호는 6자리 숫자로 가정
    //                     // const extractedCode = message.match(regex);
    //                     // if (extractedCode) {
    //                     //     setVerificationCode(extractedCode[0]); // 추출한 인증번호 저장
    //                     // }
    //                 });
    //             }
    //         } catch (error) {
    //             console.log('SMS 수신 에러:', error);
    //         }
    //     };

    //     startSmsRetriever();

    //     return () => {
    //         // SMS 수신 이벤트 리스너 등록 해제
    //         SmsRetriever.removeSmsListener();
    //     };
    // }, []);

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
        };
    }, [backButtonCount, canGoBack, currentURL]);
    const onAndroidBackPress = () => {
        if (canGoBack) {
            webViewRef.current.goBack();
            return true;
        } else {
            return false; // app will be closed
        }
    };
    const onMessage = async (e) => {
        const event = JSON.parse(e.nativeEvent.data)
        let method = event?.method;
        let data = {};
        let sns_login_method_list = ['kakao_login', 'apple_login'];
        if (sns_login_method_list.includes(method)) {
            if (webViewRef.current) {
                let profile = {};
                if (method == 'kakao_login') {//
                    try {
                        const token = await login();
                        profile = await getKakaoProfile();
                        // 로그인 성공 시 처리
                    } catch (error) {
                        console.log(error);
                    }
                } else if (method == 'apple_login') {
                    let user = await onAppleButtonPress();
                    if (user?.user) {
                        profile['id'] = user?.user;
                    }
                }
                let sns_data = await getSharedPreference(SHARED_PREFERENCE.SNS_DATA);
                if (typeof sns_data == 'string') {
                    sns_data = JSON.parse(sns_data);
                }
                if (sns_data?.id != profile?.id) {
                    let result = await deleteSharedPreference(SHARED_PREFERENCE.PHONE);
                    let result2 = await setSharedPreference(SHARED_PREFERENCE.SNS_DATA, JSON.stringify(profile));
                }
                let phone = await getSharedPreference(SHARED_PREFERENCE.PHONE);
                webViewRef.current.postMessage(
                    JSON.stringify({ method: method, data: { ...profile, phone: phone } }),
                    '*'
                )
            }
        } else if (method == 'phone_save') {//
            try {
                let phone = await getSharedPreference(SHARED_PREFERENCE.PHONE);
                if (phone != event.data?.phone && phone) { // 새로운 폰번호가 들어왔을때
                    let result = await deleteSharedPreference(SHARED_PREFERENCE.SNS_DATA);
                }
                console.log(event.data)
                setSharedPreference(SHARED_PREFERENCE.PHONE, event.data?.phone ?? "")
                setSharedPreference(SHARED_PREFERENCE.TOKEN, event.data?.token ?? "")
                setSharedPreference(SHARED_PREFERENCE.LOGIN_TYPE, event.data?.login_type ?? "0")
                return;
            } catch (err) {
                console.log(err);
            }

        } else if (method == 'logined') {
            let phone = await getSharedPreference(SHARED_PREFERENCE.PHONE);
            let token = await getSharedPreference(SHARED_PREFERENCE.TOKEN);
            let login_type = await getSharedPreference(SHARED_PREFERENCE.LOGIN_TYPE);
            let os = Platform.OS;
            webViewRef.current.postMessage(
                JSON.stringify({ method: method, data: { phone: phone, token: token, login_type: login_type, os: os.toString() } }),
                '*'
            )
        } else if (method == 'logout') {
            let result2 = await deleteSharedPreference(SHARED_PREFERENCE.TOKEN);
            let result3 = await deleteSharedPreference(SHARED_PREFERENCE.LOGIN_TYPE);
        } else if (method == 'mode') {
            if (event?.data?.mode) {
                await setSharedPreference(SHARED_PREFERENCE.MODE, event.data?.mode);
                setBackgroundColor(event.data?.backgroundColor ?? "");
                await setSharedPreference(SHARED_PREFERENCE.BACKGROUND_COLOR, event.data?.backgroundColor);
            }
            let os = Platform.OS;
            let mode = await getSharedPreference(SHARED_PREFERENCE.MODE);
            let background_color = await getSharedPreference(SHARED_PREFERENCE.BACKGROUND_COLOR);
            background_color = background_color??"#fff";
            setBackgroundColor(background_color)

            webViewRef.current.postMessage(
                JSON.stringify({ method: method, data: { mode: mode, os: os } }),
                '*'
            )
        } else if (method == 'get_location'){
            let location = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 60000,
            });
            webViewRef.current.postMessage(
                JSON.stringify({ method: method, data: location }),
                '*'
            )
        }
    }
    const handleWebViewNavigationStateChange = (navState) => {
        setCurrentURL(navState.url);
        setCanGoBack(navState.canGoBack);
    };
    const handleWebViewError = (error) => {
        console.error(error); // WebView에서 에러 발생 시 에러 로그 출력
    };
    useEffect(() => {
        console.log(webViewRef.current)
    }, [webViewRef.current])
    return (
        <WebView
            ref={webViewRef}
            source={{ uri: `${WEBVIEW_URL}/app/login/` }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            onMessage={onMessage}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            onLoad={() => {
                setVisible(false);
            }}
            onError={handleWebViewError}
            androidHardwareAccelerationEnabled={true}
            cacheEnabled={true}
            decelerationRate="normal"
            sharedCookiesEnabled={true}
            renderingMode="hybrid"
            useWebkit={true}
        />
    )
}
export default WebviewComponent

