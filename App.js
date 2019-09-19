import React from 'react';
import { TextInput,TouchableOpacity,View, Text, Button, StatusBar, AppRegistry, StyleSheet} from 'react-native';
import { WebView } from 'react-native-webview';
import firebase from 'react-native-firebase';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
var uid = "vjsoqWdhbEYIKH4q00Zrp20UFHH3"
var link = "https://google.com"

class HomeScreen extends React.Component{
  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <WebView
          style={styles.WebViewStyle}
          source={{ uri: link }}
          javaScriptEnabled={true}
          domStorageEnabled={true} />
        <Button
          title=" "
          color = "green"
          onPress={() => {
            this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Details' })
              ],
            }))
          }}
        />
      </View>
    );
  }
}

class DetailsScreen extends React.Component{
  constructor(props) {
    super(props);
    this.state = {text: ''};
  }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <StatusBar hidden />
        <Text style={styles.titleText}>
        Enter Your Phone Number Again To Keep Your Payment Secure{"\n"}
        </Text>
        <Text style={styles.titleText}>
        Please Put a 1 In Front of Your Number{"\n"}
        </Text>
        <TextInput
            style={{width:300, height: 60, borderColor: 'white', borderWidth: 1, backgroundColor: 'white' }}
            keyboardType={'numeric'}
            placeholder="format 12223334444"
            maxLength={11}
            returnKeyLabel = {"next"}
            onChangeText={
              (text) => this.setState({text})
            }
            value={this.state.text}
          />
        <Text style={styles.titleText}>
          {"\n"}
        </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.props.navigation.navigate('Square', {
              numId: this.state.text });
          }}
        >
          <Text style={styles.titleText}> Next </Text>
          </TouchableOpacity>

      </View>
    );
  }
}

class SquareScreen extends React.Component{
  render() {
    const { navigation } = this.props;
    const itemId = navigation.getParam('numId', '555');
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <StatusBar hidden />
        <Text style={styles.titleText}>
        {itemId}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create(
  {
    container: {
      flex: 1,
    },
    titleText:{
      color: 'white',
      fontSize: 18,
      textAlign: 'center',
      fontFamily:'notoserif'
    },
    button: {
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 10,
    borderColor: 'white',
     borderWidth: 1,
     borderRadius: 4
  }
  });

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Details: {
    screen: DetailsScreen,
  },
  Square: {
    screen: SquareScreen,
  }
}, {
    initialRouteName: 'Home',
});

export default createAppContainer(AppNavigator);
