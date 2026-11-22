import React, { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { AuthApi } from '../../hooks/useAuth';
import { PasswordField, AuthMessage, MIN_PASSWORD } from './AuthFields';

/** Se abre al volver del enlace "Restablecer contraseña" del correo. */
export default function NewPasswordModal({ auth }: { auth: AuthApi }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!auth.isPasswordRecovery) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setMsg({ type: 'error', text: `Usa al menos ${MIN_PASSWORD} caracteres.` });
    if (password !== confirm) return setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
    setBusy(true);
    const res = await auth.updatePassword(password);
    setBusy(false);
    if (res.error) return setMsg({ type: 'error', text: res.error });
    setMsg({ type: 'success', text: '¡Listo! Tu contraseña se actualizó.' });
    setTimeout(() => auth.finishPasswordRecovery(), 1200);
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in">
      <div className="tf-auth-card animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="newpass-title">
        <div className="tf-auth-head">
          <span className="tf-logo" aria-hidden="true"><KeyRound size={17} /></span>
          <div>
            <h3 id="newpass-title">Crea una contraseña nueva</h3>
            <p>{auth.user?.email}</p>
          </div>
        </div>
        <form className="tf-auth-form" onSubmit={submit} noValidate>
          <PasswordField id="new-password" label="Contraseña nueva" autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} hint={`Mínimo ${MIN_PASSWORD} caracteres.`} />
          <PasswordField id="new-password-confirm" label="Repite la contraseña" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} />
          {msg && <AuthMessage type={msg.type}>{msg.text}</AuthMessage>}
          <button type="submit" className="tf-auth-submit" disabled={busy}>
            {busy && <Loader2 size={16} className="directions-spin" />} Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
