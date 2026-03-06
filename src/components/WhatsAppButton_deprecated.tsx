import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

// Keep existing WhatsApp button as-is, update branding
const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/autopassionbj', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/autopassionbj', label: 'Instagram' },
];

export function WhatsAppButton() {
  // ... existing WhatsApp widget stays the same but rename to Autopassion
  return null; // Replaced by FloatingActions + BardahlChat
}
