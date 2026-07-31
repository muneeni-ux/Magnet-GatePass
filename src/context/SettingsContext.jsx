import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../services/socket";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    logoUrl: "",
    smsEnabled: true,
    sosPhone: "0700000000",
    sosSmsEnabled: true,
  });

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/settings`);
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen to real-time settings updates via WebSockets
    socket.on("settings:updated", (updated) => {
      setSettings(updated);
    });

    return () => {
      socket.off("settings:updated");
    };
  }, []);

  const updateSettings = async (newValues) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${SERVER_URL}/api/settings`, newValues, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings(res.data.settings);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const uploadLogo = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("logo", file);

      const res = await axios.post(`${SERVER_URL}/api/settings/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setSettings(res.data.settings);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        updateSettings,
        uploadLogo,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
