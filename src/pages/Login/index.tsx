import { observer } from "mobx-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ActionResultStatus, ERoute } from "../../types/global.ts";
import { useUserStore } from "../../api/services/User";
import "../../styles/auth.css";

const Login = () => {
  const { t } = useTranslation("app");
  const navigate = useNavigate();
  const userStore = useUserStore();
  //Left hardcoded for faster testing.
  const [eMail, setEMail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!userStore) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const response = await userStore.login({ eMail, password });
    if (response.status === ActionResultStatus.ERROR) {
      setErrorMessage(response.error.message || t("loginPage.error"));
    }
  };

  if (userStore.user) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card--centered">
          <div className="auth-check">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="auth-message">{t("loginPage.sessionLabel")}</p>
          <p className="auth-session-name">
            {userStore.user.firstName} {userStore.user.lastName}
          </p>
          <p className="auth-session-email">{userStore.user.eMail}</p>
          <button
            type="button"
            onClick={() => {
              userStore.logout();
              navigate(ERoute.ROOT);
            }}
            className="auth-button auth-button--secondary"
          >
            {t("logout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">{t("loginPage.title")}</h1>
        <p className="auth-subtitle">{t("loginPage.subtitle")}</p>

        <div className="auth-field">
          <label htmlFor="eMail">{t("loginPage.email")}</label>
          <input
            id="eMail"
            type="email"
            value={eMail}
            onChange={(e) => setEMail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">{t("loginPage.password")}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <button
          type="submit"
          disabled={userStore.isLoading}
          className="auth-button"
        >
          {userStore.isLoading
            ? t("loginPage.submitting")
            : t("loginPage.submit")}
        </button>
      </form>
    </div>
  );
};

export default observer(Login);
