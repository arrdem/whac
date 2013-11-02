package com.schlaf.steam.bluetooth;

import java.io.IOException;
import java.util.UUID;
import java.util.Vector;

import com.schlaf.steam.activities.battle.BattleCommunicationObject;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.util.Log;

//import android.bluetooth.BluetoothAdapter;
//import android.bluetooth.BluetoothDevice;
//import android.bluetooth.BluetoothSocket;

/**
 * Main class for the bluetooth datalink layer implements DatalinkInterface to
 * allow communication from the Router layer.
 * 
 * @author Gober
 */
public class BlueToothDatalink {
	private BluetoothAdapter btAdapter;
	private String myAddress; // adress of this device
	private DeviceManager dm;
	private DeviceFinder df;
	private ConnectionListener cl;
	private Thread dfThread = null; // device finder thread
	private Thread clThread = null; // connection listener thread
	
	// singleton instance
	private static BlueToothDatalink dataLinkInstance;
	
	public static UUID BT_NETWORK_UUID = UUID
			.fromString("a6f91a16-047c-4e18-a4d7-3f87a779aaf0");

	// Max number of neighbors to connect to.
	// This is hard coded now, should be based on device where possible like so:
	// Integer.parseInt(LocalDevice.getProperty("bluetooth.connected.devices.max"));
	public static int MAX_OUT_DEGREE = 7;
	private static String TAG = "BlueToothDatalink";
	public boolean stillWaitingForBT = true;
	public static String myConnectionURL = "";

	/**
	 * Constructor stores general information about this device to be used later
	 */
	public BlueToothDatalink() {
		dataLinkInstance = this;
		try {
			btAdapter = BluetoothAdapter.getDefaultAdapter();
		} catch (Exception e) {
			Log.d(TAG,
					"Problem with starting bluetooth default adapter"
							+ e.getMessage());
		}
	}

	/**
	 * Starts the bluetooth radio and enables the setup of BEDnet
	 */
	public void setup() {
		if (!btAdapter.isEnabled()) {
			Log.d(TAG, "BT is off. Start an activity");
			Intent enableIntent = new Intent(
					BluetoothAdapter.ACTION_REQUEST_ENABLE);
			enableIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		} 
	}

	/**
	 * @return The network address of this device
	 */
	public String getNetworkAddress() {
		Log.d(TAG, "BluetoothDatalink: networkAddress requested");
		return myAddress;
	}

	public boolean isDiscovering() {
		return df.discovering;
	}

	/**
	 * Method used to setup the network on the data-link level and connect to
	 * surrounding devices
	 * 
	 * @param rtrIncPcktObs
	 *            Observer in router layer to be notified about new incoming
	 *            packets
	 * @param rtrNeighbourObs
	 *            Observer in router layer to be notified about changes in
	 *            connected neighbours
	 */
	public synchronized void connectToNetwork(DeviceObserver deviceObserver, MessageObserver messageObserver) {
		try {
			// Start device manager
			dm = new DeviceManager(deviceObserver, messageObserver, this);

			// Prepare Device finder
			df = new DeviceFinder(btAdapter, dm);

			// Start listening for incoming connections
			startListeningForConnection();
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * Creates and starts a ConnectionListener that listens for incoming
	 * connections.
	 */
	public void startListeningForConnection() {
		Log.i(TAG, "BluetoothDatalink: Start Listening for connections");
		cl = new ConnectionListener(dm);
		myConnectionURL = cl.getConnectionURL();
		clThread = new Thread(cl);
		clThread.start();
	}

	public void stopListeningForConnection() {
		Log.i(TAG, "BluetoothDatalink: Stop Listening for connections");
		cl.abort();
	}

	/**
	 * Closes all running threads and all open connections to disconnect from
	 * the network
	 */
	public void disconnectNetwork() {
		cl.abort();
		dm.abort();
	}

	/**
	 * Method to send packets to a given Network Address. If an attempt to send
	 * to a neighbour failes it performs actions to remove it from the neighbour
	 * list
	 * 
	 * @param na
	 *            The address to send to
	 * @param pckt
	 *            The packet to send
	 */
	public synchronized boolean sendMessage(String adress, BattleCommunicationObject msg) {
		return dm.sendPacket(adress, msg);
	}

	/**
	 * Initiates a new device discovery unless one is already running.
	 */
	public synchronized long searchNewConnections() {
		// stopListeningForConnection();
		if (dm.numberOfNeighbours() < MAX_OUT_DEGREE) {
			try {
				// cl.abort();
				// clThread.join();
				dfThread = new Thread(df);
				dfThread.start();
				// dfThread.join();
				// new Thread(cl).start();

				if (dm.numberOfNeighbours() == 0) {
					return df.getLastDiscoveryTime();
				}
			} catch (Exception ex) {
				ex.printStackTrace();
			}
		}
		// startListeningForConnection();
		return -1;

	}

	/**
	 * Debug code, attempts to establish a connection to a specific address
	 * 
	 * @return
	 */
	public synchronized long manualConnect(String remoteAddress) {

		BluetoothDevice other = btAdapter.getRemoteDevice(remoteAddress);
		btAdapter.cancelDiscovery();
		BluetoothSocket socket = null;
		try {
			socket = other.createRfcommSocketToServiceRecord(BT_NETWORK_UUID);
		} catch (IOException e) {
			Log.e(TAG, "Datalink: could not create socket to device", e);
		}
		try {
			socket.connect();
			Log.i(TAG, "Connected with device manually");
		} catch (IOException e) {
			Log.e(TAG, "Datalink: could not connect to device", e);
			e.printStackTrace();
			return 0; // error;
		}
		Vector<BluetoothSocket> fakeVector = new Vector<BluetoothSocket>(1);
		fakeVector.add(socket);
		dm.handleNewlyDiscoveredConnections(fakeVector);
		return -1;
	}

	public void breakConn(String address) {
		try {
			dm.handleBrokenConnection(address);
		} catch (Exception ex) {
			Log.e(TAG, "Datalink: Error in breaking connection");
		}
	}

	public String getStatus(long dest) {
		return dm.getDeviceStatus(dest);
	}

	public String getConnectionString() {
		return cl.getConnectionURL();
	}

	public void connect(String addres) {
		try {
			BluetoothSocket conn = btAdapter.getRemoteDevice(addres)
					.createRfcommSocketToServiceRecord(BT_NETWORK_UUID);
			conn.connect();
			Log.i(TAG,
					"BluetoothDatalink : connect called, will send to handle new connection");
			dm.handleNewIncomingConnection(conn);
		} catch (Exception e) {
			Log.e(TAG, "Datalink: Error in manual connection", e);
		}
	}

	/**
	 * Static method for returning
	 * 
	 * @return bluetooth active datalink, null if none are found
	 */
	public static BlueToothDatalink getBluetoothDatalinkInstance() {
		if (dataLinkInstance == null) {
			Log.e(TAG, "Instance of BluetoothDatalink requested, none found");
			return null;
		} else
			return dataLinkInstance;

	}

	public int numberOfNeighbours() {
		return dm.numberOfNeighbours();
	}

	public void btStatus(boolean b) {
		// TODO Auto-generated method stub
		
	}

}
