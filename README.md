# Seel Data - Installation & Setup Guide

## Quick Start

Your Seel Data website is ready to use! Since you're using XAMPP, follow these steps:

### 1. Access Your Website

Open your browser and navigate to:
```
http://localhost/Seel%20Data/
```

Or simply:
```
http://localhost/Seel Data/
```

### 2. Files Structure
```
Seel Data/
├── index.html      (Main website file)
├── styles.css      (All styling)
├── script.js       (All functionality)
└── README.md       (This file)
```

## Features That Work Out of the Box

✅ **Modal Notice**
- Automatically shows on first visit
- Click anywhere to close
- Remembers if you've seen it (localStorage)

✅ **Dynamic Greeting**
- Shows "Good Morning/Afternoon/Evening/Night" based on time
- Icon changes accordingly

✅ **Filters**
- Filter by Category (MTN, Telecel, AirtelTigo, AFA)
- Filter by Availability (Available/Out of Stock)
- Clear all filters button

✅ **Interactive Service Cards**
- Hover effects
- Click to select package
- Availability badges

✅ **Navigation**
- Smooth scrolling between sections
- Active link highlighting
- Sticky header

✅ **Buttons**
- Help button (shows contact info)
- WhatsApp button (opens WhatsApp)
- Share button (uses Web Share API or copies link)

✅ **Responsive Design**
- Works on desktop, tablet, and mobile
- Touch-friendly on mobile devices

✅ **Animations**
- Fade-in effects
- Floating shapes in hero section
- Hover animations on all interactive elements

## Customization

### Update Contact Information

Edit `script.js` line 98-100 to update phone and email:
```javascript
alert('Need help? Contact us at:\n\nPhone: +233 XX XXX XXXX\nEmail: info@seeldata.com\nWhatsApp: Click the Join WhatsApp Group button');
```

### Update WhatsApp Link

Edit `script.js` line 104:
```javascript
window.open('https://wa.me/233XXXXXXXXX', '_blank');
```

### Change Colors

Edit `styles.css` lines 9-19 to modify the color scheme:
```css
:root {
    --primary-color: #6C5CE7;
    --secondary-color: #00B894;
    /* etc... */
}
```

## Troubleshooting

### Website not loading?
1. Make sure XAMPP Apache is running
2. Check that files are in `c:\xampp\htdocs\Seel Data\`
3. Clear browser cache (Ctrl + F5)

### Modal not showing?
Clear localStorage and refresh:
- Open browser console (F12)
- Type: `localStorage.clear()`
- Press Enter and refresh

### Functions not working?
- Check browser console for errors (F12)
- Make sure JavaScript is enabled
- Try a different browser

## Browser Support

✅ Chrome, Edge, Firefox, Safari (latest versions)
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Need More Help?

All functionality is contained in three files:
- **index.html** - Structure
- **styles.css** - Design
- **script.js** - Functionality

Everything works without any external server or database!
