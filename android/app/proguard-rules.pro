# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# For Kakao Login
-keepattributes *Annotation*
-keepattributes Signature
-keep class com.kakao.auth.**{*;}
-keep class com.kakao.util.helper.**{*;}
-keep class com.kakao.network.**{*;}
-keep class com.kakao.usermgmt.**{*;}
-keep class com.kakao.sdk.**{*;}
-dontwarn com.kakao.sdk.**