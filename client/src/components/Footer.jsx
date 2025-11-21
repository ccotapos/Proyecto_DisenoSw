import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-light py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="font-medium mb-2">
          &copy; {currentYear} <span className="text-brand-accent font-bold">Gestor Laboral</span>
        </p>
        <p className="text-sm opacity-75 mb-4">
          Proyecto de Diseño de Software
        </p>
        <p className="text-xs opacity-50">
          Desarrollado por Camila Cotapos, Emilio Fernandez :D
        </p>
      </div>
    </footer>
  );
};

export default Footer;