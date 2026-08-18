/**
 * @format
 */

import { AppRegistry } from "react-native";
import "@/lib/crypto";
import App from "@/app";

const { name: appName } = require("@/../app.json");

AppRegistry.registerComponent(appName, () => App);
