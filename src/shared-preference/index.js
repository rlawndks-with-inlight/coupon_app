import AsyncStorage from '@react-native-async-storage/async-storage';

export const setSharedPreference = async (key, value) => {
    await AsyncStorage.setItem(key, value)
}
export const getSharedPreference = async (key) => {
    const value = await AsyncStorage.getItem(key)
    return value
}
export const deleteSharedPreference = async (key) => {
    const value = await AsyncStorage.removeItem(key)
}
export const SHARED_PREFERENCE = {
    PHONE: 'phone',
    KAKAO_DATA: 'kakao_data',
    TOKEN: 'token',
    LOGIN_TYPE: 'login_type'
}