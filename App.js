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



class AuthScreen extends React.Component{

  constructor(props) {
    super(props);
    this.state = {text: '',
    text1:'',
    text2:'',
    text3:''};
  }
 async componentDidMount() {
 }
    async getCode(link,codeVal) {
  try {
    let response = await fetch(
      link,{
      method: 'POST',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      code: codeVal
      }),
    }
    );
    let responseJson = await response.json();
    // alert(responseJson.code)
    alert(responseJson.link);
    if (await canDeauthorizeAsync()) {
      try {
        await deauthorizeAsync();
        try {
          // authCode is a mobile authorization code from the Mobile Authorization API
          const authorizedLocation = authorizeAsync(responseJson.code);
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
    this.props.navigation.navigate('Home', {
              link: responseJson.link });

  } catch (error) {
    console.error(error);
  }
}





  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
       <StatusBar hidden />
       <Text style={styles.titleText}>
       Enter Your Root URL{"\n"}
       </Text>
       <TextInput
           style={{width:300, height: 60, borderColor: 'white', borderWidth: 1, backgroundColor: 'white' }}
           placeholder="EX a1e57b11.ngrok.io"
           returnKeyLabel = {"next"}
           onChangeText={
             (text) => this.setState({text})
           }
           value={this.state.text}
         />
         <Text style={styles.titleText}>
         {"\n"}Enter Location Name, Replace All Spaces With Dashes{"\n"}
         </Text>
         <TextInput
             style={{width:300, height: 60, borderColor: 'white', borderWidth: 1, backgroundColor: 'white' }}
             placeholder="Copy Location Name From Square"
             returnKeyLabel = {"next"}
             onChangeText={
               (text1) => this.setState({text1})
             }
             value={this.state.text1}
           />
           <Text style={styles.titleText}>
           {"\n"}Enter Employee Code{"\n"}
           </Text>
           <TextInput
               style={{width:300, height: 60, borderColor: 'white', borderWidth: 1, backgroundColor: 'white' }}
               placeholder="Code Used to Login to Employee Panel"
               returnKeyLabel = {"next"}
               onChangeText={
                 (text3) => this.setState({text3})
               }
               value={this.state.text3}
             />
           <Text style={styles.titleText}>
           {"\n"}Enter a 0 for QSR Kiosk or 1 For Sitdown Kiosk{"\n"}
           </Text>
           <TextInput
               style={{width:300, height: 60, borderColor: 'white', borderWidth: 1, backgroundColor: 'white' }}
               keyboardType={'numeric'}
                placeholder=""
                maxLength={1}
               onChangeText={
                 (text2) => this.setState({text2})
               }
               value={this.state.text2}
             />
             <Text style={styles.titleText}>
             {"\n"}
             </Text>
         <TouchableOpacity
           style={styles.button}
           onPress={() => {
            this.getCode(String("https://" + String(this.state.text) + "/reader/" + String(this.state.text1)+ "/" + String(this.state.text2)), String(this.state.text3));

         }}
       >
         <Text style={styles.titleText}>Next</Text>
         </TouchableOpacity>

     </View>
    );
  }
}




class HomeScreen extends React.Component{
  constructor(props) {
        super(props)
    }


  render() {
    const { navigation } = this.props;
    const link = navigation.getParam('link', "cedarrobots.com");

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
                  var loc = String(data_arr[2]);

                  this.props.navigation.navigate('Square', {amt: amt, token:token, linkval:link, loc:loc});

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
  async onCheckout(amt,token,loc,link) {
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

      }

      let response = await fetch(
        String(loc+"/verify-kiosk"),{
        method: 'POST',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        tokenVal: token
        }),
      }
      );
      let responseJson = await response.json();
      if(responseJson.success == "true"){
      this.props.navigation.navigate('Home', {linkval: link});
    }
      console.log(JSON.stringify(checkoutResult));





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
    // this.props.navigation.navigate('Home', {linkval: link});
    }

    render(){
      const { navigation } = this.props;
      const amt = navigation.getParam('amt', 101);
      const token = navigation.getParam('token', '-noToken');
      const link = navigation.getParam('linkval', 'error');
      const loc = navigation.getParam('loc', 'error');
      var disp_amt = String(parseFloat(amt/100));

      // this.onCheckout(amt,token);
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
        <StatusBar hidden/>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
                     this.onCheckout(100,token,loc,link);
                    //


            }}>
          <Text style={styles.titleText}> Pay ${disp_amt}</Text>
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
