import { observer } from "mobx-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionResultStatus } from "../../types/global.ts";
import { useUserStore } from "../../api/services/User";
import "./index.css";

const Settings = () => {
  const { t } = useTranslation("app");
  const userStore = useUserStore();
  const [firstName, setFirstName] = useState(userStore?.user?.firstName ?? "");
  const [lastName, setLastName] = useState(userStore?.user?.lastName ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!userStore) {
    return null;
  }

  if (!userStore.user) {
    return (
      <div className="login-page">
        <div className="login-card login-card--session">
          <p className="login-session-label">{t("settings.loginToEdit")}</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const response = await userStore.saveSettings({ firstName, lastName });
    if (response.status === ActionResultStatus.ERROR) {
      setErrorMessage(t("settings.error"));
    } else {
      setSuccessMessage(t("settings.success"));
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">{t("settings.title")}</h1>
        <p className="login-subtitle">{t("settings.subtitle")}</p>

        <div className="login-field">
          <label htmlFor="firstName">{t("settings.firstName")}</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="lastName">{t("settings.lastName")}</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
          />
        </div>

        {errorMessage && <p className="login-error">{errorMessage}</p>}
        {successMessage && <p className="login-success">{successMessage}</p>}

        <button
          type="submit"
          disabled={userStore.isLoading}
          className="login-button"
        >
          {userStore.isLoading ? t("settings.saving") : t("settings.save")}
        </button>
      </form>
    </div>
  );
};

export default observer(Settings);
