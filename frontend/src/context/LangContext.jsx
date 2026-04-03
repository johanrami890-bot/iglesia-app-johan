import React, { createContext, useState, useContext, useEffect } from 'react';
import { en } from '../locales/en';
import { es } from '../locales/es';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
    const [lang, setLang] = useState('es'); // Default spanish

    useEffect(() => {
        const saved = localStorage.getItem('lang');
        if (saved) setLang(saved);
    }, []);

    const changeLang = (newLang) => {
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    const t = (key) => {
        const dictionary = lang === 'en' ? en : es;
        const value = dictionary[key];
        if (!value) console.warn(`Translation missing for key: ${key}`);
        return value || key;
    };

    return (
        <LangContext.Provider value={{ lang, changeLang, t }}>
            {children}
        </LangContext.Provider>
    );
};

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) throw new Error('useLang must be used within a LangProvider');
    return context;
};
