# 🎤 Microphone Access Troubleshooting Guide

If you're experiencing "Could not access microphone" errors, follow this step-by-step guide to resolve the issue.

## Quick Fixes (Try These First)

### 1. Browser Permissions
**Chrome/Edge:**
- Click the lock icon 🔒 in the address bar
- Click "Site Settings"
- Find "Microphone" and set to "Allow"

**Firefox:**
- Click the shield icon 🛡️ in the address bar
- Click "Permissions"
- Set "Microphone" to "Allow"

**Safari:**
- Safari → Preferences → Websites → Microphone
- Set to "Allow" for localhost

### 2. HTTPS Requirement
Microphone access requires HTTPS or localhost. Make sure you're accessing the app via:
- ✅ `http://localhost:3000` (development)
- ✅ `https://yourdomain.com` (production)
- ❌ `http://yourdomain.com` (will not work)

### 3. Browser Compatibility
Use modern browsers:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ❌ Internet Explorer (not supported)

### 3.5. Audio Settings Compatibility
The app now automatically tries multiple audio configurations:
- **Most Compatible**: Just `{ audio: true }` (like working audd.py)
- **Basic**: `{ audio: {} }` (no constraints)
- **Enhanced**: With echo cancellation and noise suppression
- **Standard**: 44.1kHz, stereo, with audio processing

The app now uses the exact same audio configuration as your working `audd.py` file as the first option, ensuring maximum compatibility.

## Advanced Troubleshooting

### 4. System Microphone Settings

**macOS:**
- System Preferences → Security & Privacy → Microphone
- Enable for your browser (Chrome, Firefox, Safari)

**Windows:**
- Settings → Privacy → Microphone
- Turn on "Allow apps to access microphone"
- Make sure your browser is allowed

**Linux:**
- Check your audio settings
- Ensure microphone is not muted
- Test with `pavucontrol` or similar

### 5. Hardware Issues
- Ensure microphone is connected and working
- Test microphone in other applications (Zoom, Discord, etc.)
- Check if microphone is being used by another application
- Try a different microphone if available

### 6. Development Environment
Make sure both servers are running:
```bash
# Check if backend is running
curl http://localhost:5001/api/songs

# Check if frontend is running  
curl http://localhost:3000
```

### 7. Diagnostic Tools

#### Option A: Built-in Diagnostic
1. Go to the Music tab in the app
2. Click "Diagnostics" button
3. Click "Test Microphone"
4. Check the results and follow the suggestions

#### Option B: Standalone Test
1. Open `test_microphone.html` in your browser
2. Click "Test Microphone"
3. Review the results and troubleshooting tips

### 8. Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `NotAllowedError` | Permission denied | Allow microphone in browser settings |
| `NotFoundError` | No microphone found | Connect a microphone |
| `NotSupportedError` | Microphone doesn't support required settings | The app now tries multiple configurations automatically |
| `ConstraintNotSatisfiedError` | Microphone doesn't support required settings | The app now tries multiple configurations automatically |
| `SecurityError` | HTTPS requirement not met | Use HTTPS or localhost |
| `NotReadableError` | Microphone in use by another app | Close other apps using microphone |

### 9. Alternative Solutions
- Try a different browser
- Restart your browser
- Clear browser cache and cookies
- Disable browser extensions that might interfere
- Try incognito/private browsing mode
- Restart your computer

### 10. Still Having Issues?

If none of the above solutions work:

1. **Check Browser Console:**
   - Press F12 to open developer tools
   - Go to Console tab
   - Look for error messages when trying to record
   - Share the error message for further assistance

2. **Test with Simple HTML:**
   - Open `test_microphone.html` in your browser
   - This isolates the microphone issue from the main app

3. **System Audio Test:**
   - Test your microphone in system settings
   - Try recording in other applications
   - Ensure microphone is working at system level

## Browser-Specific Instructions

### Chrome
1. Click the lock icon in address bar
2. Click "Site Settings"
3. Find "Microphone" and click it
4. Select "Allow"
5. Refresh the page

### Firefox
1. Click the shield icon in address bar
2. Click "Permissions"
3. Find "Microphone" and set to "Allow"
4. Refresh the page

### Safari
1. Safari → Preferences
2. Click "Websites" tab
3. Select "Microphone" from left sidebar
4. Set localhost to "Allow"
5. Refresh the page

## Still Need Help?

If you're still experiencing issues after trying all the above solutions:

1. Check the browser console for specific error messages
2. Try the standalone microphone test (`test_microphone.html`)
3. Test with a different browser
4. Ensure you're using HTTPS or localhost
5. Check if your microphone works in other applications

The most common causes are:
- Browser permissions not set to "Allow"
- Not using HTTPS or localhost
- Microphone being used by another application
- Outdated browser version 