package com.aimacrobot.accessibility;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.accessibilityservice.GestureDescription;
import android.content.Intent;
import android.graphics.Path;
import android.graphics.Point;
import android.os.Bundle;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;
import java.util.List;

public class MacroAccessibilityService extends AccessibilityService {
    private static final String TAG = "AIMacroBot";
    private static MacroAccessibilityService instance;

    @Override
    public void onCreate() { super.onCreate(); instance = this; }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_REQUEST_TOUCH_EXPLORATION_MODE
                | AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
                | AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
                | AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS;
        info.notificationTimeout = 100;
        setServiceInfo(info);
    }

    @Override
    public void onDestroy() { instance = null; super.onDestroy(); }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        switch (event.getEventType()) {
            case AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED:
                String pkg = event.getPackageName() != null ? event.getPackageName().toString() : "";
                CharSequence text = event.getText() != null && !event.getText().isEmpty() ? event.getText().get(0) : "";
                Intent intent = new Intent("com.aimacrobot.NOTIFICATION_RECEIVED");
                intent.putExtra("packageName", pkg);
                intent.putExtra("text", text.toString());
                sendBroadcast(intent);
                break;
            case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED:
                String wpkg = event.getPackageName() != null ? event.getPackageName().toString() : "";
                Intent wi = new Intent("com.aimacrobot.WINDOW_CHANGED");
                wi.putExtra("packageName", wpkg);
                sendBroadcast(wi);
                break;
        }
    }

    @Override
    public void onInterrupt() {}

    public static MacroAccessibilityService getInstance() { return instance; }
    public static boolean isServiceEnabled() { return instance != null; }

    public AccessibilityNodeInfo findNodeByText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return null;
        List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByText(text);
        root.recycle();
        return nodes != null && !nodes.isEmpty() ? nodes.get(0) : null;
    }

    public AccessibilityNodeInfo findNodeById(String resourceId) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return null;
        List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByViewId(resourceId);
        root.recycle();
        return nodes != null && !nodes.isEmpty() ? nodes.get(0) : null;
    }

    public boolean performClick(AccessibilityNodeInfo node) {
        if (node == null) return false;
        if (node.isClickable()) return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
        AccessibilityNodeInfo parent = node.getParent();
        if (parent != null && parent.isClickable()) {
            boolean result = parent.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            parent.recycle();
            return result;
        }
        return false;
    }

    public boolean performLongClick(AccessibilityNodeInfo node) {
        if (node == null) return false;
        return node.performAction(AccessibilityNodeInfo.ACTION_LONG_CLICK);
    }

    public boolean performSetText(AccessibilityNodeInfo node, String text) {
        if (node == null || text == null) return false;
        Bundle args = new Bundle();
        args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
    }

    public boolean performHumanizedTyping(AccessibilityNodeInfo node, String text, long charDelayMs) {
        if (node == null || text == null) return false;
        node.performAction(AccessibilityNodeInfo.ACTION_FOCUS);
        for (int i = 0; i < text.length(); i++) {
            Bundle args = new Bundle();
            args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text.substring(0, i + 1));
            node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
            try { Thread.sleep(charDelayMs); } catch (InterruptedException e) { break; }
        }
        return true;
    }

    public boolean performSwipe(float fromX, float fromY, float toX, float toY, long durationMs) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.N) return false;
        Path path = new Path();
        path.moveTo(fromX, fromY);
        path.lineTo(toX, toY);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, durationMs));
        return dispatchGesture(builder.build(), null, null);
    }

    public boolean performScroll(AccessibilityNodeInfo node, String direction) {
        if (node == null) return false;
        int action = "up".equalsIgnoreCase(direction) 
            ? AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD 
            : AccessibilityNodeInfo.ACTION_SCROLL_FORWARD;
        if (node.isScrollable()) return node.performAction(action);
        return false;
    }

    public Point getScreenSize() {
        Point size = new Point();
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1) {
            getWindowManager().getDefaultDisplay().getRealSize(size);
        }
        return size;
    }

    public boolean performHome() { return performGlobalAction(GLOBAL_ACTION_HOME); }
    public boolean performBack() { return performGlobalAction(GLOBAL_ACTION_BACK); }
    public boolean performOpenNotifications() { return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS); }
    public boolean performTakeScreenshot() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            return performGlobalAction(GLOBAL_ACTION_TAKE_SCREENSHOT);
        }
        return false;
    }
}
