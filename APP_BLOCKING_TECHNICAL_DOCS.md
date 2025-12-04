# IKYKIK App Blocking System - Complete Technical Documentation

## Overview

The IKYKIK app blocking system is a **native Android implementation** that monitors which apps the user opens and blocks access to selected apps after they've exceeded a 30-minute "free window" usage limit. This documentation provides an in-depth technical explanation of every component, Android API used, and design decision made.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Android Permissions](#android-permissions)
4. [Native Kotlin Modules](#native-kotlin-modules)
5. [React Native Bridge](#react-native-bridge)
6. [Usage Tracking System](#usage-tracking-system)
7. [Overlay System](#overlay-system)
8. [Data Flow](#data-flow)
9. [Android APIs Used](#android-apis-used)
10. [How Blocking Works Step-by-Step](#how-blocking-works-step-by-step)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Native App                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  TasksScreen.js │  │ CreateTask.js   │  │ RewardsScreen   │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                │                                │
│                    ┌───────────▼───────────┐                    │
│                    │    AppBlocker.js      │                    │
│                    │  (JavaScript Bridge)  │                    │
│                    └───────────┬───────────┘                    │
└────────────────────────────────┼────────────────────────────────┘
                                 │ React Native Bridge
┌────────────────────────────────┼────────────────────────────────┐
│                     Native Android (Kotlin)                     │
│                    ┌───────────▼───────────┐                    │
│                    │   AppBlockerModule    │                    │
│                    │  (React Native Module)│                    │
│                    └───────────┬───────────┘                    │
│                                │                                │
│            ┌───────────────────┼───────────────────┐            │
│            │                   │                   │            │
│  ┌─────────▼─────────┐ ┌──────▼──────────┐ ┌─────▼──────────┐  │
│  │ AppBlockerService │ │ SharedPreferences│ │BlockingOverlay │  │
│  │ (Foreground Svc)  │ │  (Data Storage)  │ │   Service      │  │
│  └───────────────────┘ └─────────────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. AppBlockerModule.kt
**Purpose:** React Native Native Module - the bridge between JavaScript and native Android

**Location:** `android/app/src/main/java/com/yadhugowda/ikykikexpo/appblocker/AppBlockerModule.kt`

**Key Responsibilities:**
- Expose native methods to JavaScript via `@ReactMethod`
- Handle permission checks (Usage Stats, Overlay)
- Start/stop the blocking service
- Manage usage tracking data in SharedPreferences
- Get list of installed apps

### 2. AppBlockerService.kt
**Purpose:** Android Foreground Service - continuously monitors which app is in the foreground

**Location:** `android/app/src/main/java/com/yadhugowda/ikykikexpo/appblocker/AppBlockerService.kt`

**Key Responsibilities:**
- Run as a **Foreground Service** (persists in background)
- Check foreground app every 1 second
- Load usage stats from SharedPreferences
- Trigger overlay when blocked app exceeds 30 minutes
- Show persistent notification

### 3. BlockingOverlayService.kt
**Purpose:** Display a fullscreen overlay when a blocked app is detected

**Location:** `android/app/src/main/java/com/yadhugowda/ikykikexpo/appblocker/BlockingOverlayService.kt`

**Key Responsibilities:**
- Create Window overlay using `WindowManager`
- Display task name dynamically
- Handle "Go Back" and "Open IKYKIK" buttons
- Self-destruct when dismissed

### 4. AppBlocker.js
**Purpose:** JavaScript wrapper that provides a clean API for React Native components

**Location:** `src/native/AppBlocker.js`

**Key Responsibilities:**
- Bridge to native module
- Fallback to mock data when running on iOS/web
- Format usage data
- Provide utility functions

---

## Android Permissions

### Required Permissions in AndroidManifest.xml

```xml
<!-- Core App Blocking Permissions -->
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
    tools:ignore="ProtectedPermissions"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" 
    tools:ignore="QueryAllPackagesPermission"/>
```

### Permission Explanations

| Permission | Purpose | How It's Granted |
|------------|---------|------------------|
| `PACKAGE_USAGE_STATS` | Read which app is currently in foreground | User must manually enable in Settings → Apps → Special Access → Usage Access |
| `FOREGROUND_SERVICE` | Run service that stays alive in background | Automatically granted |
| `SYSTEM_ALERT_WINDOW` | Draw overlay on top of other apps | User must manually enable in Settings → Apps → Display over other apps |
| `QUERY_ALL_PACKAGES` | Get list of all installed apps | Automatically granted (but may require Play Store approval) |

---

## Native Kotlin Modules

### AppBlockerModule.kt - Detailed Breakdown

#### Class Definition
```kotlin
class AppBlockerModule(reactContext: ReactApplicationContext) 
    : ReactContextBaseJavaModule(reactContext)
```

This extends `ReactContextBaseJavaModule`, making it accessible from JavaScript.

#### SharedPreferences Storage
```kotlin
private val sharedPrefs = reactContext.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE)
```
- **SharedPreferences** is Android's key-value storage system
- `MODE_PRIVATE` means only this app can access this data
- Stored at: `/data/data/com.yadhugowda.ikykikexpo/shared_prefs/AppBlockerPrefs.xml`

#### Key Methods

**1. hasUsageStatsPermission()**
```kotlin
@ReactMethod
fun hasUsageStatsPermission(promise: Promise) {
    val appOpsManager = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = appOpsManager.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        reactApplicationContext.packageName
    )
    promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
}
```
- Uses `AppOpsManager` to check if Usage Stats permission is granted
- `unsafeCheckOpNoThrow` is used for Android 10+ compatibility
- Returns boolean via Promise to JavaScript

**2. getInstalledApps()**
```kotlin
@ReactMethod
fun getInstalledApps(promise: Promise) {
    val pm = reactApplicationContext.packageManager
    val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
    val result = Arguments.createArray()
    
    for (app in packages) {
        // Filter: Only show user-installed apps (not system apps)
        if (app.flags and ApplicationInfo.FLAG_SYSTEM == 0) {
            val appInfo = Arguments.createMap()
            appInfo.putString("packageName", app.packageName)
            appInfo.putString("appName", pm.getApplicationLabel(app).toString())
            result.pushMap(appInfo)
        }
    }
    promise.resolve(result)
}
```
- Uses `PackageManager` to get all installed apps
- Filters out system apps using `FLAG_SYSTEM` bitmask
- Returns array of `{packageName, appName}` objects

**3. startBlocking()**
```kotlin
@ReactMethod
fun startBlocking(blockedApps: ReadableArray, taskId: String, taskName: String, promise: Promise) {
    // Convert JS array to Kotlin list
    val apps = mutableListOf<String>()
    for (i in 0 until blockedApps.size()) {
        blockedApps.getString(i)?.let { apps.add(it) }
    }
    
    // Save to SharedPreferences
    sharedPrefs.edit()
        .putStringSet("blockedApps", apps.toSet())
        .putString("activeTaskId", taskId)
        .putString("activeTaskName", taskName)
        .putLong("blockStartTime", System.currentTimeMillis())
        .apply()

    // Start the foreground service
    val intent = Intent(reactApplicationContext, AppBlockerService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactApplicationContext.startForegroundService(intent)
    } else {
        reactApplicationContext.startService(intent)
    }
    
    promise.resolve(true)
}
```
- Stores blocked app package names in SharedPreferences as a `StringSet`
- Stores task metadata for overlay display
- Starts `AppBlockerService` as a **Foreground Service** (required for Android 8+)

**4. updateAppUsage()**
```kotlin
@ReactMethod
fun updateAppUsage(packageName: String, additionalMinutes: Int, promise: Promise) {
    val FREE_WINDOW_MS = 30 * 60 * 1000L // 30 minutes
    
    // Load existing usage
    val usageJson = sharedPrefs.getString("appUsageStats", "{}")
    val jsonObj = JSONObject(usageJson ?: "{}")
    
    // Get current + add new
    val currentMs = if (jsonObj.has(packageName)) jsonObj.getLong(packageName) else 0L
    val newMs = minOf(currentMs + (additionalMinutes * 60000L), FREE_WINDOW_MS) // Cap at 30 min
    
    // Save back
    jsonObj.put(packageName, newMs)
    sharedPrefs.edit().putString("appUsageStats", jsonObj.toString()).apply()
    
    promise.resolve(jsonObj.toString())
}
```
- Usage is tracked in milliseconds
- Caps at 30 minutes (can't exceed free window)
- Stored as JSON string in SharedPreferences

---

### AppBlockerService.kt - Detailed Breakdown

#### Foreground Service Setup
```kotlin
override fun onCreate() {
    super.onCreate()
    sharedPrefs = getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE)
    createNotificationChannel()
    startForeground(NOTIFICATION_ID, createNotification())
    loadUsageStats()
    startMonitoring()
}
```

**Why Foreground Service?**
- Android kills background services after ~1 minute to save battery
- Foreground Services are designed for user-visible ongoing operations
- They MUST show a notification (Android requirement)
- They persist until explicitly stopped

#### Creating Notification Channel (Android 8+)
```kotlin
private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "App Blocker",
            NotificationManager.IMPORTANCE_LOW  // Low = no sound, no popup
        )
        channel.description = "Monitoring app usage for task focus"
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }
}
```

#### Continuous Monitoring Loop
```kotlin
private fun startMonitoring() {
    handler = Handler(Looper.getMainLooper())
    checkRunnable = object : Runnable {
        override fun run() {
            checkCurrentApp()
            handler?.postDelayed(this, 1000) // Every 1 second
        }
    }
    handler?.post(checkRunnable!!)
}
```
- Uses Android's `Handler` for scheduling
- Runs on main thread (`Looper.getMainLooper()`)
- Checks every 1000ms (1 second)

#### Detecting Foreground App
```kotlin
private fun getForegroundApp(): String? {
    val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val now = System.currentTimeMillis()
    
    // Query usage events from last 5 seconds
    val events = usageStatsManager.queryEvents(now - 5000, now)
    var currentApp: String? = null
    
    val event = UsageEvents.Event()
    while (events.hasNextEvent()) {
        events.getNextEvent(event)
        // ACTIVITY_RESUMED = app came to foreground
        if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
            currentApp = event.packageName
        }
    }
    
    return currentApp
}
```

**How UsageStatsManager Works:**
1. `queryEvents()` returns all app usage events in a time range
2. `ACTIVITY_RESUMED` event fires when an app's activity becomes visible
3. We get the LAST such event to know what's currently on screen

#### Trigger Blocking Overlay
```kotlin
private fun showBlockingOverlay(packageName: String) {
    if (Settings.canDrawOverlays(this)) {
        val intent = Intent(this, BlockingOverlayService::class.java)
        intent.putExtra("blockedPackage", packageName)
        startService(intent)
    }
}
```

---

### BlockingOverlayService.kt - Detailed Breakdown

#### WindowManager Overlay
```kotlin
private fun showOverlay() {
    windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    overlayView = createOverlayView()

    val layoutParams = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,  // Full width
        WindowManager.LayoutParams.MATCH_PARENT,  // Full height
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,  // Android 8+
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT
    )
    
    windowManager?.addView(overlayView, layoutParams)
}
```

**Key Window Flags:**
- `TYPE_APPLICATION_OVERLAY` - Special window type for drawing on top of everything
- `FLAG_NOT_FOCUSABLE` - Doesn't steal focus from underlying app
- `FLAG_NOT_TOUCH_MODAL` - Touches outside pass through
- `FLAG_LAYOUT_IN_SCREEN` - Covers entire screen including status bar

#### Reading Task Name
```kotlin
private fun getTaskName(): String {
    return sharedPrefs.getString("activeTaskName", "your pending task") ?: "your pending task"
}
```
The overlay reads the task name stored by `startBlocking()` to show personalized message.

---

## React Native Bridge

### How JavaScript Calls Kotlin

**JavaScript Side (AppBlocker.js):**
```javascript
import { NativeModules } from 'react-native';
const { AppBlockerModule } = NativeModules;

// Call native method
const hasPermission = await AppBlockerModule.hasUsageStatsPermission();
```

**Kotlin Side (AppBlockerModule.kt):**
```kotlin
@ReactMethod
fun hasUsageStatsPermission(promise: Promise) {
    // ... implementation ...
    promise.resolve(true)  // Returns to JavaScript
}
```

**Key Concepts:**
1. `@ReactMethod` annotation exposes method to JavaScript
2. `Promise` is used for async return values
3. `Arguments.createMap()` and `Arguments.createArray()` create JS-compatible objects
4. Module name matches: `override fun getName() = "AppBlockerModule"`

---

## Usage Tracking System

### Data Storage Format

**SharedPreferences Key: `appUsageStats`**
```json
{
  "com.instagram.android": 1800000,
  "com.whatsapp": 900000,
  "com.substack.app": 1800000
}
```
- Keys = package names
- Values = usage in **milliseconds**
- 1800000 ms = 30 minutes (max cap)

### Usage Flow

1. **Simulation (Track 5 min button)**
   - User taps → JavaScript calls `updateAppUsage(packageName, 5)`
   - Native method adds 5*60000 = 300000 ms to current usage
   - Capped at 30 minutes total

2. **Check When Blocking**
   - `AppBlockerService.checkCurrentApp()` runs every second
   - Loads usage from SharedPreferences
   - If `usageMs >= 30*60*1000` → show overlay

---

## Overlay System

### Visual Design Choices

```kotlin
// Main container - dark background (simulates blur)
val container = FrameLayout(context).apply {
    setBackgroundColor(0xCC000000.toInt()) // 80% black opacity
}

// White dialog card
val dialog = LinearLayout(context).apply {
    val dialogBg = GradientDrawable().apply {
        setColor(Color.WHITE)
        cornerRadius = dpToPx(28).toFloat()
    }
    background = dialogBg
}
```

**Design Matches Digital Wellbeing:**
- Dark dimmed background (simulates iOS/Android blur)
- White rounded card in center
- Clean pause icon (not emoji)
- Task-specific message
- Blue text buttons (Material Design style)

---

## Data Flow

### Complete Flow: User Creates Task → App Gets Blocked

```
1. User creates task with locked apps in CreateTaskScreen.js
   │
   ▼
2. JavaScript calls: AppBlocker.startBlocking(['com.instagram.android'], 'task123', 'Exam tomorrow')
   │
   ▼
3. AppBlockerModule.kt receives call via React Native Bridge
   │
   ▼
4. Saves to SharedPreferences:
   - blockedApps: ['com.instagram.android']
   - activeTaskId: 'task123'
   - activeTaskName: 'Exam tomorrow'
   │
   ▼
5. Starts AppBlockerService as Foreground Service
   │
   ▼
6. Service shows persistent notification: "IKYKIK - Focus Mode Active"
   │
   ▼
7. Service starts monitoring loop (every 1 second)
   │
   ▼
8. User uses Instagram for 30 minutes (simulated by Track 5 min × 6)
   │
   ▼
9. AppBlockerService.checkCurrentApp() detects:
   - currentApp = "com.instagram.android"
   - currentApp isIn blockedApps ✓
   - usageMs >= 30*60*1000 ✓
   │
   ▼
10. Service calls showBlockingOverlay("com.instagram.android")
    │
    ▼
11. BlockingOverlayService starts, reads task name from SharedPreferences
    │
    ▼
12. Creates fullscreen overlay using WindowManager
    │
    ▼
13. User sees: "Complete 'Exam tomorrow' before using Instagram"
    │
    ▼
14. User taps "Go Back" → goBackToHome() → Opens Android launcher
    │
    ▼
15. User completes task in IKYKIK → stopBlocking() called
    │
    ▼
16. SharedPreferences cleared, Service stopped, No more overlay
```

---

## Android APIs Used

### 1. UsageStatsManager
**Purpose:** Read which apps are being used and for how long

```kotlin
val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
val events = usageStatsManager.queryEvents(startTime, endTime)
```

**Events Types:**
- `ACTIVITY_RESUMED` - Activity became visible
- `ACTIVITY_PAUSED` - Activity became invisible
- `ACTIVITY_STOPPED` - Activity fully stopped

### 2. WindowManager
**Purpose:** Draw UI elements on top of other apps

```kotlin
val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
windowManager.addView(overlayView, layoutParams)
```

**Required permission:** `SYSTEM_ALERT_WINDOW`

### 3. PackageManager
**Purpose:** Get information about installed apps

```kotlin
val pm = context.packageManager
val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
val appName = pm.getApplicationLabel(appInfo).toString()
```

### 4. SharedPreferences
**Purpose:** Persist key-value data across app restarts

```kotlin
val prefs = context.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE)
prefs.edit().putString("key", "value").apply()
val value = prefs.getString("key", "default")
```

### 5. Foreground Service
**Purpose:** Long-running operation that user is aware of

```kotlin
class AppBlockerService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY  // Restart if killed
    }
}
```

**START_STICKY:** Tells Android to recreate the service if it's killed due to memory pressure.

### 6. Handler & Looper
**Purpose:** Schedule recurring tasks on Android's main thread

```kotlin
val handler = Handler(Looper.getMainLooper())
val runnable = Runnable { checkCurrentApp() }
handler.postDelayed(runnable, 1000)  // Run after 1 second
```

---

## How Blocking Works Step-by-Step

### Step 1: Permission Check
Before any blocking can work, user must grant:
1. **Usage Access** - Enables reading foreground app
2. **Display Over Apps** - Enables showing overlay

### Step 2: Task Creation with Locked Apps
When user creates a task:
1. Select apps to lock (e.g., Instagram)
2. JavaScript calls `AppBlocker.startBlocking(['com.instagram.android'], taskId, 'Exam')`
3. Native module stores this in SharedPreferences
4. Foreground Service starts

### Step 3: Foreground Service Monitoring
The service:
1. Shows notification (required by Android)
2. Runs `checkCurrentApp()` every 1 second
3. Uses `UsageStatsManager.queryEvents()` to detect foreground app

### Step 4: Usage Tracking
When user uses a locked app:
1. Track usage with "Track 5 min" button (simulation)
2. Native `updateAppUsage()` adds time to SharedPreferences
3. Capped at 30 minutes maximum

### Step 5: Blocking Trigger
When service detects:
- Current app is in blocked list AND
- Usage >= 30 minutes

It calls `showBlockingOverlay(packageName)`

### Step 6: Overlay Display
`BlockingOverlayService`:
1. Creates fullscreen `View` programmatically
2. Uses `WindowManager.addView()` to display on top of everything
3. Reads task name from SharedPreferences
4. Shows message: "Complete 'Exam' before using Instagram"

### Step 7: User Action
User can:
- **Go Back** - Returns to home screen, overlay closes
- **Open IKYKIK** - Opens the IKYKIK app to complete task

### Step 8: Task Completion
When user completes task:
1. `AppBlocker.stopBlocking()` is called
2. Clears `blockedApps` from SharedPreferences
3. Stops `AppBlockerService`
4. Overlay won't show anymore

---

## Summary

The IKYKIK app blocking system uses:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **AppBlockerModule** | React Native Native Module | Bridge JS ↔ Kotlin |
| **AppBlockerService** | Android Foreground Service | Monitor foreground app 24/7 |
| **BlockingOverlayService** | WindowManager Overlay | Show blocking popup |
| **SharedPreferences** | Android Key-Value Storage | Store blocked apps, usage |
| **UsageStatsManager** | Android System API | Detect foreground app |

**Key Android Concepts:**
- Foreground Services persist in background with notification
- WindowManager can draw on top of any app
- UsageStatsManager provides app usage information
- SharedPreferences persists data across service/activity restarts

This implementation works on all Android devices (Samsung, Xiaomi, Vivo, Oppo, OnePlus, Realme) and provides a native, seamless app blocking experience that integrates with the user's task management workflow.
