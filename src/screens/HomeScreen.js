// Import necessary modules and dependencies.
import { formatTime, formatDate, generateUniqueId } from "../utils/Functions";
import { getData, removeData, storeData } from "../utils/DataStorage";
import { navigateToScreen, replaceRoute } from "../utils/Navigation";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import fetchHolidays from "../services/HolidayService";
import RoundButton from "../components/RoundButton";
import { globals } from "../Globals";
import * as React from "react";
import {
    BackHandler,
    Clipboard,
    Alert,
    Image,
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";

const HomeScreen = ({ isMenuOpen, setIsMenuOpen, navigation }) => {
    const [showTopButton, setShowTopButton] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState([]);
    const [selectMode, setSelectMode] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [date, setDate] = React.useState(new Date());
    const [data, setData] = React.useState([]);

    // Fetches data by retrieving holidays and transforming it.
    const fetchData = async () => {
        const holidays = await fetchHolidays();
        const data = [];

        const events = await getData('events', true);
        const increaseYear = date => {
            const newDate = new Date(date);
            newDate.setFullYear(newDate.getFullYear() + 1);
            return newDate;
        };

        if (events && events.length > 0) events.forEach(item => {
            const newItem = {
                ...item,
                id: parseInt(item.id),
                startDate: new Date(item.startDate),
                endDate: new Date(item.endDate),
                annually: Boolean(item.annually),
                allDay: Boolean(item.allDay)
            };

            if (newItem.annually && newItem.endDate < date) {
                newItem.startDate = increaseYear(newItem.startDate);
                newItem.endDate = increaseYear(newItem.endDate);
            }

            data.push(newItem);
        });

        const formatDate = (date, start = true) => {
            const newDate = new Date(date);
            const day = newDate.getDate();
            const month = newDate.getMonth();
            const year = newDate.getFullYear();
            if (start) return new Date(year, month, day, 0, 0, 0);
            else return new Date(year, month, day, 23, 59, 59);
        }

        holidays.forEach(item => {
            const newItem = {
                id: generateUniqueId(data),
                name: item.name,
                address: "",
                startDate: formatDate(item.date),
                endDate: formatDate(item.date, false),
                annually: false,
                allDay: true,
                category: "Holiday",
                description: "Feriado nacional."
            };

            const future = newItem.startDate >= date;
            const present = newItem.endDate >= date;
            if (future || present) data.push(newItem);
        });

        const sortedData = [...data].sort((a, b) => a.startDate - b.startDate);
        const transformedData = sortedData.reduce((result, item) => {
            if (item.startDate <= date && date <= item.endDate) result[0].items.push(item);
            else if (item.startDate > date) result[1].items.push(item);
            else result[2].items.push(item);
            return result;
        }, [
            { category: "Acontecendo agora", show: true, items: [] },
            { category: "Acontecerá", show: true, items: [] },
            { category: "Aconteceu", show: false, items: [] },
        ]);
        setData(transformedData);
        setLoading(false);
    };

    // Define a function to handle when user press the return button.
    const handleBackPress = () => {
        if (selectMode) {
            setSelectMode(false);
            setSelectedItems([]);
            return true;
        }
        else if (isMenuOpen) {
            setIsMenuOpen(false);
            return true;
        }
        return false;
    };

    // Define a constructor to update the time in real-time and retrieve data.
    React.useEffect(() => {
        const unsubscribeBackPress = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        const unsubscribe = navigation.addListener('focus', fetchData);

        const updateDate = () => navigation.isFocused() && setDate(new Date());
        const interval = navigation.isFocused() && setInterval(updateDate, 1000);

        return () => {
            setLoading(true);
            clearInterval(interval);
            unsubscribeBackPress.remove();
            unsubscribe();
        };
    }, [isMenuOpen, selectMode]);

    // Returns the color based on the hour.
    const getHourColor = hour => {
        if (hour < 0) hour += 24;
        if (hour > 23) hour -= 24;

        if (hour <= 1) return "#353d85";
        else if (hour <= 3) return "#2a7b9b";
        else if (hour <= 5) return "#00baad";
        else if (hour <= 7) return "#eddd53";
        else if (hour <= 9) return "#ffc300";
        else if (hour <= 11) return "#ff8d1a";
        else if (hour <= 13) return "#ff5733";
        else if (hour <= 15) return "#c70039";
        else if (hour <= 17) return "#900c3f";
        else if (hour <= 19) return "#511849";
        else if (hour <= 21) return "#502c6b";
        else return "#443273";
    };

    // Returns an array of colors based on the given hours.
    const getColorPalette = hours => [
        getHourColor(hours + 1),
        getHourColor(hours),
        getHourColor(hours - 1)
    ];

    // Define a gradient of colors based on the current hour.
    const gradientColors = getColorPalette(date.getHours());

    // Scrolls the flatlist to the top and determines whether to show the top button.
    const scrollToTop = () => flatlistRef.current.scrollToOffset({ offset: 0, animated: true });
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        setShowTopButton(contentOffset.y >= 20);
    };

    const OptionLabel = ({ name, screen = "" }) => (
        <TouchableOpacity
            onPress={() => {
                setIsMenuOpen(false);
                if (screen.trim().length !== 0) setTimeout((() => navigateToScreen(navigation, screen)), 0);
            }}
            style={{
                paddingHorizontal: globals.app.width / 40,
                paddingVertical: globals.app.width / 36
            }}>
            <Text
                style={{
                    fontSize: globals.app.width / 22,
                }}>
                {name}
            </Text>
        </TouchableOpacity>
    )

    // Define a reference to the flatlist.
    const flatlistRef = React.useRef(null);
    return (
        <View style={{ flex: 1 }}>
            {isMenuOpen && (
                <>
                    <View
                        style={{
                            borderBottomLeftRadius: globals.app.width / 20,
                            backgroundColor: globals.colors.foreground,
                            minWidth: globals.app.width / 2.2,
                            position: "absolute",
                            elevation: 10,
                            zIndex: 10,
                            right: 0,
                            top: 0
                        }}>
                        <OptionLabel name="Novo evento" screen="FormScreen" />
                        <OptionLabel name="Backup" screen="DataScreen" />
                        <OptionLabel name="Sobre" screen="DetailsScreen" />
                    </View>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setIsMenuOpen(false)}
                        style={{
                            position: "absolute",
                            height: "100%",
                            width: "100%",
                            zIndex: 6
                        }}
                    />
                </>
            )}
            <FlatList
                data={data}
                ref={flatlistRef}
                onScroll={handleScroll}
                contentContainerStyle={{
                    padding: globals.app.width / 20,
                    flexGrow: 1
                }}
                ListHeaderComponent={() => (
                    <View
                        style={{
                            backgroundColor: globals.colors.midground,
                            borderRadius: globals.app.width / 32,
                            padding: globals.app.width / 42,
                            flexDirection: "row",
                            elevation: 10
                        }}>
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{
                                borderRadius: globals.app.width / 32,
                                padding: globals.app.width / 42,
                                flex: 0
                            }}
                        />
                        <View
                            style={{
                                padding: globals.app.width / 42,
                                justifyContent: "center",
                                alignItems: "center",
                                flex: 1
                            }}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.default_text,
                                    { fontSize: globals.app.width / 12 }
                                ]}>
                                {formatTime(date.getHours())}:{formatTime(date.getMinutes())}
                                <Text
                                    numberOfLines={1}
                                    style={styles.default_text}>
                                    :{formatTime(date.getSeconds())}
                                </Text>
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={styles.default_text}>
                                {formatDate(date)}
                            </Text>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => {
                    const showItems = item.show;
                    const category = item.category;
                    const handleShow = (category) => {
                        const updatedData = data.map(item => {
                            if (item.category === category) {
                                return { ...item, show: !showItems };
                            }
                            return item;
                        });

                        setData(updatedData);
                    };

                    if (item.items.length > 0) return (
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                onPress={() => handleShow(item.category)}
                                style={{
                                    backgroundColor: globals.colors.midground,
                                    borderRadius: globals.app.width / 32,
                                    marginTop: globals.app.width / 30,
                                    padding: globals.app.width / 42,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    elevation: 6
                                }}>
                                <Icon
                                    color={globals.colors.placeholder}
                                    size={globals.app.width / 18}
                                    stlye={{ flex: 0 }}
                                    name="loyalty"
                                />
                                <View
                                    style={{
                                        marginLeft: globals.app.width / 62,
                                        justifyContent: "space-between",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        flex: 1
                                    }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            color: globals.colors.placeholder,
                                            fontSize: globals.app.width / 17.2,
                                            fontWeight: "600"
                                        }}>
                                        {item.category}
                                    </Text>
                                    <Icon
                                        name={item.show ? "expand-more" : "expand-less"}
                                        color={globals.colors.placeholder}
                                        size={globals.app.width / 12}
                                    />
                                </View>
                            </TouchableOpacity>
                            <FlatList
                                data={item.items}
                                renderItem={({ item }) => {
                                    if (showItems) {
                                        const startTime = `${formatTime(item.startDate.getHours())}:${formatTime(item.startDate.getMinutes())}`;
                                        const endTime = `${formatTime(item.endDate.getHours())}:${formatTime(item.endDate.getMinutes())}`;

                                        const idSelected = selectedItems.some(id => id === item.id);
                                        const handleSelect = () => {
                                            const newSelected = [...selectedItems].filter(id => id !== item.id);
                                            if (!idSelected) newSelected.push(item.id);
                                            setSelectedItems(newSelected);
                                        }

                                        return (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (item.category !== "Holiday") {
                                                        if (selectMode) handleSelect();
                                                        else if (item.category !== "Holiday") navigateToScreen(navigation, "FormScreen", { id: item.id });
                                                    }
                                                }}
                                                onLongPress={() => !selectMode && item.category !== "Holiday" && Alert.alert(
                                                    item.name,
                                                    "Removê-lo ou copiar endereço?",
                                                    [
                                                        { text: "Voltar" },
                                                        {
                                                            text: "Copiar",
                                                            onPress: () => {
                                                                if (item.address.trim().length == 0) Alert.alert(item.name, "Nenhuma localidade incluída.");
                                                                else Clipboard.setString(item.address);
                                                            }
                                                        },
                                                        {
                                                            text: "Remover",
                                                            onPress: async () => {
                                                                const events = await getData("events", true);
                                                                if (events && events.length > 0) {
                                                                    const tempData = [...events].filter((event) => parseInt(event.id) !== item.id);
                                                                    if (tempData.length == 0) removeData("events");
                                                                    else storeData("events", tempData, true);
                                                                    replaceRoute(navigation, "HomeScreen");
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    { cancelable: true }
                                                )}
                                                style={{ flexDirection: "row", flex: 1 }}>
                                                {selectMode && item.category !== "Holiday" && (
                                                    <View
                                                        style={{
                                                            marginRight: globals.app.width / 42,
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            flex: 0
                                                        }}>
                                                        <Icon
                                                            name="check"
                                                            color={globals.colors.placeholder}
                                                            size={globals.app.width / 16}
                                                            style={{
                                                                backgroundColor: idSelected ? globals.colors.foreground : globals.colors.placeholder,
                                                                borderRadius: globals.app.width / 26,
                                                                padding: globals.app.width / 62,
                                                            }}
                                                        />
                                                    </View>
                                                )}
                                                <View
                                                    style={{
                                                        backgroundColor: globals.colors.midground,
                                                        borderRadius: globals.app.width / 32,
                                                        marginTop: globals.app.width / 42,
                                                        padding: globals.app.width / 42,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        elevation: 2,
                                                        flex: 1
                                                    }}>
                                                    <View
                                                        style={{
                                                            flexDirection: "row",
                                                            flex: 1
                                                        }}>
                                                        <View
                                                            style={{
                                                                borderColor: category === data[0].category ? "#7300ff" : category === data[1].category ? "#aa00ff" : "#ff00a2",
                                                                borderRadius: globals.app.width / 32,
                                                                borderWidth: globals.app.width / 200,
                                                                marginRight: globals.app.width / 36,
                                                                borderRadius: globals.app.circle,
                                                                justifyContent: "center",
                                                                borderStyle: "dotted",
                                                                alignItems: "center",
                                                                elevation: 2,
                                                                flex: 0
                                                            }}>
                                                            <Image
                                                                source={
                                                                    item.category === "Academic" ? require("../assets/Academic.png") :
                                                                        item.category === "Birthday" ? require("../assets/Birthday.png") :
                                                                            item.category === "Business" ? require("../assets/Business.png") :
                                                                                item.category === "Holiday" ? require("../assets/Holiday.png") :
                                                                                    item.category === "Medicine" ? require("../assets/Medicine.png") :
                                                                                        item.category === "Relationship" ? require("../assets/Relationship.png") :
                                                                                            require("../assets/Reminder.png")
                                                                }
                                                                style={{
                                                                    borderRadius: globals.app.circle,
                                                                    height: globals.app.width / 7.2,
                                                                    margin: globals.app.width / 106,
                                                                    width: globals.app.width / 7.2
                                                                }}
                                                            />
                                                        </View>
                                                        <View
                                                            style={{
                                                                justifyContent: "center",
                                                                flex: 1
                                                            }}>
                                                            <Text
                                                                numberOfLines={1}
                                                                style={{
                                                                    color: category === data[0].category ? "#7300ff" : category === data[1].category ? "#aa00ff" : "#ff00a2",
                                                                    fontSize: globals.app.width / 22
                                                                }}>
                                                                {item.name}
                                                            </Text>
                                                            <Text
                                                                numberOfLines={1}
                                                                style={{
                                                                    fontSize: globals.app.width / 28,
                                                                    color: globals.colors.tint,

                                                                }}>
                                                                {formatDate(item.startDate, false)}
                                                            </Text>
                                                            <Text
                                                                numberOfLines={1}
                                                                style={{
                                                                    fontSize: globals.app.width / 28,
                                                                    color: globals.colors.placeholder
                                                                }}>
                                                                {startTime} - {endTime}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={{
                                                            marginTop: globals.app.width / 42,
                                                            alignSelf: "flex-start",
                                                            width: "100%"
                                                        }}>
                                                        <Text
                                                            numberOfLines={1}
                                                            style={{
                                                                fontSize: globals.app.width / 26.72,
                                                                color: globals.colors.foreground,
                                                                flex: 1
                                                            }}>
                                                            {item.address.trim().length > 0 ? item.address : "Nenhuma localidade incluída."}
                                                        </Text>
                                                        <Text
                                                            numberOfLines={3}
                                                            style={{
                                                                color: globals.colors.placeholder,
                                                                fontSize: globals.app.width / 28,
                                                                textAlign: "justify"
                                                            }}>
                                                            {item.description.trim().length > 0 ? item.description : "Nenhuma descrição incluída."}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }
                                }}
                            />
                        </View>
                    );
                }}
                ListFooterComponent={() => {
                    if (loading) return (
                        <View
                            style={{
                                marginTop: globals.app.width / 30,
                                justifyContent: "center",
                                alignItems: "center",
                                flex: 1
                            }}>
                            <ActivityIndicator
                                color={globals.colors.foreground}
                                size="large"
                            />
                        </View>
                    );
                }}
            />
            <View
                style={{
                    bottom: globals.app.width / 42,
                    right: globals.app.width / 42,
                    position: "absolute"
                }}>
                {showTopButton && (
                    <RoundButton
                        iconName="arrow-upward"
                        backgroundColor="#2d84b3"
                        onPress={scrollToTop}
                    />
                )}
                <RoundButton
                    iconName={selectMode ? "close" : "delete"}
                    backgroundColor={selectMode ? "#652db3" : "#2db3aa"}
                    onPress={() => {
                        if (selectMode) {
                            setSelectMode(false);
                            setSelectedItems([]);
                        }
                        else setSelectMode(true);
                    }}
                />
                <RoundButton
                    iconName={selectMode ? "delete-sweep" : "dashboard-customize"}
                    backgroundColor={selectMode ? "#b32d2d" : "#2db367"}
                    onPress={() => {
                        if (selectMode) {
                            if (selectedItems.length > 0) {
                                Alert.alert(
                                    "Remover selecionados",
                                    "Você tem certeza disso?",
                                    [
                                        { text: "Cancelar" },
                                        {
                                            text: "Confirmar",
                                            onPress: async () => {
                                                const events = await getData("events", true);
                                                if (events && events.length > 0) {
                                                    const tempData = [...events].filter((event) => !selectedItems.includes(parseInt(event.id)));
                                                    if (tempData.length == 0) removeData("events");
                                                    else storeData("events", tempData, true);
                                                    replaceRoute(navigation, "HomeScreen");
                                                }
                                                setSelectedItems([]);
                                                setSelectMode(false);
                                            }
                                        }
                                    ],
                                    { cancelable: true }
                                )
                            }
                            else setSelectMode(false);
                        }
                        else navigateToScreen(navigation, "FormScreen");
                    }}
                />
            </View>
        </View >
    )
};

export default HomeScreen;
const styles = StyleSheet.create({
    default_text: {
        fontSize: globals.app.width / 20,
        color: globals.colors.tint
    }
});
