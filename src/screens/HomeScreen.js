// Import necessary modules and dependencies.
import { formatTime, formatDate, generateUniqueId } from "../utils/Functions";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import RoundButton from "../components/RoundButton";
import { globals } from "../Globals";
import * as React from "react";
import {
    Alert,
    Image,
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import fetchHolidays from "../services/HolidayService";
import { navigateToScreen } from "../utils/Navigation";

const HomeScreen = ({ navigation }) => {
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

        const formatDate = (date, start = true) => {
            const newDate = new Date(date);
            const day = newDate.getDate();
            const month = newDate.getMonth();
            const year = newDate.getFullYear();
            if (start) return new Date(year, month, day, 0, 0, 0);
            else return new Date(year, month, day, 23, 59, 59);
        }

        holidays.map((item) => {
            data.push({
                id: generateUniqueId(data),
                name: item.name,
                icon: "Holiday",
                description: "Feriado nacional.",
                startDate: formatDate(item.date),
                endDate: formatDate(item.date, false)
            })
        });

        const sortedData = [...data].sort((a, b) => a.date - b.date);
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

    // Define a constructor to update the time in real-time and retrieve data.
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchData);
        const interval = setInterval(() => setDate(new Date()), 1000);
        return () => {
            unsubscribe;
            setLoading(true);
            clearInterval(interval);
        };
    }, []);

    // Returns the color based on the hour.
    const getHourColor = hour => {
        if (hour < 0) hour += 24;
        if (hour > 23) hour -= 24;

        if (hour == 0) return "#899aa1";
        else if (hour < 5) return "#6a6c7a";
        else if (hour < 10) return "#faf5c8";
        else if (hour < 13) return "#fad889";
        else if (hour < 17) return "#fbbe9a";
        else if (hour < 20) return "#bda2a2";
        else return "#899aa1"
    };

    // Returns an array of colors based on the given hours.
    const getColorPalette = hours => [
        getHourColor(hours + 2),
        getHourColor(hours + 1),
        getHourColor(hours),
        getHourColor(hours - 1),
        getHourColor(hours - 2)
    ];

    // Define a gradient of colors based on the current hour.
    const gradientColors = getColorPalette(date.getHours());

    // Scrolls the flatlist to the top and determines whether to show the top button.
    const scrollToTop = () => flatlistRef.current.scrollToOffset({ offset: 0, animated: true });
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        setShowTopButton(contentOffset.y >= 20);
    };

    // Define a reference to the flatlist.
    const flatlistRef = React.useRef(null);
    return (
        <View style={{ flex: 1 }}>
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
                                                    if (item.icon !== "Holiday") {
                                                        if (selectMode) handleSelect();
                                                        else if (item.icon !== "Holiday") Alert.alert(
                                                            item.name,
                                                            "Abrir evento no formulário."
                                                        )
                                                    }
                                                }}
                                                onLongPress={() => {
                                                    if (!selectMode && item.icon !== "Holiday") Alert.alert(
                                                        item.name,
                                                        "Remover ou alterar este evento?",
                                                        [
                                                            { text: "Voltar" },
                                                            {
                                                                text: "Alterar",
                                                                onPress: () => Alert.alert(
                                                                    item.name,
                                                                    "Abrir evento no formulário."
                                                                )
                                                            },
                                                            {
                                                                text: "Remover",
                                                                onPress: () => Alert.alert(
                                                                    item.name,
                                                                    "Remover evento dos dados."
                                                                )
                                                            }
                                                        ],
                                                        { cancelable: true }
                                                    )
                                                }}
                                                style={{ flexDirection: "row", flex: 1 }}>
                                                {selectMode && item.icon !== "Holiday" && (
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
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        elevation: 2,
                                                        flex: 1
                                                    }}>
                                                    <View
                                                        style={{
                                                            backgroundColor: globals.colors.foreground,
                                                            borderRadius: globals.app.width / 32,
                                                            marginRight: globals.app.width / 36,
                                                            borderRadius: globals.app.circle,
                                                            height: globals.app.width / 6.2,
                                                            width: globals.app.width / 6.2,
                                                            elevation: 2
                                                        }}>
                                                        <Image
                                                            source={item.icon === "Holiday" ? require("../assets/Holiday.png") : null}
                                                            style={{ height: "100%", width: "100%" }}
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
                                                        <Text
                                                            style={{
                                                                marginTop: globals.app.width / 22,
                                                                color: globals.colors.placeholder,
                                                                fontSize: globals.app.width / 26,
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
                    backgroundColor="#2db3aa"
                    onPress={() => {
                        if (selectMode) {
                            setSelectMode(false);
                            setSelectedItems([]);
                        }
                        else setSelectMode(true);
                    }}
                />
                <RoundButton
                    iconName={selectMode ? "check" : "dashboard-customize"}
                    backgroundColor="#2db367"
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
                                            onPress: () => Alert.alert("Remover selecionados", "Removendo selecionados...")
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
})
