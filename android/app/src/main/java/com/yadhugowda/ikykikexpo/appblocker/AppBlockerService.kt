package com.yadhugowda.ikykikexpo.appblocker

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import androidx.core.app.NotificationCompat
import org.json.JSONObject

/**
 * App Blocker Service
 * Monitors foreground apps and shows blocking overlay when blocked app exceeds 30min usage
 */
class AppBlockerService : Service() {

    private val CHANNEL_ID = "AppBlockerChannel"
    private val NOTIFICATION_ID = 1001
    private val FREE_WINDOW_MINUTES = 30

    private lateinit var sharedPrefs: SharedPreferences
    private var handler: Handler? = null
    private var checkRunnable: Runnable? = null
    private var appUsageMap = mutableMapOf<String, Long>() // packageName -> usage in ms
    private var lastCheckTime = System.currentTimeMillis()

    override fun onCreate() {
        super.onCreate()
        sharedPrefs = getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE)
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        
        // Load existing usage stats
        loadUsageStats()
        
        // Start monitoring loop
        startMonitoring()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        handler?.removeCallbacks(checkRunnable!!)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "App Blocker",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitoring app usage for task focus"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("IKYKIK - Focus Mode Active")
            .setContentText("Monitoring app usage. Complete your task to unlock apps.")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun startMonitoring() {
        handler = Handler(Looper.getMainLooper())
        checkRunnable = object : Runnable {
            override fun run() {
                checkCurrentApp()
                handler?.postDelayed(this, 1000) // Check every 1 second
            }
        }
        handler?.post(checkRunnable!!)
    }

    // Track which apps we've already shown overlay for (to avoid spamming)
    private var overlayShownFor = mutableSetOf<String>()

    private fun checkCurrentApp() {
        val blockedApps = sharedPrefs.getStringSet("blockedApps", emptySet()) ?: return
        if (blockedApps.isEmpty()) {
            stopSelf()
            return
        }

        val currentApp = getForegroundApp()
        if (currentApp != null && blockedApps.contains(currentApp)) {
            // Reload usage stats to get latest (including simulated usage)
            loadUsageStats()
            
            // Check if 30 min window exceeded
            val totalMs = appUsageMap[currentApp] ?: 0L
            val totalMinutes = totalMs / 60000
            
            if (totalMinutes >= FREE_WINDOW_MINUTES) {
                // Only show overlay once per app (until they leave and come back)
                if (!overlayShownFor.contains(currentApp)) {
                    overlayShownFor.add(currentApp)
                    showBlockingOverlay(currentApp)
                }
            }
        } else {
            // User left blocked app - clear the shown tracker
            overlayShownFor.clear()
        }
        
        lastCheckTime = System.currentTimeMillis()
    }

    private fun getForegroundApp(): String? {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        
        val events = usageStatsManager.queryEvents(now - 5000, now)
        var currentApp: String? = null
        
        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                currentApp = event.packageName
            }
        }
        
        return currentApp
    }

    private fun showBlockingOverlay(packageName: String) {
        if (Settings.canDrawOverlays(this)) {
            val intent = Intent(this, BlockingOverlayService::class.java)
            intent.putExtra("blockedPackage", packageName)
            startService(intent)
        }
    }

    private fun loadUsageStats() {
        try {
            val json = sharedPrefs.getString("appUsageStats", "{}")
            val jsonObj = JSONObject(json)
            val keys = jsonObj.keys()
            appUsageMap.clear()
            while (keys.hasNext()) {
                val key = keys.next()
                appUsageMap[key] = jsonObj.getLong(key)
            }
        } catch (e: Exception) {
            appUsageMap = mutableMapOf()
        }
    }

    private fun saveUsageStats() {
        val jsonObj = JSONObject()
        appUsageMap.forEach { (pkg, usage) ->
            jsonObj.put(pkg, usage)
        }
        sharedPrefs.edit().putString("appUsageStats", jsonObj.toString()).apply()
    }
}
