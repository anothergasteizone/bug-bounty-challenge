import { observer } from "mobx-react";
import React, { useState } from "react";
import { ActionResultStatus } from "../../types/global.ts";
import { useUserStore } from "../../api/services/User";
import "./index.css";

const Settings = () => {
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
          <p className="login-session-label">
            Inicia sesión para editar tu perfil.
          </p>
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
      setErrorMessage(
        typeof response.error === "string"
          ? response.error
          : "No se pudieron guardar los cambios."
      );
    } else {
      setSuccessMessage("Cambios guardados correctamente.");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Ajustes</h1>
        <p className="login-subtitle">Actualiza los datos de tu perfil</p>

        <div className="login-field">
          <label htmlFor="firstName">Nombre</label>
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
          <label htmlFor="lastName">Apellidos</label>
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
          {userStore.isLoading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
};

export default observer(Settings);
