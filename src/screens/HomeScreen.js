import { formatTime, formatDate, generateUniqueId } from "../utils/Functions";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { globals } from "../Globals";
import * as React from "react";
import {
    Alert,
    Image,
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import axios from "axios";

const styles = StyleSheet.create({
    default_text: {
        fontSize: globals.app.width / 20,
        color: globals.colors.tint
    }
})

const HomeScreen = () => {
    const [showTopButton, setShowTopButton] = React.useState(false);
    const [date, setDate] = React.useState(new Date());
    const [data, setData] = React.useState([]);

    const fetchHolidays = async () => {
        try {
            const year = date.getFullYear();
            const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
            return response.data;
        }
        catch (error) {
            console.error('Error occurred while fetching holidays:', error);
            return [];
        }
    };

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

        holidays.map((item, index) => {
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
    };

    React.useEffect(() => {
        fetchData();
        const interval = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const getHourColor = hour => {
        const dawnColor = "#fddbab";
        const morningColor = "#a8f0fe";
        const afternoonColor = "#f58784";
        const nightColor = "#5d58bc";

        if (hour < 0) hour += 24;
        if (hour > 23) hour -= 24;

        if (hour < 6) return dawnColor;
        else if (hour < 12) return morningColor;
        else if (hour < 18) return afternoonColor;
        else return nightColor;
    }

    const getColorPalette = hours => [
        getHourColor(hours + 2),
        getHourColor(hours + 1),
        getHourColor(hours),
        getHourColor(hours - 1),
        getHourColor(hours - 2),
    ]

    const gradientColors = getColorPalette(date.getHours());
    const FloatButton = ({ onPress, iconName, backgroundColor = globals.colors.foreground }) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={{
                    marginTop: globals.app.width / 42,
                    backgroundColor: backgroundColor,
                    borderRadius: globals.app.circle,
                    padding: globals.app.width / 40,
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 10
                }}>
                <Icon
                    size={globals.app.width / 13.2}
                    color={globals.colors.tint}
                    name={iconName}
                />
            </TouchableOpacity>
        );
    }

    const scrollToTop = () => flatlistRef.current.scrollToOffset({ offset: 0, animated: true });
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        setShowTopButton(contentOffset.y > 10);
    };

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
                                        return (
                                            <TouchableOpacity
                                                onPress={() => item.icon !== "Holiday" && Alert.alert(
                                                    item.name,
                                                    "Abrir evento no formulário."
                                                )}
                                                onLongPress={() => item.icon !== "Holiday" && Alert.alert(
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
                                                )}
                                                style={{
                                                    backgroundColor: globals.colors.midground,
                                                    borderRadius: globals.app.width / 32,
                                                    marginTop: globals.app.width / 42,
                                                    padding: globals.app.width / 42,
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    elevation: 2
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
                                            </TouchableOpacity>
                                        );
                                    }
                                }}
                            />
                        </View>
                    );
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
            />
            <View
                style={{
                    bottom: globals.app.width / 42,
                    right: globals.app.width / 42,
                    position: "absolute"
                }}>
                {showTopButton && (
                    <FloatButton
                        onPress={scrollToTop}
                        iconName="arrow-upward"
                        // backgroundColor="#ff7340"
                        backgroundColor="#2d84b3"
                    />
                )}
                <FloatButton
                    onPress={() => alert("remove")}
                    iconName="delete"
                    // backgroundColor="#ff9430"
                    backgroundColor="#2db3aa"
                />
                <FloatButton
                    onPress={() => alert("add")}
                    iconName="dashboard-customize"
                    // backgroundColor="#ffb300"
                    backgroundColor="#2db367"
                />
            </View>
        </View>
    )
};

export default HomeScreen;
