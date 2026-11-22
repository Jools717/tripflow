import React from 'react';
import { X, LogOut, ShieldCheck, Mail } from 'lucide-react';
import { BrandMark } from '../common/Logo';
import { AuthApi } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthApi;
}

/** "Mi cuenta": datos de la sesión y cerrar sesión. El acceso sin sesión vive en AuthPage. */
export default function AuthModal({ isOpen, onClose, auth }: AuthModalProps) {
  const { user } = auth;
  if (!isOpen || !user) return null;

  const viaGoogle = Boolean(user.avatarUrl);

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={onClose}>
      <div className="tf-auth-card animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="account-title" onClick={(e) => e.stopPropagation()}>
        <div className="tf-auth-head">
          <BrandMark size={40} />
          <div>
            <h3 id="account-title">Tu cuenta</h3>
            <p>Sesión iniciada en TripFlow</p>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>

        <div className="tf-auth-account">
          <div className="tf-menu-profile">
            <span className="tf-avatar lg">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : (user.displayName || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="tf-menu-profile-text">
              <strong>
                {user.displayName}
                {user.role === 'admin' && <span className="tf-role-pill"><ShieldCheck size={11} /> Admin</span>}
              </strong>
              <small><Mail size={11} /> {user.email}{viaGoogle ? ' · Google' : ''}</small>
            </div>
          </div>

          <p className="tf-auth-intro">
            Al cerrar sesión se borran los datos guardados en este dispositivo. Tus viajes siguen a salvo en tu cuenta.
          </p>

          <button
            type="button"
            className="btn-danger btn-block"
            onClick={async () => {
              if (await auth.signOut()) onClose();
            }}
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
