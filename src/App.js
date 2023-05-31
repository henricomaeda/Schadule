// Import required modules and dependencies.
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native";
import * as React from "react";

// Import the components to render, and global variables.
import DataScreen from "./screens/DataScreen";
import DetailsScreen from "./screens/DetailsScreen";
import FormScreen from "./screens/FormScreen";
import HomeScreen from "./screens/HomeScreen";
import { globals } from "./Globals";

// Import the new functions to navigate and define the navigation theme.
import { navigateToHome, replaceRoute } from "./utils/Navigation";
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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <NavigationContainer theme={NavigationTheme}>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={({ navigation, route }) => ({
          headerTitle: globals.app.name,
          headerTintColor: globals.colors.placeholder,
          headerTitleStyle: { fontSize: globals.app.width / 22 },
          headerStyle: { backgroundColor: globals.colors.midground },
          headerLeft: () => route.name !== "HomeScreen" && (
            <TouchableOpacity
              style={{ marginRight: globals.app.width / 22 }}
              onPress={() => navigateToHome(navigation)}>
              <Icon
                color={globals.colors.placeholder}
                size={globals.app.width / 18.2}
                name="arrow-back"
              />
            </TouchableOpacity>
          ),
          headerRight: () => route.name === "HomeScreen" && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setIsMenuOpen(false)}
              style={{
                height: globals.app.width / 10,
                justifyContent: "flex-end",
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setIsMenuOpen(false);
                  setTimeout((() => replaceRoute(navigation, route.name)), 0);
                }}
                style={{ marginRight: globals.app.width / 42 }}>
                <Icon
                  color={globals.colors.placeholder}
                  size={globals.app.width / 18}
                  name="cached"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
                <Icon
                  color={globals.colors.placeholder}
                  size={globals.app.width / 18}
                  name="more-vert"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )
        })}>
        <Stack.Screen name="DataScreen" component={DataScreen} />
        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
        <Stack.Screen name="FormScreen" component={FormScreen} />
        <Stack.Screen name="HomeScreen">
          {(props) => <HomeScreen {...props} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer >
  );
};
