let currentLanguage = 'en';

function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('ru') ? 'ru' : 'en';
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = translations[lang];
        
        for (const k of keys) {
            value = value[k];
        }
        
        if (element.tagName === 'INPUT' && element.type === 'submit') {
            element.value = value;
        } else {
            element.textContent = value;
        }
    });

    localStorage.setItem('preferredLanguage', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = getBrowserLanguage();
    const initialLanguage = savedLanguage || browserLanguage;
    
    setLanguage(initialLanguage);
    document.getElementById('language-select').value = initialLanguage;
    
    document.getElementById('language-select').addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = currentYear;
});

function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function normalCDF(x) {
    // Approximation of the cumulative standard normal distribution
    // Using the algorithm from Abramowitz and Stegun
    const b1 =  0.319381530;
    const b2 = -0.356563782;
    const b3 =  1.781477937;
    const b4 = -1.821255978;
    const b5 =  1.330274429;
    const p  =  0.2316419;
    const c  =  0.39894228;
    
    if (x >= 0.0) {
        const t = 1.0 / (1.0 + p * x);
        return 1.0 - c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
    } else {
        return 1.0 - normalCDF(-x);
    }
}

function normalInv(p) {
    // Approximation of the inverse standard normal distribution
    // Using the algorithm from Abramowitz and Stegun
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    
    const a1 = -3.969683028665376e+01;
    const a2 =  2.209460984245205e+02;
    const a3 = -2.759285104469687e+02;
    const a4 =  1.383577518672690e+02;
    const a5 = -3.066479806614716e+01;
    const a6 =  2.506628277459239e+00;
    
    const b1 = -5.447609879822406e+01;
    const b2 =  1.615858368580409e+02;
    const b3 = -1.556989798598866e+02;
    const b4 =  6.680131188771972e+01;
    const b5 = -1.328068155288572e+01;
    
    const c1 = -7.784894002430293e-03;
    const c2 = -3.223964580411365e-01;
    const c3 = -2.400758277161838e+00;
    const c4 = -2.549732539343734e+00;
    const c5 =  4.374664141464968e+00;
    const c6 =  2.938163982698783e+00;
    
    const d1 =  7.784695709041462e-03;
    const d2 =  3.224671290700398e-01;
    const d3 =  2.445134137142996e+00;
    const d4 =  3.754408661907416e+00;
    
    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    
    let q, r, x;
    
    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        x = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        x = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    }
    else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        x = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    
    const e = normalCDF(x) - p;
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    x = x - u / (1 + x * u / 2);
    
    return x;
}

document.addEventListener('DOMContentLoaded', function() {
    const calculateNormSDist = document.getElementById('calculate-normSDist');
    calculateNormSDist.addEventListener('click', function() {
        const z = parseFloat(document.getElementById('normSDist-z').value);
        const cumulative = document.getElementById('normSDist-cumulative').checked;
        
        let result;
        if (cumulative) {
            result = normalCDF(z);
        } else {
            result = normalPDF(z);
        }
        
        const resultSquared = result * result;
        
        document.getElementById('normSDist-result').textContent = result.toFixed(8);
        document.getElementById('normSDist-result-squared').textContent = resultSquared.toFixed(8);
    });
    
    const calculateNormSInv = document.getElementById('calculate-normSInv');
    calculateNormSInv.addEventListener('click', function() {
        const probability = parseFloat(document.getElementById('normSInv-probability').value);
        
        if (probability < 0 || probability > 1) {
            alert('Probability must be between 0 and 1');
            return;
        }
        
        const result = normalInv(probability);
        const resultSquared = result * result;
        
        document.getElementById('normSInv-result').textContent = result.toFixed(8);
        document.getElementById('normSInv-result-squared').textContent = resultSquared.toFixed(8);
    });
    
    calculateNormSDist.click();
    calculateNormSInv.click();
});