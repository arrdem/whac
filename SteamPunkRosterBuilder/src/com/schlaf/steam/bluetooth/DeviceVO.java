package com.schlaf.steam.bluetooth;

import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;

import android.bluetooth.BluetoothSocket;
import android.util.Log;

import com.schlaf.steam.activities.battle.BattleCommunicationObject;

/**
 * Holds information about remote devices
 * 
 * @author Gober
 */
public class DeviceVO implements Runnable {

	private String btAddress; // adress of the device
	private String name; 
	private BluetoothSocket conn; // the connection socket
	private String TAG = BeddernetInfo.TAG;
	private MessageObserver messageInHandler;
	private DeviceManager deviceManager;
	private boolean aborted;
	private ObjectInputStream ois;
	private ObjectOutputStream oos;
	
	private boolean connected = false; 

	public DeviceVO(String btAddress, BluetoothSocket conn,
			MessageObserver messageReceivedHandler, DeviceManager deviceManager) {
		this.btAddress = btAddress;
		name = conn.getRemoteDevice().getName();
		this.conn = conn;
		this.messageInHandler = messageReceivedHandler;
		this.deviceManager = deviceManager;
		InputStream tmpIn = null;
		OutputStream tmpOut = null;
		aborted = false;
		// Get the BluetoothSocket input and output streams
		try {
			tmpIn = conn.getInputStream();
			tmpOut = conn.getOutputStream();
			ois = new ObjectInputStream(tmpIn);
			oos = new ObjectOutputStream(tmpOut);

		} catch (IOException e) {
			Log.e(TAG, "Device connection error, input/output not established",
					e);
		}

	}
	
	public String toString() {
		return "{DeviceVO : name = " + name + "; adress = " + btAddress + "}";
	}

	public String getBtAddress() {
		return btAddress;
	}

	public void setBtAddress(String btAddress) {
		this.btAddress = btAddress;
	}

	public BluetoothSocket getConn() {
		return conn;
	}
	
	public String getName() {
		return name;
	}

	public void close() {
		aborted = true;
		try {
			if (conn != null) {
				conn.close();
				conn = null;
			}
		} catch (Exception ex) {
			Log.e(TAG, "Device: " + btAddress
					+ " - Error in closing connection", ex);
		}
	}

	// run method is usually blocks on readInt from the input stream.
	public void run() {
		while (!aborted) {
			BattleCommunicationObject input;
			try {
				input = (BattleCommunicationObject) ois.readObject();
				Log.d(TAG, "Device: " + btAddress
						+ " - Message recieved in packetlistener");
				Log.d(TAG, "Device: " + btAddress
						+ "Default case in packetlistener");
				messageInHandler.receiveMessage(input); 
			} catch (IOException e) {
				Log.e(TAG, "Device: " + btAddress
						+ " - Error in reading from socket, quitting", e);
				deviceManager.handleBrokenConnection(btAddress);
				break;
			} catch (ClassNotFoundException e) {
				Log.e(TAG, "Device: " + btAddress
						+ " - Error in reading from socket with ClassNotFoundException, quitting", e);
			}
		}

	}

	// Syncronized to support multiple write threads
	// Currently only one write thread used
	public synchronized boolean write(BattleCommunicationObject msg) {
		try {
			oos.writeObject(msg);
			oos.flush();
			return true;
		} catch (Exception e) {
			// Connection lost. Packet not sent.
			Log.e(TAG,
					"DeviceVO: did not manage to send packet:" + e.getMessage(),
					e);
			e.printStackTrace();
			deviceManager.handleBrokenConnection(btAddress);
			return false;
		}
	}
}
