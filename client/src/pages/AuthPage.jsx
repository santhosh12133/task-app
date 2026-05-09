import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../components/ui/Button';
import FieldError from '../components/ui/FieldError';

async function loadGoogleScript(clientId) {
  if (!clientId || window.google?.accounts?.id) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function AuthPage({ onSignIn, onSignUp, onGoogleLogin, onForgotPassword, loading }) {
  const [mode, setMode] = useState('login');
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    loadGoogleScript(clientId)
      .then(() => {
        setGoogleReady(Boolean(window.google?.accounts?.id));
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => {
              onGoogleLogin({ idToken: res.credential });
            },
          });

          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large' });
          }
        } catch (e) {
          // ignore initialization errors
        }
      })
      .catch(() => setGoogleReady(false));
  }, [onGoogleLogin]);

  async function submit(values) {
    if (mode === 'signup' && !values.name?.trim()) {
      form.setError('name', { message: 'Your name is required' });
      return;
    }

    if (mode === 'login') {
      await onSignIn({ email: values.email, password: values.password });
      return;
    }
    await onSignUp({ name: values.name.trim(), email: values.email, password: values.password });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg px-4 py-8 text-text sm:px-6 lg:px-8">
      {/* Animated background gradients (subtle) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/3 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative w-full max-w-6xl">
}
