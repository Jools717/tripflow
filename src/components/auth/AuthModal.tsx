import React, { useState } from 'react';
import { X, Mail, Globe, Sparkles, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { UserProfile } from '../../types/user';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSignInGoogle: () => Promise<{ error?: string }>;
  onSignInOtp: (email: string) => Promise<{ error?: string; success?: boolean }>;
  onSignOut: () => Promise<void>;
  onContinueAsGuest: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onSignInGoogle,
  onSignInOtp,
  onSignOut,
  onContinueAsGuest
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleGoogleSubmit = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await onSignInGoogle();
    if (res.error) {
      setStatusMessage({ type: 'error', text: res.error });
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Por favor ingresa un correo electrónico válido.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await onSignInOtp(email.trim());
    setIsSubmitting(false);

    if (res.error) {
      setStatusMessage({ type: 'error', text: res.error });
    } else if (res.success) {
      setStatusMessage({
        type: 'success',
        text: '¡Enlace enviado! Revisa tu bandeja de entrada o spam para iniciar sesión.'
      });
      setEmail('');
    }
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={onClose}>
      <div className="auth-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-title-box">
            <div className="auth-icon-badge">
              <Globe size={24} className="text-sky" />
            </div>
            <div>
              <h3>{user ? 'Tu Cuenta de Viajero' : 'Bienvenido a TravelOS'}</h3>
              <p>
                {user 
                  ? 'Gestiona tu sesión y sincronización en la nube' 
                  : 'Sincroniza tus viajes en tiempo real en todos tus dispositivos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="auth-modal-body">
          
          {user ? (
            /* Logged in state */
            <div className="auth-logged-in-box">
              <div className="user-profile-badge">
                <div className="user-avatar-placeholder">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="user-avatar-img" />
                  ) : (
                    <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="user-profile-details">
                  <strong>{user.displayName || 'Viajero'}</strong>
                  <span className="user-email-text">{user.email}</span>
                </div>
              </div>

              <div className="auth-sync-status-card">
                <CheckCircle2 size={18} className="text-emerald" />
                <div>
                  <strong>Sincronización en la Nube Activa</strong>
                  <p>Tus itinerarios, presupuestos y comprobantes están respaldados en tu cuenta.</p>
                </div>
              </div>

              <div className="auth-modal-actions">
                <button
                  type="button"
                  className="btn-danger btn-block"
                  onClick={async () => {
                    await onSignOut();
                    onClose();
                  }}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-block"
                  onClick={onClose}
                >
                  Continuar Viajando
                </button>
              </div>
            </div>
          ) : (
            /* Sign in form */
            <div className="auth-forms-container">
              
              {/* Google Button */}
              <button
                type="button"
                className="btn-google-auth"
                onClick={handleGoogleSubmit}
                disabled={isSubmitting}
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="auth-divider">
                <span>o con tu correo electrónico</span>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`auth-status-banner ${statusMessage.type}`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="auth-email-form">
                <div className="auth-input-group">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input-field"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-block btn-magic-link"
                  disabled={isSubmitting}
                >
                  <Sparkles size={16} />
                  <span>{isSubmitting ? 'Enviando enlace...' : 'Enviar Enlace Mágico'}</span>
                </button>
              </form>

              {/* Guest option */}
              <div className="auth-guest-footer">
                <button
                  type="button"
                  className="btn-link-guest"
                  onClick={() => {
                    onContinueAsGuest();
                    onClose();
                  }}
                >
                  Continuar como invitado (Guardar solo en este dispositivo)
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
