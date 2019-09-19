import React from 'react';
import { TextInput,TouchableOpacity,View, Text, Button, StatusBar, AppRegistry, StyleSheet} from 'react-native';
import { WebView } from 'react-native-webview';
import firebase from 'react-native-firebase';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
import {
  startCheckoutAsync,
  CheckoutErrorCancelled,
  CheckoutErrorSdkNotAuthorized,
  UsageError,
  authorizeAsync,
AuthorizeErrorNoNetwork
} from 'react-native-square-reader-sdk';

var uid = "vjsoqWdhbEYIKH4q00Zrp20UFHH3"
var link = "https://google.com"

try {
  // authCode is a mobile authorization code from the Mobile Authorization API
  const authorizedLocation = authorizeAsync("sq0acp-XvXFzWdzqPIhNodJqwTUnxnOG-vGFS05nXLeZoFkWC0");
  // Authorized and authorizedLocation is available
} catch(ex) {
  switch(ex.code) {
    case AuthorizeErrorNoNetwork:
      // Remind connecting to network
      break;
    case UsageError:
      let errorMessage = ex.message;
      if (__DEV__) {
        errorMessage += `\n\nDebug Message: ${ex.debugMessage}`;
        console.log(`${ex.code}:${ex.debugCode}:${ex.debugMessage}`)
      }
      Alert.alert('Error', errorMessage);
      break;
  }

}

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
  async componentDidMount() {
    try {
      const authorizedLocation = await getAuthorizedLocationAsync();
      this.setState({ locationName: authorizedLocation.name });
    } catch (ex) {
      if (__DEV__) {
        Alert.alert(ex.debugCode, ex.debugMessage);
      } else {
        Alert.alert(ex.code, ex.message);
      }
    }
  }

  async onCheckout() {
    const { navigate } = this.props.navigation;
    // A checkout parameter is required for this checkout method
    const checkoutParams = {
      amountMoney: {
        amount: 100,
        currencyCode: 'USD', // optional, use authorized location's currency code by default
      },
      // Optional for all following configuration
      skipReceipt: true,
      collectSignature: true,
      allowSplitTender: false,
      delayCapture: false,
      note: 'Payment',
      tipSettings: {
        showCustomTipField: false,
        showSeparateTipScreen: false,
        tipPercentages: [10, 15, 20],
      },
      additionalPaymentTypes: ['cash'],
    };

    try {
      const checkoutResult = await startCheckoutAsync(checkoutParams);
      // Consume checkout result from here
      const currencyFormatter = this.props.globalize.getCurrencyFormatter(
        checkoutResult.totalMoney.currencyCode,
        { minimumFractionDigits: 0, maximumFractionDigits: 2 },
      );
      const formattedCurrency = currencyFormatter(checkoutResult.totalMoney.amount / 100);
      alert(`${formattedCurrency} Successfully Charged`, 'See the debugger console for transaction details. You can refund transactions from your Square Dashboard.');
      console.log(JSON.stringify(checkoutResult));

    } catch (ex) {
      let errorMessage = ex.message;
      switch (ex.code) {
        case CheckoutErrorCanceled:
          // Handle canceled transaction here
          console.log('transaction canceled.');
          break;
        case CheckoutErrorSdkNotAuthorized:
          // Handle sdk not authorized
          navigate('Deauthorizing');
          break;
        default:
          if (__DEV__) {
            errorMessage += `\n\nDebug Message: ${ex.debugMessage}`;
            console.log(`${ex.code}:${ex.debugCode}:${ex.debugMessage}`);
          }
          Alert.alert('Error', errorMessage);
          break;
      }
    }
    }
    render(){
      const { navigation } = this.props;
      const itemId = navigation.getParam('numId', '555');
      firebase.database().ref(`public/${itemId}`).once('value', function (snapshot) {
        const chargeAmt = (snapshot.val())
        return chargeAmt;
      })
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <StatusBar hidden/>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                {this.onCheckout(); this.props.navigation.navigate('Home'); }}>

              <Text style={styles.titleText}> Pay $1 </Text>
              </TouchableOpacity>
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
