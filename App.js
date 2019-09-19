import React from 'react';
import { View, Text, Button, StatusBar, AppRegistry, StyleSheet} from 'react-native';
import { WebView } from 'react-native-webview';
import firebase from 'react-native-firebase';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
var uid = "vjsoqWdhbEYIKH4q00Zrp20UFHH3"
var link = "https://google.com"
firebase.auth()
  .signInAnonymously()
  .then(credential => {
    if (credential) {
      console.log('default app user ->', credential.user.toJSON());
    }
  });
class HomeScreen extends React.Component {
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

class DetailsScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create(
  {
    container: {
      flex: 1,
    },
  });

const AppNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
  },
  Details: {
    screen: DetailsScreen,
  },
}, {
    initialRouteName: 'Home',
});

export default createAppContainer(AppNavigator);
