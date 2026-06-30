import { observer } from "mobx-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActionResultStatus } from "../../types/global.ts";
import { useUserStore } from "../../api/services/User";
import "../../styles/auth.css";

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
      <div className="auth-page">
        <div className="auth-card auth-card--centered">
          <p className="auth-message">{t("settings.loginToEdit")}</p>
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
      setErrorMessage(response.error.message || t("settings.error"));
    } else {
      setSuccessMessage(t("settings.success"));
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">{t("settings.title")}</h1>
        <p className="auth-subtitle">{t("settings.subtitle")}</p>

        <div className="auth-field">
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

        <div className="auth-field">
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

        {errorMessage && <p className="auth-error">{errorMessage}</p>}
        {successMessage && <p className="auth-success">{successMessage}</p>}

        <button
          type="submit"
          disabled={userStore.isLoading}
          className="auth-button"
        >
          {userStore.isLoading ? t("settings.saving") : t("settings.save")}
        </button>
      </form>
    </div>
  );
};

export default observer(Settings);
