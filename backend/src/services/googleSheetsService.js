// File: src/services/googleSheetsService.js
const { google } = require("googleapis");

class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheetsApi = google.sheets({ version: "v4", auth: this.auth });
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  async getRows(range) {
    try {
      const response = await this.sheetsApi.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });
      return response.data.values;
    } catch (error) {
      console.error("Error reading from Google Sheets:", error);
      throw error;
    }
  }

  async updateRows(range, values) {
    try {
      const response = await this.sheetsApi.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Google Sheets:", error);
      throw error;
    }
  }

  async appendRows(range, values) {
    try {
      const response = await this.sheetsApi.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });
      return response.data;
    } catch (error) {
      console.error("Error appending to Google Sheets:", error);
      throw error;
    }
  }
}

module.exports = new GoogleSheetsService();
