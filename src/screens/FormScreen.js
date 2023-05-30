import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import DropDownPicker from "react-native-dropdown-picker";
import { formatTime } from "../utils/Functions";
import { globals } from "../Globals";
import * as React from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import RoundButton from "../components/RoundButton";

const FormScreen = ({ navigation, route }) => {
    const [id, setId] = React.useState(route.params ? JSON.parse(route.params).id : -1);
    const [name, setName] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [startDate, setStartDate] = React.useState(new Date());
    const [endDate, setEndDate] = React.useState(new Date());
    const [annually, setAnnually] = React.useState(false);
    const [allDay, setAllDay] = React.useState(false);
    const [category, setCategory] = React.useState("Reminder");
    const [description, setDescription] = React.useState("");
    const [required, setRequired] = React.useState(false);
    const [showTopButton, setShowTopButton] = React.useState(false);

    const [open, setOpen] = React.useState(false);
    const [categories, setCategories] = React.useState([
        { label: "Lembrete", value: "Reminder" },
        { label: "Aniversário", value: "Birthday" },
        { label: "Trabalho", value: "Business" },
        { label: "Acadêmico", value: "Academic" },
        { label: "Relacionamento", value: "Relationship" },
        { label: "Medicina", value: "Medicine" },
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
                numberOfLines={multiline ? 6 : 1}
                onChangeText={setValue}
                onBlur={() => onBlurInput(setValue)}
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

    const onBlurInput = setValue => setValue(previousValue => previousValue.trim());
    return (
        <View style={{ flex: 1 }} onTouchEnd={open ? () => setOpen(false) : null}>
            <ScrollView
                ref={scrollViewRef}
                onScroll={handleScroll}
                removeClippedSubviews={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ padding: globals.app.width / 26 }}>
                <View style={{ flex: 1 }}>
                    {showDatePicker && (
                        <DateTimePicker
                            mode="date"
                            value={startDate}
                            onChange={(event, date) => handleDateChange(date)}
                        />
                    )}
                    {showStartTimePicker && (
                        <DateTimePicker
                            mode="time"
                            is24Hour={true}
                            value={startDate}
                            onChange={(event, date) => handleTimeChange(date)}
                        />
                    )}
                    {showEndTimePicker && (
                        <DateTimePicker
                            mode="time"
                            is24Hour={true}
                            value={endDate}
                            onChange={(event, date) => handleTimeChange(date, false)}
                        />
                    )}
                    {CustomTextInput(name, setName, "Nome do evento", "Entre com o nome do evento", false, true)}
                    {CustomTextInput(address, setAddress, "Local do evento", "Entre com a localidade do evento")}
                    <View
                        style={{
                            marginBottom: globals.app.width / 42,
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
                                    {startDate.getDate()}/{globals.months[startDate.getMonth()].toLowerCase()}/{startDate.getFullYear()}
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
                    <View
                        style={[styles.container, {
                            justifyContent: "space-evenly",
                            flexDirection: "row"
                        }]}>
                        {CheckBox("Anualmente", annually, () => setAnnually(!annually))}
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
                            if (id === -1) alert("Adicionar evento.");
                            else alert("Atualizar evento.");
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
