// Import necessary modules and dependencies.
import { getData, removeData, storeData } from "../utils/DataStorage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { navigateToHome } from "../utils/Navigation";
import { globals } from "../Globals";
import * as React from "react";
import {
    TouchableOpacity,
    ScrollView,
    Clipboard,
    Text,
    View,
    Alert,
    TextInput
} from "react-native";

const DataScreen = ({ navigation }) => {
    const [events, setEvents] = React.useState("");

    // Define a custom button with more properties.
    const CustomButton = ({ iconName, name, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={{ marginHorizontal: globals.app.width / 72, flex: 1 }}>
            <View
                style={{
                    backgroundColor: globals.colors.foreground,
                    borderRadius: globals.app.circle,
                    padding: globals.app.width / 32,
                    justifyContent: "center",
                    alignItems: "center",
                    alignSelf: "center"
                }}>
                <Icon
                    name={iconName}
                    color={globals.colors.tint}
                    size={globals.app.width / 14.2}
                />
            </View>
            <Text
                style={{
                    marginTop: globals.app.width / 200,
                    fontSize: globals.app.width / 25.2,
                    color: globals.colors.tint,
                    textAlign: "center"
                }}>
                {name}
            </Text>
        </TouchableOpacity>
    );

    // Create a function that verify if a text data is a JSON.
    const handleJSON = data => {
        try {
            const json = JSON.parse(data);
            if (json && json.length > 0) {
                const text = JSON.stringify(json, null, 4);
                setEvents(text.trim());
            }
        }
        catch (error) {
            console.error("Error while handle JSON:", error);
            customAlert("Dados corrompidos.");
        };
    };

    // Define a constructor function that get user's data.
    React.useEffect(() => {
        const fetchData = async () => {
            const data = await getData("events");
            if (data) handleJSON(data);
        }
        fetchData();
    }, []);

    // Create a custom alert that optimizes the process.
    const customAlert = (message = "", onPress = null) => Alert.alert(
        "Data Manager",
        message,
        onPress && [
            { text: "Cancelar" },
            {
                text: "Confirmar",
                onPress: onPress
            }
        ],
        { cancelable: true }
    );

    // Returns the component.
    return (
        <ScrollView
            contentContainerStyle={{
                padding: globals.app.width / 22.6,
                flex: 1
            }}>
            <View
                style={{
                    borderRadius: globals.app.width / 36.2,
                    padding: globals.app.width / 22.6,
                    backgroundColor: "#2db3a8",
                    justifyContent: "center",
                    elevation: 10,
                    flex: 0
                }}>
                <Icon
                    name="backup"
                    color={globals.colors.tint}
                    size={globals.app.width / 16}
                />
                <Text
                    numberOfLines={1}
                    style={{
                        marginVertical: globals.app.width / 46,
                        fontSize: globals.app.width / 22,
                        color: globals.colors.tint,
                        fontWeight: "bold"
                    }}>
                    Data Manager
                </Text>
                <Text
                    numberOfLines={3}
                    style={{
                        fontSize: globals.app.width / 22,
                        color: globals.colors.tint,
                        textAlign: "justify"
                    }}>
                    Funcionalidades de resetar e substituir dados com inserção instantânea.
                </Text>
            </View>
            <View
                style={{
                    marginBottom: globals.app.width / 12,
                    marginTop: globals.app.width / 26,
                    justifyContent: "space-between",
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 0
                }}>
                <CustomButton
                    iconName="layers-clear"
                    name="Resetar dados"
                    onPress={async () => {
                        const data = await getData("events", true);
                        if (data && data.length > 0) customAlert("Deseja mesmo resetá-los?", () => {
                            removeData("events");
                            setEvents("");
                        });
                        else customAlert("Nenhum dado encontrado.");
                    }}
                />
                <CustomButton
                    iconName="content-copy"
                    name="Copiar dados"
                    onPress={() => {
                        const data = events.trim();
                        if (data && data.length > 0) Clipboard.setString(data);
                    }}
                />
                <CustomButton
                    iconName="content-paste"
                    name="Colar dados"
                    onPress={async () => {
                        const data = (await Clipboard.getString()).trim();
                        if (data && data.length > 0) handleJSON(data);
                    }}
                />
                <CustomButton
                    iconName="published-with-changes"
                    name="Substituir dados"
                    onPress={async () => {
                        try {
                            if (events.trim().length > 0) {
                                const data = JSON.parse(events);
                                if (data && data.length > 0) customAlert("Deseja mesmo substituí-los?", () => {
                                    const isValid = (item, value) => item.hasOwnProperty(value);
                                    const isValidItems = data.every(item => {
                                        const id = isValid(item, "id") && !isNaN(parseInt(item.id));
                                        const name = isValid(item, "name");
                                        const address = isValid(item, "address");
                                        const startDate = isValid(item, "startDate") && !isNaN(new Date(item.startDate).getTime());
                                        const endDate = isValid(item, "endDate") && !isNaN(new Date(item.endDate).getTime());
                                        const limiteDate = isValid(item, "limiteDate") && !isNaN(new Date(item.limiteDate).getTime());
                                        const annually = isValid(item, "annually") && typeof Boolean(item.annually) === "boolean";
                                        const allDay = isValid(item, "allDay") && typeof Boolean(item.allDay) === "boolean";
                                        const notify = isValid(item, "notify") && typeof Boolean(item.notify) === "boolean";
                                        const category = isValid(item, "category");
                                        const status = isValid(item, "status");
                                        const description = isValid(item, "description");
                                        if (id && name && address && startDate && endDate && limiteDate && annually && allDay && category && status && description && notify) {
                                            const datesEqual = new Date(item.startDate) <= new Date(item.endDate);
                                            const datesValid = new Date(item.startDate).getFullYear() === new Date(item.endDate).getFullYear();
                                            if (datesEqual && datesValid) return true;
                                        }
                                        return false;
                                    });
                                    if (isValidItems) {
                                        storeData("events", data, true);
                                        navigateToHome(navigation);
                                    }
                                    else customAlert("Dados faltando ou inválidos.");
                                })
                                else customAlert("Nenhum dado encontrado.");
                            }
                            else customAlert("Nenhum dado encontrado.");
                        }
                        catch (error) {
                            console.error("Error while handle JSON:", error);
                            customAlert("Dados corrompidos.");
                        };
                    }}
                />
            </View>
            <Text
                style={{
                    marginBottom: globals.app.width / 200,
                    marginLeft: globals.app.width / 42,
                    fontSize: globals.app.width / 25.2,
                    color: globals.colors.foreground
                }}>
                Dados em JSON
            </Text>
            <TextInput
                value={events}
                editable={false}
                multiline={true}
                placeholder="Nenhum dado encontrado."
                placeholderTextColor={globals.colors.placeholder}
                style={{
                    backgroundColor: globals.colors.midground,
                    borderRadius: globals.app.width / 36.2,
                    padding: globals.app.width / 32,
                    color: globals.colors.tint,
                    textAlignVertical: "top",
                    flex: 1
                }}
            />
        </ScrollView>
    );
};

// Export the component.
export default DataScreen;
