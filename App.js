import React from 'react';
import { TextInput,TouchableOpacity,View, Text, Button, StatusBar, AppRegistry, StyleSheet} from 'react-native';
import { WebView } from 'react-native-webview';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
import {
  startCheckoutAsync,
  CheckoutErrorCancelled,
  CheckoutErrorSdkNotAuthorized,
  UsageError,
  authorizeAsync,
AuthorizeErrorNoNetwork,
deauthorizeAsync, canDeauthorizeAsync
} from 'react-native-square-reader-sdk';

var uid = "sq0acp-J5FkblPzGGWKMP-m3PHn-kiDj7Kr7ORbaS2DEQfrBdg"
var link = "https://a1e57b11.ngrok.io/cedar-location-1/order"


class AuthScreen extends React.Component{
  static NavigationOptions = { title: 'Order', header: { visible:false } };

  componentDidMount() {
    window.setTimeout(async () => {
      if (await canDeauthorizeAsync()) {
        try {
          await deauthorizeAsync();
          try {
            // authCode is a mobile authorization code from the Mobile Authorization API
            const authorizedLocation = authorizeAsync(uid);
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
                //alert('Error', errorMessage);
                break;
            }
          }
        } catch (ex) {
          let errorMessage = ex.message;
          if (__DEV__) {
            errorMessage += `\n\nDebug Message: ${ex.debugMessage}`;
            console.log(`${ex.code}:${ex.debugCode}:${ex.debugMessage}`);
          }
          alert('Error', errorMessage);
        }
      } else {
        alert('Unable to deauthorize', 'You cannot deauthorize right now.');
      }
    }, 1000);



  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>
        <Button
          title="Press Here To start"
          color = "green"
          onPress={() => {
            this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Home' })
              ],
            }))
          }}
        />

      </View>
    );
  }
}




class HomeScreen extends React.Component{
  static NavigationOptions = { title: 'Order', header: { visible:false } };
  constructor(props) {
        super(props)
    }


  render() {

    return (
      <View style={styles.container}>

        <StatusBar hidden />
        <WebView
          ref={"webview"}
          originWhitelist={['*']}

          source={{ uri: link }}
          mixedContentMode={"always"}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          automaticallyAdjustContentInsets={false}
          allowFileAccess={true}
          startInLoadingStage={true}
          onMessage = {event =>{
                  const { data } = event.nativeEvent;
                  // alert(data);

                  data_arr = data.split("~");
                  var amt = parseInt(data_arr[0], 10);
                  var token = String(data_arr[1]);

                  this.props.navigation.navigate('Square', {amt: amt, token:token});

                }
          }
          />
      </View>
    );
  }
}

class SquareScreen extends React.Component{
  static NavigationOptions = { title: 'Order', header: { visible:false } };
  constructor(props) {
    super(props);
    //this.readUserData = this.readUserData.bind(this)
    //this.snapshot = this.snapshot.bind(this)
    this.state = {amtCharge: 0};
  }
  //var amt = 0;
  async componentDidMount() {
    try {
      const authorizedLocation = await getAuthorizedLocationAsync();
      this.setState({ locationName: authorizedLocation.name });
    } catch (ex) {
      if (__DEV__) {
        //alert(ex.debugCode, ex.debugMessage);
      } else {
        //alert(ex.code, ex.message);
      }
    }
  }
  async onCheckout(amt, token) {
    const { navigate } = this.props.navigation;
    const checkoutParams = {
      amountMoney: {
        amount: amt,
        currencyCode: 'USD', // optional, use authorized location's currency code by default
      },
      // Optional for all following configuration
      skipReceipt: true,
      collectSignature: true,
      allowSplitTender: true,
      delayCapture: false,
      note: "Kiosk Payment",
      tipSettings: {
        showCustomTipField: true,
        showSeparateTipScreen: false,
        tipPercentages: [10, 15, 20],
      }
    };

    try {
      const checkoutResult = await startCheckoutAsync(checkoutParams);
      // this.props.navigation.navigate('Home');
      // Consume checkout result from here
      // webHook Here
      const currencyFormatter = this.props.globalize.getCurrencyFormatter(
        checkoutResult.totalMoney.currencyCode,
        { minimumFractionDigits: 0, maximumFractionDigits: 2 },
      );
      const formattedCurrency = currencyFormatter(checkoutResult.totalMoney.amount / 100);
      //alert(`${formattedCurrency} Successfully Charged`, 'See the debugger console for transaction details. You can refund transactions from your Square Dashboard.');
      console.log(JSON.stringify(checkoutResult));
      alert("done");


    } catch (ex) {
      let errorMessage = ex.message;
      switch (ex.code) {
        case CheckoutErrorSdkNotAuthorized:
          // Handle sdk not authorized
          navigate('Deauthorizing');
          break;
        default:
          if (__DEV__) {
            errorMessage += `\n\nDebug Message: ${ex.debugMessage}`;
            console.log(`${ex.code}:${ex.debugCode}:${ex.debugMessage}`);
          }
          //alert('Error', errorMessage);
          break;
      }
    }
    }


    render(){
      const { navigation } = this.props;
      const amt = navigation.getParam('amt', 101);
      const token = navigation.getParam('token', '-noToken');
      var disp_amt = String(parseFloat(amt/100));

      // this.onCheckout(amt,token);
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <StatusBar hidden/>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
                     this.onCheckout(amt,token);
                     this.props.navigation.navigate('Home');

            }}>
          <Text style={styles.titleText}> Pay ${disp_amt}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
                     // this.onCheckout(amt,token);
                     this.props.navigation.navigate('Home');

            }}>
          <Text style={styles.titleText}>Cancel order</Text>
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
    navigationOptions: {
      header: null //this will hide the header
    }
  },
  Square: {
    screen: SquareScreen,
    navigationOptions: {
      header: null //this will hide the header
    }
  },
  auth: {
    screen: AuthScreen,
    navigationOptions: {
      header: null //this will hide the header
    }
  }
}, {
    initialRouteName: 'auth',
});

export default createAppContainer(AppNavigator);
