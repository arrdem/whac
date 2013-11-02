package com.schlaf.steam.bluetooth;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Binder;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.RemoteException;
import android.util.Log;

import com.schlaf.steam.activities.battle.BattleCommunicationObject;

public class MyBeddernetService extends Service implements MessageObserver,
		DeviceObserver {

	private final static String TAG = "MyBeddernetService";

	private final IBinder mBinder = new MyBinder();

	private final BlueToothDatalink dataLink = new BlueToothDatalink();
	private final DeviceManager deviceManager = new DeviceManager(this, this,
			dataLink);
	
	// The BroadcastReceiver that listens for discovered devices and
	// changes the title when discovery is finished
	private final BroadcastReceiver mReceiver = new DiscoveryReceiver(this);

	// handler of parent activity
	Handler mHandler;
	
	private String lastDeviceConnected;

	@Override
	public IBinder onBind(Intent arg0) {
		return mBinder;
	}

	@Override
	public void onCreate() {
		
		
		// setDiscoverable(true);
		
        IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
        this.registerReceiver(mReceiver, filter);
        filter = new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
        this.registerReceiver(mReceiver, filter);
        filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
        this.registerReceiver(mReceiver, filter);
        filter = new IntentFilter(BluetoothAdapter.ACTION_SCAN_MODE_CHANGED);
        this.registerReceiver(mReceiver, filter);
        

		
		dataLink.connectToNetwork(this, this);
	}

	public class MyBinder extends Binder {
		public MyBeddernetService getService() {
			return MyBeddernetService.this;
		}
	}

	public void activateBT(boolean activate) {
		Log.d(TAG, "setDiscoverable called");

		if ( ! BluetoothAdapter.getDefaultAdapter().isEnabled()) {
			Log.e(TAG, "BT not activated, manually requested activation");

			Intent discoverableIntent = new Intent(
					BluetoothAdapter.ACTION_REQUEST_ENABLE);
			discoverableIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			startActivity(discoverableIntent);
		}
	}
	
	public void setDiscoverable(boolean discoverable) {
		Log.d(TAG, "setDiscoverable called");

		if (BluetoothAdapter.getDefaultAdapter().getState() != BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE) {
			Log.e(TAG, "Not discoverable, manually requested discoverable");

			Intent discoverableIntent = new Intent(
					BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
			discoverableIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			discoverableIntent.putExtra(
					BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
			startActivity(discoverableIntent);
		}
	}

	public void findNeighbors() {
		Log.d(TAG, "findNeighbors called");
		dataLink.searchNewConnections();

	}
	
	public void sendMessage(DeviceVO device, BattleCommunicationObject msg) {
		dataLink.sendMessage(device.getBtAddress(), msg);
	}

	public void manualConnect(String remoteAddress) throws RemoteException {
		dataLink.manualConnect(remoteAddress);
	}

	public void disableBluetooth() throws RemoteException {
		BluetoothAdapter.getDefaultAdapter().disable();
	}

	@Override
	public void onDestroy() {
		// Toast.makeText(this, "BEDNet service stopping", Toast.LENGTH_LONG)
		// .show();
		Log.d(TAG, "Service onDestroy");
		// Abort all running threads
		// ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).cancel(HELLO_ID);
		dataLink.disconnectNetwork();
		System.gc();
		this.stopSelf();
		super.onDestroy();
	}

	@Override
	public void receiveMessage(BattleCommunicationObject msg) {
		Log.d(TAG, "received msg : " + msg.toString());
		
		// tell the activity we received a message
        mHandler.obtainMessage(BlueToothConstants.MESSAGE_READ, msg).sendToTarget();
		
	}

	@Override
	public void updateDevice(DeviceVO device) {
		Log.d(TAG, "received update device info : " + device.toString());
		
		lastDeviceConnected = device.getBtAddress();
		
		// tell the activity to send the list
		Message msg = mHandler
				.obtainMessage(BlueToothConstants.MESSAGE_DEVICE_NAME);
		Bundle bundle = new Bundle();
		bundle.putString(BlueToothConstants.DEVICE_NAME, device.getBtAddress());
		msg.setData(bundle);
		mHandler.sendMessage(msg);		
	}

	public void registerHandler(Handler mHandler) {
		this.mHandler = mHandler;
	}

	public void notifyDiscoveryFinished() {
		mHandler.obtainMessage(BlueToothConstants.DISCOVERY_FINISHED).sendToTarget();
	}

	public void notifyDeviceFound() {
		mHandler.obtainMessage(BlueToothConstants.DEVICE_FOUND).sendToTarget();
	}

	public void notifyBTOff() {
		dataLink.btStatus(false);
		mHandler.obtainMessage(BlueToothConstants.BT_OFF).sendToTarget();
	}

	public void notifyBTOn() {
		dataLink.btStatus(true);
		mHandler.obtainMessage(BlueToothConstants.BT_ON).sendToTarget();
	}

	public List<DeviceVO> getAvailableDevices() {
		Hashtable<String, DeviceVO> devices = deviceManager.getDeviceTable();
		List<DeviceVO> deviceList = new ArrayList<DeviceVO>();
		for (DeviceVO device : devices.values()) {
			deviceList.add(device);
		}
		return deviceList;

	}
	
	
}
