package com.yadhugowda.ikykikexpo.appblocker

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val sharedPrefs = reactContext.getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE)

    override fun getName(): String = "AppBlockerModule"

    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        try {
            val appOpsManager = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOpsManager.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactApplicationContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOpsManager.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactApplicationContext.packageName
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
    }

    @ReactMethod
    fun requestOverlayPermission() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${reactApplicationContext.packageName}")
        )
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
            val result = Arguments.createArray()

            for (app in packages) {
                // Show user-installed apps only
                if (app.flags and ApplicationInfo.FLAG_SYSTEM == 0) {
                    val appInfo = Arguments.createMap()
                    appInfo.putString("packageName", app.packageName)
                    appInfo.putString("appName", pm.getApplicationLabel(app).toString())
                    result.pushMap(appInfo)
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun startBlocking(blockedApps: ReadableArray, taskId: String, promise: Promise) {
        try {
            val apps = mutableListOf<String>()
            for (i in 0 until blockedApps.size()) {
                blockedApps.getString(i)?.let { apps.add(it) }
            }
            
            sharedPrefs.edit()
                .putStringSet("blockedApps", apps.toSet())
                .putString("activeTaskId", taskId)
                .putLong("blockStartTime", System.currentTimeMillis())
                .apply()

            val intent = Intent(reactApplicationContext, AppBlockerService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopBlocking(promise: Promise) {
        try {
            sharedPrefs.edit()
                .remove("blockedApps")
                .remove("activeTaskId")
                .remove("blockStartTime")
                .apply()

            val intent = Intent(reactApplicationContext, AppBlockerService::class.java)
            reactApplicationContext.stopService(intent)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getAppUsageStats(promise: Promise) {
        try {
            val usageJson = sharedPrefs.getString("appUsageStats", "{}")
            promise.resolve(usageJson)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getBlockingStatus(promise: Promise) {
        try {
            val blockedApps = sharedPrefs.getStringSet("blockedApps", emptySet())
            val taskId = sharedPrefs.getString("activeTaskId", null)
            val startTime = sharedPrefs.getLong("blockStartTime", 0)

            val result = Arguments.createMap()
            result.putBoolean("isActive", !blockedApps.isNullOrEmpty())
            result.putString("taskId", taskId)
            result.putDouble("startTime", startTime.toDouble())
            
            val appsArray = Arguments.createArray()
            blockedApps?.forEach { appsArray.pushString(it) }
            result.putArray("blockedApps", appsArray)

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }
}
