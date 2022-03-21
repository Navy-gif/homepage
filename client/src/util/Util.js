import options from '../options';

export const getUser = () => {
    const data = sessionStorage.getItem('user');
    if (data) return JSON.parse(data);
    return null;
};

export const getToken = () => {
    return sessionStorage.getItem('token') || null;
};

export const clearSession = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
};

export const setSession = (user, token) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
};

export const fetchUser = async () => {
    console.log('fetching user')
    const host = `${proto}://${options.domain}`;
    const res = await fetch(host + '/api/user', {
        credentials: 'include'
        // eslint-disable-next-line no-console
    }).catch(console.error);

    if (res.status === 200) {
        const user = await res.json();
        user.tag = `${user.username}#${user.discriminator}`;
        return user;
    }
    return null;
};

export const capitalise = (str) => {
    const first = str[0].toUpperCase();
    return `${first}${str.substring(1)}`;
};

export const timeAgo = (diff, extraMin = false, extraHours = false, extraDays = false) => {

    diff = parseInt(diff);
    if (isNaN(diff)) return 'that ain\'t it chief (not a number)';

    const years = Math.floor(diff / 60 / 60 / 24 / 365),
        months = Math.floor(diff / 60 / 60 / 24 / 30.4),
        weeks = extraDays ? Math.floor(diff / 60 / 60 / 24 / 7) : (diff / 60 / 60 / 24 / 7).toFixed(),
        days = extraHours ? Math.floor(diff / 60 / 60 / 24) : (diff / 60 / 60 / 24).toFixed(),
        hours = extraMin ? Math.floor(diff / 60 / 60) : (diff / 60 / 60).toFixed(),
        minutes = (diff / 60).toFixed();

    if (days > 365) {
        return `${years > 0 ? years : 1} year${years > 1 ? 's' : ''}`
            + `${months % 12 > 0 ? ` ${months % 12} month${months % 12 > 1 ? 's' : ''}` : ''}`;
    } else if (weeks > 4) {
        return `${months} month${months % 12 > 1 ? 's' : ''}`
            + `${days % 30 > 0 ? ` ${days % 30} day${days % 30 > 1 ? 's' : ''}` : ''}`;
    } else if (days >= 7) {
        return `${weeks} week${weeks > 1 ? 's' : ''}`
            + `${extraDays && days % 7 > 0 ? ` ${days % 7} day${days % 7 > 1 ? 's' : ''}` : ''}`;
    } else if (hours >= 24) {
        return `${days} day${days > 1 ? 's' : ''}`
            + `${extraHours && hours % 24 > 0 ? ` ${hours % 24} hour${hours % 24 > 1 ? 's' : ''}` : ''}`;
    } else if (minutes >= 60) {
        return `${hours} hour${hours > 1 ? 's' : ''}`
            + `${extraMin && minutes % 60 > 0 ? ` ${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}` : ''}`;
    } else if (diff >= 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return diff.toFixed() + ` second${diff.toFixed() !== 1 ? 's' : ''}`;

};

export const duration = (seconds = 0) => {
    let s = 0,
        m = 0,
        h = 0,
        d = 0,
        w = 0;
    s = Math.floor(seconds);
    m = Math.floor(s / 60);
    s %= 60;
    h = Math.floor(m / 60);
    m %= 60;
    d = Math.floor(h / 24);
    h %= 24;
    w = Math.floor(d / 7);
    d %= 7;
    return `${w ? `${w} ${plural(w, 'week')} ` : ''}`
        + `${d ? `${d} ${plural(d, 'day')} ` : ''}`
        + `${h ? `${h} ${plural(h, 'hour')} ` : ''}`
        + `${m ? `${m} ${plural(m, 'minute')} ` : ''}`
        + `${s ? `${s} ${plural(s, 'second')} ` : ''}`.trim();
};

const plural = (amt, word) => {
    if (amt === 1) return word;
    return `${word}s`;
};

export const logout = async () => {
    const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    });

    if (response.status === 200) {
        clearSession();
        window.location.replace('/');
    } else console.error('Failed to logout');

}

export const login = () => {
    return new Promise((resolve) => {
        const popup = window.open(
            `${proto}://${options.domain}/api/login`,
            'Discord login',
            'menubar=no,location=no,width=500,height=800,left=500,top=200'
        );

        const poller = setInterval(async () => {
            if (popup.closed) {
                clearInterval(poller);
                const user = await fetchUser();
                if (user) setSession(user, user.accessToken);
                else clearSession();
                resolve();
            }
        }, 5000);
    });
};

export const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http' ;
