import { formatTime, formatDate, generateUniqueId } from "../utils/Functions";
import Icon from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { globals } from "../Globals";
import * as React from "react";
import {
    Image,
    View,
    Text,
    FlatList,
    TouchableOpacity
} from "react-native";
import axios from "axios";

const HomeScreen = () => {
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

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
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
                                    justifyContent: "space-between",
                                    padding: globals.app.width / 42,
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: globals.app.width / 16,
                                        color: globals.colors.placeholder
                                    }}>
                                    {item.category}
                                </Text>
                                <Icon
                                    color={globals.colors.placeholder}
                                    size={globals.app.width / 12}
                                    name={item.show ? "expand-more" : "expand-less"}
                                />
                            </TouchableOpacity>
                            <FlatList
                                data={item.items}
                                renderItem={({ item }) => {
                                    if (showItems) {
                                        const startTime = `${formatTime(item.startDate.getHours())}:${formatTime(item.startDate.getMinutes())}`;
                                        const endTime = `${formatTime(item.endDate.getHours())}:${formatTime(item.endDate.getMinutes())}`;
                                        return (
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: globals.colors.midground,
                                                    borderRadius: globals.app.width / 32,
                                                    marginTop: globals.app.width / 42,
                                                    padding: globals.app.width / 42,
                                                    flexDirection: "row",
                                                    alignItems: "center"
                                                }}>
                                                <View
                                                    style={{
                                                        backgroundColor: globals.colors.foreground,
                                                        borderRadius: globals.app.width / 32,
                                                        marginRight: globals.app.width / 42,
                                                        borderRadius: globals.app.circle,
                                                        height: globals.app.width / 6,
                                                        width: globals.app.width / 6,
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
                                                            fontSize: globals.app.width / 22,
                                                            color: category === data[0].category ? "#7300ff" : category === data[1].category ? "#aa00ff" : "#ff00a2"
                                                        }}>
                                                        {item.name}
                                                    </Text>
                                                    <Text
                                                        numberOfLines={1}
                                                        style={{
                                                            fontSize: globals.app.width / 28,
                                                            color: globals.colors.placeholder
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
                                                            fontSize: globals.app.width / 26,
                                                            color: globals.colors.placeholder,
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
                            flexDirection: "row"
                        }}>
                        <LinearGradient
                            colors={globals.colors.gradient}
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
                                style={{
                                    fontSize: globals.app.width / 12,
                                    color: globals.colors.tint
                                }}>
                                {formatTime(date.getHours())}:{formatTime(date.getMinutes())}
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: globals.app.width / 20,
                                        color: globals.colors.tint
                                    }}>
                                    :{formatTime(date.getSeconds())}
                                </Text>
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: globals.app.width / 20,
                                    color: globals.colors.tint
                                }}>
                                {formatDate(date)}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </View>
    )
};

export default HomeScreen;
