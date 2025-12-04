package com.yadhugowda.ikykikexpo.appblocker

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Blocking Overlay Service - Elegant Design
 * 
 * Shows a native-looking dialog when a blocked app is opened after exceeding 30min usage.
 * Design inspired by Digital Wellbeing "App paused" dialog.
 * Shows the specific task name that triggered the block.
 */
class BlockingOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var blockedPackage: String? = null
    private lateinit var sharedPrefs: SharedPreferences

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        sharedPrefs = getSharedPreferences("AppBlockerPrefs", Context.MODE_PRIVATE)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        blockedPackage = intent?.getStringExtra("blockedPackage")
        
        if (isBlockingActive()) {
            showOverlay()
        } else {
            stopSelf()
        }
        
        return START_NOT_STICKY
    }

    private fun isBlockingActive(): Boolean {
        val blockedApps = sharedPrefs.getStringSet("blockedApps", emptySet())
        return !blockedApps.isNullOrEmpty() && blockedApps.contains(blockedPackage)
    }

    private fun getBlockedAppName(): String {
        try {
            val pm = packageManager
            val appInfo = pm.getApplicationInfo(blockedPackage ?: "", 0)
            return pm.getApplicationLabel(appInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            return "This app"
        }
    }

    private fun getTaskName(): String {
        // Get the task name from SharedPreferences (stored when blocking started)
        return sharedPrefs.getString("activeTaskName", "your pending task") ?: "your pending task"
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            resources.displayMetrics
        ).toInt()
    }

    private fun showOverlay() {
        if (overlayView != null) return

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        overlayView = createOverlayView()

        val layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )
        layoutParams.gravity = Gravity.CENTER

        try {
            windowManager?.addView(overlayView, layoutParams)
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
        }
    }

    private fun createOverlayView(): View {
        val context = this
        val appName = getBlockedAppName()
        val taskName = getTaskName()

        // Main container - semi-transparent dark background (like blur effect)
        val container = FrameLayout(context).apply {
            setBackgroundColor(0xCC000000.toInt()) // 80% black opacity - simulates blur
            setOnClickListener {
                // Tapping outside does nothing (user must choose an action)
            }
        }

        // White dialog card
        val dialog = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            
            // White rounded background
            val dialogBg = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dpToPx(28).toFloat()
            }
            background = dialogBg
            
            setPadding(dpToPx(24), dpToPx(28), dpToPx(24), dpToPx(20))
            elevation = dpToPx(8).toFloat()
        }

        // Dialog layout params (centered, with margins)
        val dialogParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.CENTER
            setMargins(dpToPx(32), 0, dpToPx(32), 0)
        }

        // Lock icon (hourglass/timer style using Unicode, not emoji)
        val iconView = TextView(context).apply {
            text = "⏸" // Pause symbol - clean, not emoji-like
            textSize = 32f
            setTextColor(0xFF1A73E8.toInt()) // Google blue
            gravity = Gravity.START
            setPadding(0, 0, 0, dpToPx(12))
        }
        dialog.addView(iconView)

        // Title - "App paused"
        val title = TextView(context).apply {
            text = "App paused"
            textSize = 20f
            setTextColor(0xFF202124.toInt()) // Dark gray
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            setPadding(0, 0, 0, dpToPx(12))
        }
        dialog.addView(title)

        // Message - shows task name
        val message = TextView(context).apply {
            text = "Complete \"$taskName\" before using $appName.\n\nYou've used your 30-minute free window for today."
            textSize = 14f
            setTextColor(0xFF5F6368.toInt()) // Medium gray
            setLineSpacing(dpToPx(4).toFloat(), 1f)
            setPadding(0, 0, 0, dpToPx(20))
        }
        dialog.addView(message)

        // Buttons container
        val buttonsContainer = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.END
        }

        // "Go Back" button
        val goBackButton = Button(context).apply {
            text = "Go Back"
            textSize = 14f
            setTextColor(0xFF1A73E8.toInt()) // Google blue
            setBackgroundColor(Color.TRANSPARENT)
            isAllCaps = false
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12))
            
            setOnClickListener {
                goBackToHome()
            }
        }
        buttonsContainer.addView(goBackButton)

        // "Open IKYKIK" button
        val openButton = Button(context).apply {
            text = "Open IKYKIK"
            textSize = 14f
            setTextColor(0xFF1A73E8.toInt()) // Google blue
            setBackgroundColor(Color.TRANSPARENT)
            isAllCaps = false
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            setPadding(dpToPx(16), dpToPx(12), dpToPx(16), dpToPx(12))
            
            setOnClickListener {
                openIKYKIK()
            }
        }
        buttonsContainer.addView(openButton)

        dialog.addView(buttonsContainer)

        container.addView(dialog, dialogParams)
        return container
    }

    private fun openIKYKIK() {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }
        hideOverlay()
    }

    private fun goBackToHome() {
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        hideOverlay()
    }

    private fun hideOverlay() {
        if (overlayView != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            overlayView = null
        }
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            overlayView = null
        }
    }
}
