import { navigateToHome } from "../utils/Navigation";
import { globals } from "../Globals";
import * as React from "react";
import {
    TouchableOpacity,
    ScrollView,
    Image,
    Text,
    View,
    Linking
} from "react-native";
import RoundButton from "../components/RoundButton";

const DetailsScreen = ({ navigation }) => {
    const CustomLabel = ({ title, subtitle = "", description, source = null, onPress = null }) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    backgroundColor: globals.colors.midground,
                    paddingHorizontal: globals.app.width / 42,
                    paddingVertical: globals.app.width / 32,
                    marginBottom: globals.app.width / 32,
                    borderRadius: globals.app.width / 32,
                    justifyContent: "center",
                    flexDirection: "row",
                    alignItems: "center",
                    elevation: 10
                }}>
                <Image
                    source={source}
                    style={{
                        marginRight: globals.app.width / 42,
                        borderRadius: globals.app.circle,
                        height: globals.app.width / 8,
                        width: globals.app.width / 8,
                        flex: 0
                    }}
                />
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                marginRight: globals.app.width / 42,
                                fontSize: globals.app.width / 19.2,
                                color: globals.colors.tint
                            }}>
                            {title}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={{
                                fontSize: globals.app.width / 22.6,
                                color: globals.colors.foreground
                            }}>
                            {subtitle}
                        </Text>
                    </View>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: globals.app.width / 23.2,
                            color: globals.colors.placeholder
                        }}>
                        {description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{
                    padding: globals.app.width / 20,
                    flexGrow: 1
                }}>
                <CustomLabel
                    title="Schadule"
                    subtitle="Schedule + Shade"
                    description="Mistura de agenda com sombra"
                    source={require("../assets/Icon.png")}
                    onPress={() => navigateToHome(navigation)}
                />
                <CustomLabel
                    title="Designer"
                    description="Ícones desenvolvidos por Freepik"
                    source={require("../assets/Freepik.jpg")}
                    onPress={() => Linking.openURL("https://www.flaticon.com/authors/freepik")}
                />
                <CustomLabel
                    title="API"
                    description="Feriados nacionais por Brasil API"
                    source={require("../assets/BrasilAPI.jpg")}
                    onPress={() => Linking.openURL("https://brasilapi.com.br")}
                />
                <CustomLabel
                    title="Open source"
                    description="Projeto disponível no GitHub"
                    source={require("../assets/GitHub.png")}
                    onPress={() => Linking.openURL("https://github.com/henricomaeda/Schadule")}
                />
                <CustomLabel
                    title="React native"
                    description="Aplicativo feito por Henrico Maeda"
                    source={require("../assets/ReactNative.png")}
                    onPress={() => Linking.openURL("https://reactnative.dev")}
                />
            </ScrollView>
            <View
                style={{
                    bottom: globals.app.width / 26,
                    right: globals.app.width / 26,
                    position: "absolute"
                }}>
                <RoundButton iconName="forward" onPress={() => navigateToHome(navigation)} />
            </View>
        </View>
    )
};

export default DetailsScreen;
