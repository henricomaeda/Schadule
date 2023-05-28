// Import required modules and dependencies.
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import React from "react";
import {
  NavigationContainer,
  StackActions,
  DefaultTheme
} from "@react-navigation/native";

// Import the components to render and global variables.
import HomeScreen from "./screens/HomeScreen";
import FormScreen from "./screens/FormScreen";
import { globals } from "./Globals";

// Define the navigation theme.
const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: globals.colors.background
  },
};

// Create a native stack navigator component.
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer theme={NavigationTheme}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitle: globals.app.name,
          headerTintColor: globals.colors.placeholder,
          headerTitleStyle: { fontSize: globals.app.width / 22 },
          headerStyle: { backgroundColor: globals.colors.midground },
          headerLeft: () => route.name != "HomeScreen" && (
            <TouchableOpacity
              style={{ marginRight: globals.app.width / 20 }}
              onPress={() => {
                navigation.popToTop();
                navigation.dispatch(StackActions.replace("HomeScreen"));
              }}>
              <Icon
                name="chevron-left"
                color={globals.colors.placeholder}
                size={globals.app.width / 16}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.dispatch(StackActions.replace(route.name))
              }>
              <Icon
                color={globals.colors.placeholder}
                name={route.name != "HomeScreen" ? "backspace" : "cached"}
                size={route.name != "HomeScreen" ? globals.app.width / 20 : globals.app.width / 18}
              />
            </TouchableOpacity>
          )
        })}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="FormScreen" component={FormScreen} />
      </Stack.Navigator>
    </NavigationContainer >
  );
};
