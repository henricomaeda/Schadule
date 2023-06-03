// Import necessary modules and dependencies.
import { formatTime, formatDate, generateUniqueId } from "../utils/Functions";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import DropDownPicker from "react-native-dropdown-picker";
import { getData, storeData } from "../utils/DataStorage";
import { navigateToHome } from "../utils/Navigation";
import RoundButton from "../components/RoundButton";
import { globals } from "../Globals";
import * as React from "react";
import {
    ScrollView,
    StyleSheet,
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

const FormScreen = ({ navigation, route }) => {
    const id = route.params ? JSON.parse(route.params).id : -1;
    const [name, setName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [startDate, setStartDate] = React.useState(new Date());
    const [endDate, setEndDate] = React.useState(new Date());
    const [annually, setAnnually] = React.useState(false);
    const [allDay, setAllDay] = React.useState(false);
    const [notify, setNotify] = React.useState(true);
    const [category, setCategory] = React.useState("Reminder");
    const [description, setDescription] = React.useState("");
    const [required, setRequired] = React.useState(false);
    const [showTopButton, setShowTopButton] = React.useState(false);
    const [events, setEvents] = React.useState([]);

    // Define an constructor to fetch data.
    React.useEffect(() => {
        const fetchData = async () => {
            const events = await getData("events", true);
            if (events && events.length > 0) {
                setEvents(events);
                if (id !== -1) {
                    const event = events.find(item => item.id === id);
                    setName(event.name);
                    setAddress(event.address);
                    setStartDate(new Date(event.startDate));
                    setEndDate(new Date(event.endDate));
                    setAnnually(Boolean(event.annually));
                    setAllDay(Boolean(event.allDay));
                    setCategory(event.category);
                    setDescription(event.description);
                }
            }
        }

        fetchData();
    }, [id]);

    const [open, setOpen] = React.useState(false);
    const [categories, setCategories] = React.useState([
        { label: "Lembrete", value: "Reminder" },
        { label: "Aniversário", value: "Birthday" },
        { label: "Trabalho", value: "Business" },
        { label: "Acadêmico", value: "Academic" },
        { label: "Relacionamento", value: "Relationship" },
        { label: "Medicina", value: "Medicine" }
    ]);

    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const handleDateChange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const newStartDate = new Date(year, month, day, startDate.getHours(), startDate.getMinutes());
        const newEndDate = new Date(year, month, day, endDate.getHours(), endDate.getMinutes())
        setShowDatePicker(false);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const [showStartTimePicker, setShowStartTimePicker] = React.useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);
    const handleTimeChange = (date, start = true) => {
        if (start) {
            setShowStartTimePicker(false);
            setStartDate(date);
            if (date >= endDate) setEndDate(date);
        }
        else {
            setShowEndTimePicker(false);
            if (date >= startDate) setEndDate(date);
            else setEndDate(startDate);
        }
    };

    const CustomTextInput = (value, setValue, label, placeholder, multiline = false, inputRequired = false) => (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
            </Text>
            <TextInput
                value={value}
                multiline={multiline}
                onChangeText={setValue}
                numberOfLines={multiline ? 6 : 1}
                onBlur={() => onBlurInput(setValue)}
                onFocus={() => inputRequired && setRequired(false)}
                placeholderTextColor={globals.colors.placeholder}
                placeholder={placeholder}
                style={{
                    textAlignVertical: multiline ? "top" : "center",
                    backgroundColor: globals.colors.midground,
                    borderRadius: globals.app.width / 42,
                    fontSize: globals.app.width / 26,
                    padding: globals.app.width / 42,
                    color: globals.colors.tint,
                    elevation: 2
                }}
            />
            {inputRequired && required && (
                <Text
                    style={[
                        styles.label,
                        {
                            fontSize: globals.app.width / 24.2,
                            marginTop: globals.app.width / 92,
                            color: "#eb1c57"
                        }
                    ]}>
                    Preencha este campo de nome obrigatório!
                </Text>
            )}
        </View>
    );

    const CustomTouchableOpacity = (label, value, backgroundColor) => (
        <TouchableOpacity
            onPress={() => {
                setCategory(value);
                setOpen(false);
            }}
            style={{
                paddingHorizontal: globals.app.width / 24.6,
                paddingVertical: globals.app.width / 62,
                borderRadius: globals.app.width / 32,
                backgroundColor: backgroundColor
            }}>
            <Text
                style={{
                    fontSize: globals.app.width / 26,
                    color: globals.colors.tint
                }}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const CheckBox = (name, value, onPress) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                marginTop: globals.app.width / 62,
                flexDirection: "row",
                alignItems: "center"
            }}>
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
                        backgroundColor: value ? globals.colors.foreground : globals.colors.placeholder,
                        borderRadius: globals.app.circle,
                        padding: globals.app.width / 92,
                    }}
                />
            </View>
            <Text style={styles.timeInput}>
                {name}
            </Text>
        </TouchableOpacity>
    );

    // Scrolls the flatlist to the top and determines whether to show the top button.
    const scrollToTop = () => scrollViewRef.current.scrollTo({ y: 0, animated: true });
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        setShowTopButton(contentOffset.y >= 12);
    };

    // Define a reference to the flatlist.
    const scrollViewRef = React.useRef(null);
    const saveEvent = () => {
        try {
            if (id === -1) events.push({
                id: generateUniqueId(events),
                name: name.trim(),
                address: address.trim(),
                startDate: startDate,
                endDate: endDate,
                annually: annually,
                allDay: allDay,
                notify: notify,
                category: category.trim(),
                description: description.trim()
            });
            else {
                const eventIndex = events.findIndex(event => event.id === id);
                events[eventIndex].name = name.trim();
                events[eventIndex].address = address.trim();
                events[eventIndex].startDate = startDate;
                events[eventIndex].endDate = endDate;
                events[eventIndex].annually = annually;
                events[eventIndex].allDay = allDay;
                events[eventIndex].notify = notify;
                events[eventIndex].category = category.trim();
                events[eventIndex].description = description.trim();
            };

            storeData("events", events, true);
            navigateToHome(navigation);
        }
        catch (error) {
            console.error("Error while saving data:", error);
        }
    }

    const onBlurInput = setValue => setValue(previousValue => previousValue.trim());
    return (
        <View style={{ flex: 1 }} onTouchEnd={open ? () => setOpen(false) : null}>
            <ScrollView
                ref={scrollViewRef}
                onScroll={handleScroll}
                removeClippedSubviews={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, margin: globals.app.width / 26 }}>
                    {showDatePicker && (
                        <DateTimePicker
                            mode="date"
                            value={startDate}
                            themeVariant="dark"
                            onChange={(event, date) => handleDateChange(date)}
                        />
                    )}
                    {showStartTimePicker && (
                        <DateTimePicker
                            mode="time"
                            is24Hour={true}
                            value={startDate}
                            themeVariant="dark"
                            onChange={(event, date) => handleTimeChange(date)}
                        />
                    )}
                    {showEndTimePicker && (
                        <DateTimePicker
                            mode="time"
                            is24Hour={true}
                            value={endDate}
                            themeVariant="dark"
                            onChange={(event, date) => handleTimeChange(date, false)}
                        />
                    )}
                    <Text
                        numberOfLines={1}
                        style={styles.label}>
                        Pré-visualização
                    </Text>
                    <View
                        style={{
                            backgroundColor: globals.colors.midground,
                            marginBottom: globals.app.width / 26,
                            borderRadius: globals.app.width / 32,
                            padding: globals.app.width / 42,
                            justifyContent: "center",
                            alignItems: "center",
                            elevation: 6,
                            flex: 1
                        }}>
                        <View style={{ flexDirection: "row", flex: 1 }}>
                            <View
                                style={{
                                    borderRadius: globals.app.width / 32,
                                    borderWidth: globals.app.width / 200,
                                    marginRight: globals.app.width / 36,
                                    borderRadius: globals.app.circle,
                                    justifyContent: "center",
                                    borderColor: "#2db3a8",
                                    borderStyle: "dotted",
                                    alignItems: "center",
                                    elevation: 2,
                                    flex: 0
                                }}>
                                <Image
                                    source={
                                        category === "Academic" ? require("../assets/Academic.png") :
                                            category === "Birthday" ? require("../assets/Birthday.png") :
                                                category === "Business" ? require("../assets/Business.png") :
                                                    category === "Medicine" ? require("../assets/Medicine.png") :
                                                        category === "Relationship" ? require("../assets/Relationship.png") :
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
                                        fontSize: globals.app.width / 22,
                                        color: "#2db3a8"
                                    }}>
                                    {name.trim().length > 0 ? name.trim() : "Nome do evento"}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: globals.app.width / 28,
                                        color: globals.colors.tint,

                                    }}>
                                    {formatDate(startDate, false)}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: globals.app.width / 28,
                                        color: globals.colors.placeholder
                                    }}>
                                    {`${formatTime(startDate.getHours())}:${formatTime(startDate.getMinutes())} - ${formatTime(endDate.getHours())}:${formatTime(endDate.getMinutes())}`}
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
                                {address.trim().length > 0 ? address.trim() : "Local do evento"}
                            </Text>
                            <Text
                                numberOfLines={3}
                                style={{
                                    color: globals.colors.placeholder,
                                    fontSize: globals.app.width / 28,
                                    textAlign: "justify"
                                }}>
                                {description.trim().length > 0 ? description.trim() : "Descrição do evento"}
                            </Text>
                        </View>
                    </View>
                    {CustomTextInput(name, setName, "Nome do evento", "Entre com o nome do evento", false, true)}
                    {CustomTextInput(address, setAddress, "Local do evento", "Entre com a localidade do evento")}
                    <View
                        style={{
                            justifyContent: "space-between",
                            flexDirection: "row"
                        }}>
                        <View>
                            <Text style={styles.label}>
                                Data do evento
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setOpen(false);
                                    setShowDatePicker(true);
                                }}
                                style={{
                                    backgroundColor: globals.colors.midground,
                                    paddingHorizontal: globals.app.width / 42,
                                    paddingVertical: globals.app.width / 30,
                                    borderRadius: globals.app.width / 42,
                                    fontSize: globals.app.width / 26,
                                    width: globals.app.width / 2.36,
                                }}>
                                <Text style={styles.timeInput}>
                                    {formatTime(startDate.getDate())}/{globals.months[startDate.getMonth()].toLowerCase()}/{startDate.getFullYear()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.label}>
                                Início
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setOpen(false);
                                    if (!allDay) setShowStartTimePicker(true);
                                }}
                                style={styles.timeContainer}>
                                <Text style={styles.timeInput}>
                                    {formatTime(startDate.getHours())}:{formatTime(startDate.getMinutes())}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.label}>
                                Término
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setOpen(false);
                                    if (!allDay) setShowEndTimePicker(true);
                                }}
                                style={styles.timeContainer}>
                                <Text style={styles.timeInput}>
                                    {formatTime(endDate.getHours())}:{formatTime(endDate.getMinutes())}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.container}>
                        {CheckBox("Dia inteiro", allDay, () => {
                            const newValue = !allDay;
                            setAllDay(newValue);
                            if (newValue) {
                                const year = startDate.getFullYear();
                                const month = startDate.getMonth();
                                const day = startDate.getDate();
                                const newStartDate = new Date(year, month, day, 0, 0, 0);
                                const newEndDate = new Date(year, month, day, 23, 59, 59)
                                setStartDate(newStartDate);
                                setEndDate(newEndDate);
                            };
                        })}
                        {CheckBox("Anualmente", annually, () => setAnnually(!annually))}
                        {CheckBox("Notificar-me", notify, () => setNotify(!notify))}
                    </View>
                    <View style={{ marginBottom: globals.app.width / 42 }}>
                        <Text style={styles.label}>
                            Categoria do evento
                        </Text>
                        <DropDownPicker
                            open={open}
                            value={category}
                            items={categories}
                            setOpen={setOpen}
                            setValue={setCategory}
                            setItems={setCategories}
                            theme="DARK"
                            textStyle={[styles.timeInput, { textAlign: "auto" }]}
                            dropDownContainerStyle={{
                                backgroundColor: globals.colors.background,
                                borderColor: globals.colors.midground,
                                borderWidth: globals.app.width / 102,
                                elevation: 6
                            }}
                            style={{
                                backgroundColor: globals.colors.midground,
                                borderRadius: globals.app.width / 42,
                                fontSize: globals.app.width / 26,
                                padding: globals.app.width / 42,
                                borderWidth: 0
                            }}
                        />
                    </View>
                    <View
                        style={[styles.container, {
                            justifyContent: "space-between",
                            flexDirection: "row"
                        }]}>
                        {CustomTouchableOpacity("TRABALHO", "Business", "#2255A4")}
                        {CustomTouchableOpacity("ACADÊMICO", "Academic", "#5822a4")}
                        {CustomTouchableOpacity("MEDICINA", "Medicine", "#a4229e")}
                    </View>
                    {CustomTextInput(description, setDescription, "Descrição do evento", "Entre com a descrição do evento", true)}
                </View>
            </ScrollView>
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
                    iconName={id === -1 ? "playlist-add" : "playlist-add-check"}
                    backgroundColor="#2db3a8"
                    onPress={() => {
                        if (name.trim().length == 0) {
                            setRequired(true);
                            scrollToTop();
                        }
                        else {
                            setRequired(false);
                            saveEvent();
                        }
                    }}
                />
            </View>
        </View>
    )
};

export default FormScreen;
const styles = StyleSheet.create({
    label: {
        marginLeft: globals.app.width / 62,
        fontSize: globals.app.width / 23.2,
        color: globals.colors.foreground
    },
    container: { marginBottom: globals.app.width / 32 },
    timeContainer: {
        backgroundColor: globals.colors.midground,
        paddingHorizontal: globals.app.width / 42,
        paddingVertical: globals.app.width / 30,
        borderRadius: globals.app.width / 42,
        fontSize: globals.app.width / 26,
        width: globals.app.width / 4.6,
    },
    timeInput: {
        fontSize: globals.app.width / 26,
        color: globals.colors.tint,
        textAlign: "center"
    }
});
