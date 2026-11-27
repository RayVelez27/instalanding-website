/** Ask the Sidebar to open the phone menu or search (it owns that state) */
export const openPhoneMenu = () => window.dispatchEvent(new Event("il:open-menu"));
export const openPhoneSearch = () => window.dispatchEvent(new Event("il:open-search"));
