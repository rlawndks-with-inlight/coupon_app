import { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { BackHandler } from 'react-native';
import { login, logout, getProfile as getKakaoProfile, unlink } from '@react-native-seoul/kakao-login';
import { SHARED_PREFERENCE, deleteSharedPreference, getSharedPreference, setSharedPreference } from '../shared-preference';

const WEBVIEW_URL = `https://team.comagain.kr`;
const ON_END_URL_LIST = [
    `${WEBVIEW_URL}/app/`,
    `${WEBVIEW_URL}/app/login/`,
    `${WEBVIEW_URL}/app/home/`,
]
const WebviewComponent = (props) => {

    const {
        func: {
            setVisible
        }
    } = props;

    const webViewRef = useRef(null);

    const [webViewUrl, setWebViewUrl] = useState(WEBVIEW_URL);
    const [backButtonCount, setBackButtonCount] = useState(0);

    useEffect(() => {
        const handleBackButtonPress = () => {
            if (webViewRef && webViewRef.canGoBack) {
                if (ON_END_URL_LIST.includes(webViewUrl) && backButtonCount < 3) {
                    if (backButtonCount < 3) {

                    } else {
                        setBackButtonCount((count) => count + 1);
                    }
                    return true; // back 버튼 이벤트를 처리했음을 알림
                } else {
                    webViewRef.goBack();
                    setBackButtonCount(0);
                    return true;
                }
            } else {
                return false;
            }

        };
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress); // back 버튼 이벤트 핸들러 등록
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonPress); // back 버튼 이벤트 핸들러 제거
        };
    }, [webViewUrl, backButtonCount]);
    const onMessage = async (e) => {
        const event = JSON.parse(e.nativeEvent.data)
        console.log(event?.method)
        let method = event?.method;
        let data = {};
        if (event?.method == 'kakao_login') {//

            if (webViewRef.current) {
                try {
                    const token = await login();
                    console.log(token)
                    const profile = await getKakaoProfile();
                    console.log(profile)
                    let kakao_data = await getSharedPreference(SHARED_PREFERENCE.KAKAO_DATA);
                    
                    if(typeof kakao_data == 'string'){
                        kakao_data = JSON.parse(kakao_data);
                    }
                    if(kakao_data?.id != profile?.id){
                        console.log(1)
                        let result = await deleteSharedPreference(SHARED_PREFERENCE.PHONE);
                        let result2 = await setSharedPreference(SHARED_PREFERENCE.KAKAO_DATA, JSON.stringify(profile));
                    }
                    let phone = await getSharedPreference(SHARED_PREFERENCE.PHONE);
                    webViewRef.current.postMessage(
                        JSON.stringify({ method: event?.method, data: { ...profile, phone: phone } }),
                        '*'
                    )
                    // 로그인 성공 시 처리
                } catch (error) {
                    console.log(error);
                    // 로그인 실패 시 처리
                }

            }
        } else if (event?.method == 'phone_save') {//
            let phone = await getSharedPreference(SHARED_PREFERENCE.PHONE);
            
            if(phone != event.data?.phone && phone){ // 새로운 폰번호가 들어왔을때
                let result = await deleteSharedPreference(SHARED_PREFERENCE.KAKAO_DATA);
            }
            setSharedPreference(SHARED_PREFERENCE.PHONE, event.data?.phone ?? "")
        }
    }
    const handleWebViewNavigationStateChange = (navState) => {
        console.log(navState.url)
        setWebViewUrl(navState.url); // WebView의 URL이 변경될 때마다 현재 URL 업데이트
    };
    const handleWebViewError = (error) => {
        console.error(error); // WebView에서 에러 발생 시 에러 로그 출력
    };
    return (
        <WebView
            ref={webViewRef}
            source={{ uri: `${WEBVIEW_URL}/app/login/` }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            onMessage={onMessage}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            onLoad={() => {
                setVisible(false)
            }}
            onError={handleWebViewError}
        />
    )
}
export default WebviewComponent

