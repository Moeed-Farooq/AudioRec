import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ItemProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  style?: any;
  disabledStyle?: any;
  textStyle?: any;
  imgLeftSrc?: any;
  imgLeftStyle?: any;
  indicatorColor?: string;
  activeOpacity?: number;
}

const Button = (props: ItemProps) => {
  const {
    children,
    isLoading,
    isDisabled,
    onPress,
    style,
    disabledStyle,
    textStyle,
    imgLeftSrc,
    imgLeftStyle,
    indicatorColor,
    activeOpacity,
  } = props;

  if (isDisabled) {
    return (
      <View style={disabledStyle}>
        <Text style={textStyle}>{children}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={style}>
        <ActivityIndicator size="small" color={indicatorColor} />
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={activeOpacity} onPress={onPress}>
      <View style={style}>
        {imgLeftSrc ? (
          <Image style={imgLeftStyle} source={imgLeftSrc} />
        ) : null}
        <Text style={textStyle}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
};



const styles: any = StyleSheet.create({
  btn: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    borderRadius: 4,
    borderWidth: 2,
    width: 320,
    height: 52,
    borderColor: 'white',

    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: 'rgb(243,243,243)',
    alignSelf: 'center',
    borderRadius: 4,
    borderWidth: 2,
    width: 320,
    height: 52,
    borderColor: '#333',

    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    fontSize: 14,
    color: 'white',
  },
  imgLeft: {
    width: 24,
    height: 24,
    position: 'absolute',
    left: 16,
  },
});

Button.defaultProps = {
  isLoading: false,
  isDisabled: false,
  style: styles.btn,
  textStyle: styles.txt,
  imgLeftStyle: styles.imgLeft,
  indicatorColor: 'white',
  activeOpacity: 0.5,
};


export default Button;