// SDK 54+ auto-configures monorepo settings - no manual config needed
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
