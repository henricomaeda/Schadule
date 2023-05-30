// Import necessary modules and dependencies.
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { globals } from "../Globals";
import * as React from "react";

// Define a floating button with customizable properties.
const RoundButton = ({ iconName, backgroundColor = globals.colors.foreground, onPress = null }) => {
    const styles = StyleSheet.create({
        container: {
            marginTop: globals.app.width / 42,
            backgroundColor: backgroundColor,
            borderRadius: globals.app.circle,
            padding: globals.app.width / 40,
            justifyContent: "center",
            alignItems: "center",
            elevation: 10
        }
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.container}>
            <Icon
                size={globals.app.width / 13.2}
                color={globals.colors.tint}
                name={iconName}
            />
        </TouchableOpacity>
    );
};

export default RoundButton;
