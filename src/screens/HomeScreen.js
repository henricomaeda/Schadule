// Import necessary modules and dependencies.
import { setupNotifications, scheduleNotification } from "../utils/Notification";
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
    ScrollView,
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
    const [showHolidays, setShowHolidays] = React.useState(false);
    const [showCategories, setShowCategories] = React.useState(true);
    const [failed, setFailed] = React.useState(false);
    const [showPresent, setShowPresent] = React.useState(true);
    const [showFuture, setShowFuture] = React.useState(true);
    const [showLimite, setShowLimite] = React.useState(true);
    const [showPast, setShowPast] = React.useState(false);

    // Fetches data by retrieving holidays and transforming it.
    const fetchData = async () => {
        try {
            const data = [];
            const increaseYear = date => {
                const newDate = new Date(date);
                newDate.setFullYear(newDate.getFullYear() + 1);
                return newDate;
            };

            setupNotifications();
            const tempEvents = await getData("events", true);
            if (tempEvents && tempEvents.length > 0) tempEvents.forEach(item => {
                const newItem = {
                    ...item,
                    id: parseInt(item.id),
                    startDate: new Date(item.startDate),
                    endDate: new Date(item.endDate),
                    limiteDate: new Date(item.limiteDate),
                    annually: Boolean(item.annually),
                    allDay: Boolean(item.allDay),
                    notify: Boolean(item.notify)
                };

                // Verify if is annually and is past.
                if (newItem.annually && newItem.endDate < date) {
                    newItem.startDate = increaseYear(newItem.startDate);
                    newItem.endDate = increaseYear(newItem.endDate);
                };

                const now = new Date();
                const newDate = new Date(newItem.startDate);

                now.setMilliseconds(0);
                newDate.setMilliseconds(0);

                // Schedule this event and notify the user if do.
                if (newItem.notify && newDate > now) {
                    scheduleNotification(newItem.name.trim(), newItem.category.trim(), newItem.startDate);

                    now.setSeconds(0);
                    newDate.setSeconds(0);
                    newDate.setMinutes(newDate.getMinutes() - 10);

                    // If the event is teen minutes later than now, notify before.
                    const isTeenMinutesLater = newDate > now;
                    if (isTeenMinutesLater) scheduleNotification(newItem.name.trim(), newItem.category.trim(), newDate, true);
                };

                data.push(newItem);
            });

            const formatDate = (date, start = true) => {
                const newDate = new Date(date);
                const day = newDate.getDate();
                const month = newDate.getMonth();
                const year = newDate.getFullYear();
                if (start) return new Date(year, month, day, 0, 0, 0);
                else return new Date(year, month, day, 23, 59, 59);
            };

            const tempHolidays = await fetchHolidays();
            if (tempHolidays && tempHolidays.length > 0) tempHolidays.forEach(item => {
                const newItem = {
                    id: generateUniqueId(data),
                    name: item.name,
                    address: "",
                    startDate: formatDate(item.date),
                    endDate: formatDate(item.date, false),
                    annually: false,
                    allDay: true,
                    notify: false,
                    category: "Holiday",
                    description: "Feriado nacional."
                };

                const future = newItem.startDate >= date;
                const present = newItem.endDate >= date;
                if (future || present) data.push(newItem);
            });

            const sortedData = [...data].sort((a, b) => a.startDate - b.startDate);
            const transformedData = [...sortedData].reduce((result, item) => {
                if (item.category == "Photography" && ["Finished", "Canceled"].includes(item.status)) result[3].items.push(item);
                else if (item.startDate <= date && date <= item.endDate) result[0].items.push(item);
                else if (item.startDate > date) result[1].items.push(item);
                else if (item.category == "Photography") result[2].items.push(item);
                else result[3].items.push(item);
                return result;
            }, [
                { category: "Acontecendo agora", items: [] },
                { category: "Acontecerá", items: [] },
                { category: "Prazo", items: [] },
                { category: "Aconteceu", items: [] }
            ]);
            setData([...transformedData]);
            setLoading(false);
        }
        catch (error) {
            console.error("Error while loading:", error);
            setFailed(true);
        }
    };

    // Define a function to handle when user press the return button.
    const handleBackPress = () => {
        if (selectMode && navigation.isFocused()) {
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
        const unsubscribeBackPress = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
        const unsubscribeFocus = navigation.addListener("focus", fetchData);

        const updateDate = () => navigation.isFocused() && setDate(new Date());
        const interval = navigation.isFocused() && setInterval(updateDate, 1000);

        return () => {
            clearInterval(interval);
            unsubscribeBackPress.remove();
            unsubscribeFocus();
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
                    color: globals.colors.tint
                }}>
                {name}
            </Text>
        </TouchableOpacity>
    );

    const CustomFilter = ({ name, value, setValue }) => (
        <TouchableOpacity
            onPress={() => {
                if (selectMode) return;
                setValue(!value);
            }}
            style={{
                backgroundColor: globals.colors.midground,
                borderRadius: globals.app.width / 36,
                marginTop: globals.app.width / 32,
                flexDirection: "row",
                alignItems: "center",
                overflow: "hidden",
                elevation: 10
            }}>
            <View
                style={{
                    backgroundColor: globals.colors.tint,
                    borderRadius: globals.app.width / 36,
                }}>
                <Icon
                    color={selectMode || !value ? globals.colors.placeholder : globals.colors.background}
                    name={selectMode || !value ? "visibility-off" : "visibility"}
                    style={{ padding: globals.app.width / 82 }}
                    size={globals.app.width / 14.2}
                />
            </View>
            <Text
                numberOfLines={1}
                style={[
                    styles.default_text,
                    {
                        paddingHorizontal: globals.app.width / 26,
                        fontSize: globals.app.width / 26
                    }
                ]}>
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
                        <OptionLabel name="Dados" screen="DataScreen" />
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
            {failed ? (
                <ScrollView
                    contentContainerStyle={{
                        margin: globals.app.width / 16,
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1
                    }}>
                    <TouchableOpacity
                        onPress={() => replaceRoute(navigation, "HomeScreen")}
                        style={{
                            backgroundColor: globals.colors.midground,
                            borderRadius: globals.app.width / 32,
                            padding: globals.app.width / 20,
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            elevation: 10
                        }}>
                        <Icon
                            size={globals.app.width / 6}
                            color="#e6476f"
                            name="warning"
                        />
                        <Text
                            style={{
                                marginVertical: globals.app.width / 30,
                                fontSize: globals.app.width / 16,
                                textAlign: "center",
                                fontWeight: "bold",
                                color: "#e6476f"
                            }}>
                            Falha de gerenciamento
                        </Text>
                        <Text
                            style={{
                                lineHeight: globals.app.width / 16.2,
                                fontSize: globals.app.width / 20,
                                textAlign: "justify",
                                color: "#e6476f"
                            }}>
                            Desculpe, mas encontramos um problema ao tentar gerenciar, carregar ou agendar os eventos. Aperte para tentar recarregar ou entre em contato com o desenvolvedor para obter mais assistência.
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <>
                    {selectMode && (
                        <View
                            style={{
                                borderBottomRightRadius: globals.app.width / 46.2,
                                borderBottomLeftRadius: globals.app.width / 46.2,
                                padding: globals.app.width / 46,
                                backgroundColor: "#b3552d",
                                width: "100%"
                            }}>
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: globals.app.width / 24.2,
                                    color: globals.colors.tint,
                                    textAlign: "center"
                                }}>
                                {selectedItems.length} {selectedItems.length == 1 ? "evento selecionado" : "eventos selecionados"}
                            </Text>
                        </View>
                    )}
                    <FlatList
                        data={data}
                        ref={flatlistRef}
                        onScroll={handleScroll}
                        contentContainerStyle={{
                            padding: globals.app.width / 22.6,
                            flexGrow: 1
                        }}
                        ListHeaderComponent={() => (
                            <>
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
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <CustomFilter
                                        name="Categorias"
                                        value={showCategories}
                                        setValue={setShowCategories}
                                    />
                                    <CustomFilter
                                        name="Feriados nacionais"
                                        value={showHolidays}
                                        setValue={setShowHolidays}
                                    />
                                </View>
                            </>
                        )}
                        renderItem={({ item }) => {
                            const category = item.category;
                            const getShowItems = () => {
                                if (category === "Acontecendo agora") return showPresent;
                                else if (category === "Acontecerá") return showFuture;
                                else if (category === "Prazo") return showLimite;
                                return showPast;
                            }

                            let length = 0;
                            if (!showHolidays || selectMode) length = item.items.filter(item => item.category !== "Holiday").length;
                            else length = item.items.length;
                            
                            const sortedItems = category == "Prazo" ? item.items.sort((a, b) => new Date(a.limiteDate) - new Date(b.limiteDate)) : item.items;
                            if (length > 0) return (
                                <View style={{ flex: 1 }}>
                                    {(showCategories && !selectMode) && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (category === "Acontecendo agora") setShowPresent(!showPresent);
                                                else if (category === "Acontecerá") setShowFuture(!showFuture);
                                                else if (category === "Prazo") setShowLimite(!showLimite);
                                                else setShowPast(!showPast);
                                            }}
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
                                    )}
                                    <FlatList
                                        data={sortedItems}
                                        renderItem={({ item }) => {
                                            if (!selectMode && !getShowItems() && showCategories) return;
                                            if (selectMode && item.category === "Holiday") return;
                                            if (!showHolidays && item.category === "Holiday") return;
                                            const startTime = `${formatTime(item.startDate.getHours())}:${formatTime(item.startDate.getMinutes())}`;
                                            const endTime = `${formatTime(item.endDate.getHours())}:${formatTime(item.endDate.getMinutes())}`;

                                            const idSelected = selectedItems.some(id => id === item.id);
                                            const handleSelect = () => {
                                                const newSelected = [...selectedItems].filter(id => id !== item.id);
                                                if (!idSelected) newSelected.push(item.id);
                                                setSelectedItems(newSelected);
                                            };

                                            return (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (item.category !== "Holiday") {
                                                            if (selectMode) handleSelect();
                                                            else if (item.category !== "Holiday" && navigation.isFocused()) navigateToScreen(navigation, "FormScreen", { id: item.id });
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
                                                                        fetchData();
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
                                                                    alignSelf: "center",
                                                                    elevation: 2,
                                                                    flex: 0
                                                                }}>
                                                                <Image
                                                                    source={
                                                                        item.category === "Photography" ? require("../assets/Photography.png") :
                                                                            item.category === "Academic" ? require("../assets/Academic.png") :
                                                                                item.category === "Birthday" ? require("../assets/Birthday.png") :
                                                                                    item.category === "Business" ? require("../assets/Business.png") :
                                                                                        item.category === "Holiday" ? require("../assets/Holiday.png") :
                                                                                            item.category === "Medicine" ? require("../assets/Medicine.png") :
                                                                                                item.category === "Relationship" ? require("../assets/Relationship.png") :
                                                                                                    require("../assets/Reminder.png")
                                                                    }
                                                                    style={{
                                                                        margin: selectMode ? globals.app.width / 80 : globals.app.width / 86.2,
                                                                        height: selectMode ? globals.app.width / 10 : globals.app.width / 7.2,
                                                                        width: selectMode ? globals.app.width / 10 : globals.app.width / 7.2,
                                                                        borderRadius: globals.app.circle
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
                                                                        fontSize: selectMode ? globals.app.width / 26 : globals.app.width / 22
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
                                                        {!selectMode && (
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
                                                                {item.category == "Photography" && (
                                                                    <View style={{ flexDirection: "row" }}>
                                                                        <Text
                                                                            numberOfLines={1}
                                                                            style={{
                                                                                fontSize: globals.app.width / 28,
                                                                                color: "#2db3a8",
                                                                                flex: 0
                                                                            }}>
                                                                            Prazo:
                                                                        </Text>
                                                                        <Text
                                                                            numberOfLines={1}
                                                                            style={{
                                                                                marginHorizontal: globals.app.width / 60,
                                                                                fontSize: globals.app.width / 28,
                                                                                color: globals.colors.tint,
                                                                                flex: 0
                                                                            }}>
                                                                            {formatDate(item.limiteDate, true)}
                                                                        </Text>
                                                                        <Text
                                                                            numberOfLines={1}
                                                                            style={{
                                                                                color: globals.colors.placeholder,
                                                                                fontSize: globals.app.width / 28,
                                                                                flex: 1
                                                                            }}>
                                                                            [{globals.status.find(status => status.value === item.status)?.label || "Não definido"}]
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
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
                                backgroundColor={selectMode ? "#b32d48" : "#2d2db3"}
                                onPress={scrollToTop}
                            />
                        )}
                        {!selectMode && (
                            <RoundButton
                                iconName="delete-sweep"
                                backgroundColor="#2d60b3"
                                onPress={() => {
                                    const CustomAlert = (message, buttons, options) => {
                                        Alert.alert(
                                            "Remover rapidamente",
                                            message,
                                            buttons,
                                            options
                                        );
                                    };

                                    CustomAlert(
                                        "Feriados nacionais não inclusos.\nQuais eventos deseja remover?",
                                        [
                                            { text: "Nenhum" },
                                            {
                                                text: "Passados",
                                                onPress: async () => {
                                                    const events = await getData("events", true);
                                                    if (events && events.length > 0) {
                                                        let tempData = [...events].filter((event) => new Date(event.endDate) < date);
                                                        if (tempData && tempData.length > 0) {
                                                            tempData = [...events].filter((event) => new Date(event.endDate) >= date);
                                                            if (tempData.length == 0) removeData("events");
                                                            else storeData("events", tempData, true);
                                                            fetchData();
                                                        }
                                                        else CustomAlert("Não há eventos para se remover.");
                                                    }
                                                    else CustomAlert("Não há eventos para se remover.");
                                                }
                                            },
                                            {
                                                text: "Todos",
                                                onPress: async () => {
                                                    const events = await getData("events", true);
                                                    if (events && events.length > 0) {
                                                        removeData("events");
                                                        fetchData();
                                                    }
                                                    else CustomAlert("Não há eventos para se remover.");
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    );
                                }}
                            />
                        )}
                        {selectMode ? (
                            <RoundButton
                                iconName={"delete-forever"}
                                backgroundColor={"#b3552d"}
                                onPress={() => {
                                    if (selectedItems.length > 0) Alert.alert(
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
                                                        fetchData();
                                                    }
                                                    setSelectedItems([]);
                                                    setSelectMode(false);
                                                }
                                            }
                                        ],
                                        { cancelable: true }
                                    );
                                    else {
                                        setSelectMode(false);
                                        setSelectedItems([]);
                                    };
                                }}
                            />
                        ) : (
                            <RoundButton
                                iconName={"delete"}
                                backgroundColor={"#2db3aa"}
                                onPress={() => setSelectMode(true)}
                            />
                        )}
                        <RoundButton
                            iconName={selectMode ? "clear" : "dashboard-customize"}
                            backgroundColor={selectMode ? "#b3772d" : "#2db367"}
                            onPress={() => {
                                if (selectMode) {
                                    setSelectMode(false);
                                    setSelectedItems([]);
                                }
                                else if (navigation.isFocused()) navigateToScreen(navigation, "FormScreen");
                            }}
                        />
                    </View>
                </>
            )}
        </View>
    )
};

export default HomeScreen;
const styles = StyleSheet.create({
    default_text: {
        fontSize: globals.app.width / 20,
        color: globals.colors.tint
    }
});
