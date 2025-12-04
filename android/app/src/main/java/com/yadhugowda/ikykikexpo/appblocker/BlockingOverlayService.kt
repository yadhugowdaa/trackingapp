package com.yadhugowda.ikykikexpo.appblocker

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class BlockingOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var blockedPackage: String? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        blockedPackage = intent?.getStringExtra("blockedPackage")
        showOverlay()
        return START_NOT_STICKY
    }

    private fun showOverlay() {
        if (overlayView != null) return

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        // Create overlay view programmatically
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
        }
    }

    private fun createOverlayView(): View {
        // Create a simple blocking view programmatically
        val context = this
        val layout = android.widget.LinearLayout(context).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(0xF0121218.toInt()) // Dark background with 94% opacity
            setPadding(60, 60, 60, 60)
        }

        // Lock icon (using emoji as fallback)
        val lockIcon = TextView(context).apply {
            text = "🔒"
            textSize = 72f
            gravity = Gravity.CENTER
        }
        layout.addView(lockIcon)

        // Title
        val title = TextView(context).apply {
            text = "APP LOCKED"
            textSize = 28f
            setTextColor(0xFFFFFFFF.toInt())
            gravity = Gravity.CENTER
            setPadding(0, 40, 0, 20)
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }
        layout.addView(title)

        // Message
        val message = TextView(context).apply {
            text = "You've used your 30-minute free window.\n\nComplete your task in IKYKIK to unlock this app."
            textSize = 16f
            setTextColor(0xAAFFFFFF.toInt())
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 40)
        }
        layout.addView(message)

        // Open IKYKIK button
        val openButton = Button(context).apply {
            text = "Open IKYKIK"
            textSize = 16f
            setPadding(60, 30, 60, 30)
            setOnClickListener {
                openIKYKIK()
            }
        }
        layout.addView(openButton)

        // Dismiss button (temporary - goes away after 3 seconds)
        val dismissButton = Button(context).apply {
            text = "Dismiss (5 sec reminder)"
            textSize = 14f
            setBackgroundColor(0x00000000)
            setTextColor(0x88FFFFFF.toInt())
            setPadding(0, 40, 0, 0)
            setOnClickListener {
                hideOverlayTemporarily()
            }
        }
        layout.addView(dismissButton)

        return layout
    }

    private fun openIKYKIK() {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }
        hideOverlay()
    }

    private fun hideOverlayTemporarily() {
        hideOverlay()
        // Show again after 5 seconds if still in blocked app
        Handler(Looper.getMainLooper()).postDelayed({
            showOverlay()
        }, 5000)
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
        hideOverlay()
    }
}
