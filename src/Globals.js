// Import required modules and dependencies.
import { name as appName } from "../app.json";
import { Dimensions } from "react-native";

// Get the window dimensions
const window = Dimensions.get("window");

/**
 * Global variables and configurations.
 *
 * @property {Object} app - Application related variables.
 * @property {string} app.name - The name of the application.
 * @property {number} app.width - The width of the application window.
 * @property {number} app.height - The height of the application window.
 * @property {number} app.circle - The border radius calculed to be an circle.
 * @property {Object} colors - Color variables.
 * @property {string} colors.background - The background color.
 * @property {string} colors.midground - The midground color.
 * @property {string} colors.foreground - The foreground color.
 * @property {string} colors.placeholder - The placeholder color.
 * @property {string} colors.tint - The tint color.
 */
export const globals = {
    app: {
        name: appName,
        width: window.width,
        height: window.height,
        circle: Math.round(window.width + window.height) / 2
    },
    colors: {
        background: "#121212",
        midground: "#222222",
        foreground: "#444444",
        placeholder: "#AAAAAA",
        tint: "#FFFFFF"
    },
    months: [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ],
    weekDays: [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
    ],
    categories: [
        { label: "Lembrete", value: "Reminder" },
        { label: "Fotografia", value: "Photography" },
        { label: "Aniversário", value: "Birthday" },
        { label: "Trabalho", value: "Business" },
        { label: "Acadêmico", value: "Academic" },
        { label: "Relacionamento", value: "Relationship" },
        { label: "Medicina", value: "Medicine" }
    ],
    status: [
        { label: "Não definido", value: "Undefined" },
        { label: "Contrato", value: "Contract" },
        { label: "Agendado", value: "Scheduled" },
        { label: "Fotografar", value: "Photograph" },
        { label: "Em andamento", value: "In progress" },
        { label: "Editando", value: "Editing photos" },
        { label: "Revelar fotos", value: "Revelation" },
        { label: "Fazer álbum", value: "Album" },
        { label: "Finalizado", value: "Finished" },
        { label: "Cancelado", value: "Canceled" }
    ]
};
