/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import {SafeAreaView, StatusBar, useColorScheme, View} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import MapScreen from "./screens/MapScreen";
import FiltersScreen from "./screens/FiltersScreen";
import NavigationBar from "./NavigationBar";

export type RootStackParamList = {
  Map: undefined;
  Filters: undefined;
};

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const headerStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    color: isDarkMode ? Colors.white : Colors.black,
  };

  const Stack = createNativeStackNavigator<RootStackParamList>();

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={{flex: 1}}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Map"
            screenOptions={{
              header: props => <NavigationBar props={props} />,
            }}>
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Filters"
              component={FiltersScreen}
              options={{}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaView>
  );
}

export default App;
