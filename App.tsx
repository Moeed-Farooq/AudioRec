import React, { useState, useEffect, useRef } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import ReactNativeBlobUtil from 'react-native-blob-util'

import Button from './components/uis/Button';

const screenWidth = Dimensions.get('screen').width;

const Page = () => {
  const [uri, seturi] = useState()
  const dirs = ReactNativeBlobUtil.fs.dirs;
  const path = Platform.select({
    ios: undefined,
    android: undefined,
  });

  const [state, setState] = useState({
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: '00:00:00',
    duration: '00:00:00',
  });

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());

  useEffect(() => {
    audioRecorderPlayer.current.setSubscriptionDuration(0.1); // optional. Default is 0.5
  }, []);

  const playWidth =
    (state.currentPositionSec / state.currentDurationSec) * (screenWidth - 56) ||
    0;

  const onStatusPress = (e) => {
    const touchX = e.nativeEvent.locationX;
    const currentPosition = Math.round(state.currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      audioRecorderPlayer.current.seekToPlayer(addSecs);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      audioRecorderPlayer.current.seekToPlayer(subSecs);
    }
  };

  const onStartRecord = async () => {
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    const uri = await audioRecorderPlayer.current.startRecorder(path, audioSet);

    audioRecorderPlayer.current.addRecordBackListener((e) => {
      setState((prevState) => ({
        ...prevState,
        recordSecs: e.currentPosition,
        recordTime: audioRecorderPlayer.current.mmssss(
          Math.floor(e.currentPosition),
        ),
      }));
    });
    seturi(uri)
  };

  const onPauseRecord = async () => {
    try {
      const r = await audioRecorderPlayer.current.pauseRecorder();
      console.log(r);
    } catch (err) {
      console.log('pauseRecord', err);
    }
  };

  const onResumeRecord = async () => {
    await audioRecorderPlayer.current.resumeRecorder();
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.current.stopRecorder();
    audioRecorderPlayer.current.removeRecordBackListener();

    console.log('============uri========================');
    console.log(uri);
    console.log('====================================');
    // Pass the path variable to convertFileToBase64 function
    const base64Data = await convertFileToBase64(uri);

    // Log or use the base64Data as needed
    console.log(base64Data);

    setState((prevState) => ({
      ...prevState,
      recordSecs: 0,
    }));
    console.log(result);
  };

  const onStartPlay = async () => {
    console.log('onStartPlay', path);

    try {
      const msg = await audioRecorderPlayer.current.startPlayer(path);
      const volume = await audioRecorderPlayer.current.setVolume(1.0);
      console.log(`path: ${msg}`, `volume: ${volume}`);

      audioRecorderPlayer.current.addPlayBackListener((e) => {
        setState((prevState) => ({
          ...prevState,
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
          playTime: audioRecorderPlayer.current.mmssss(
            Math.floor(e.currentPosition),
          ),
          duration: audioRecorderPlayer.current.mmssss(Math.floor(e.duration)),
        }));
      });
    } catch (err) {
      console.log('startPlayer error', err);
    }
  };

  const onPausePlay = async () => {
    await audioRecorderPlayer.current.pausePlayer();
  };

  const onResumePlay = async () => {
    await audioRecorderPlayer.current.resumePlayer();
  };

  const onStopPlay = () => {
    console.log('onStopPlay');
    audioRecorderPlayer.current.stopPlayer();
    audioRecorderPlayer.current.removePlayBackListener();
  };

  const convertFileToBase64 = async (filePath) => {
    const uploadUri = Platform.OS === 'ios' ? filePath.replace('file:///', '') : uri;
    const response = await ReactNativeBlobUtil.fs.readFile(uploadUri, 'base64');
    return response;
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleTxt}>Audio Recorder Player</Text>
      <Text style={styles.txtRecordCounter}>{state.recordTime}</Text>
      <View style={styles.viewRecorder}>
        <View style={styles.recordBtnWrapper}>
          <Button
            style={styles.btn}
            onPress={onStartRecord}
            textStyle={styles.txt}>
            Record
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={onPauseRecord}
            textStyle={styles.txt}>
            Pause
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={onResumeRecord}
            textStyle={styles.txt}>
            Resume
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={onStopRecord}
            textStyle={styles.txt}>
            Stop
          </Button>
        </View>
      </View>
      <View style={styles.viewPlayer}>
        <TouchableOpacity
          style={styles.viewBarWrapper}
          onPress={onStatusPress}>
          <View style={styles.viewBar}>
            <View style={[styles.viewBarPlay, { width: playWidth }]} />
          </View>
        </TouchableOpacity>
        <Text style={styles.txtCounter}>
          {state.playTime} / {state.duration}
        </Text>
        <View style={styles.playBtnWrapper}>
          <Button
            style={styles.btn}
            onPress={onStartPlay}
            textStyle={styles.txt}>
            Play
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={onPausePlay}
            textStyle={styles.txt}>
            Pause
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={onResumePlay}
            textStyle={styles.txt}>
            Resume
          </Button>
          <Button
            style={[styles.btn, { marginLeft: 12 }]}
            onPress={onStopPlay}
            textStyle={styles.txt}>
            Stop
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};



const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#455A64',
    flexDirection: 'column',
    alignItems: 'center',
  },
  titleTxt: {
    marginTop: 100,
    color: 'white',
    fontSize: 28,
  },
  viewRecorder: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4,
    alignSelf: 'stretch',
  },
  viewBarPlay: {
    backgroundColor: 'white',
    height: 4,
    width: 0,
  },
  playStatusTxt: {
    marginTop: 8,
    color: '#ccc',
  },
  playBtnWrapper: {
    flexDirection: 'row',
    marginTop: 40,
  },
  btn: {
    borderColor: 'white',
    borderWidth: 1,
  },
  txt: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    marginTop: 32,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
});
export default Page;
