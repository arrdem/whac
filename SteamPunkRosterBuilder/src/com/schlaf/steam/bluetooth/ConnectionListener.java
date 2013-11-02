package com.schlaf.steam.bluetooth;

import java.io.IOException;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.util.Log;

/**
 * Thread that handles incoming Bluetooth connections
 * 
 * @author Gober
 */
public class ConnectionListener extends Thread {

	/** Describes the service */

	private BluetoothAdapter btAdapter;
	private boolean aborted;
	private DeviceManager dm;
	private boolean notifierOpen = false;
	private BluetoothServerSocket serverSocket;
	private String TAG = "ConnectionListener";
	private String TAG2 = ConnectionListener.class.getName();
	private BluetoothSocket conn;

	public ConnectionListener(DeviceManager dm) {

		try {
			this.dm = dm;
			btAdapter = BluetoothAdapter.getDefaultAdapter();
			notifierOpen = false;
			openNotifier();
		} catch (Exception ex) {
			Log.e(TAG,
					"Error in ConnectionListener constructor:"
							+ ex.getMessage());
			ex.printStackTrace();
		}
	}

	/**
	 * returns connection address
	 * 
	 * @return address as string (URL's not used in Android bluetooth)
	 */
	public String getConnectionURL() {
		return btAdapter.getAddress();
	}

	public void run() {
		aborted = false;
		while (!aborted && !interrupted()) {
			try {
				if (dm.numberOfNeighbours() >= BlueToothDatalink.MAX_OUT_DEGREE) {
					closeNotifier();
					sleep(3000);
				} else {
					sleep(1000);
					openNotifier();
					if (serverSocket == null) {
						Log.e(TAG, TAG2 + " : Serversocket is null, retrying");
						sleep(20000);
						openServerSocket();
					}
					Log.d(TAG, "Serversocket accept started");
					conn = serverSocket.accept();
					btAdapter.cancelDiscovery();
					if (conn == null)
						Log.e(TAG, TAG2 + " : Connection accepted is null...?");
					// TODO aren't we doing this check twice.. Remove it..
					if (dm.numberOfNeighbours() >= BlueToothDatalink.MAX_OUT_DEGREE) {
						conn.close();
						Log.d(TAG, TAG2 + " : Denied incoming connection, "
								+ "" + "too many neigbours");
					} else {
						Log.d(TAG, TAG2
								+ " : Acceped incoming connection, handling");
						dm.handleNewIncomingConnection(conn);
					}
				}
			} catch (Exception e) {
				Log.d(TAG, TAG2 + " : Exception:" + e.getMessage(), e);
				e.printStackTrace();
			}
		}
		aborted = true;
		if (serverSocket != null)
			try {
				serverSocket.close();
			} catch (IOException e) {
				Log.e("TAG", "Socket not closed", e);
			} finally {
			}
	}

	private void openNotifier() {
		// create notifier now
		if (!notifierOpen) {
			// if we are not discoverable, make us discoverable
			// requestDiscoverable();
			openServerSocket();
		}
		notifierOpen = true;
	}

	/**
	 * Opens a Bluetooth serversocket, listening for incoming Beddernet
	 * connections
	 */
	private void openServerSocket() {
		Log.d(TAG, "Open server socket");
		try {
			serverSocket = btAdapter.listenUsingRfcommWithServiceRecord(
					BeddernetInfo.SDP_RECORD_NAME,
					BeddernetInfo.BT_NETWORK_UUID);
		} catch (IOException e) {
			Log.e(TAG, "Could not open serverSocket: " + e.getMessage());
			e.printStackTrace();
		}
	}


	private void closeNotifier() {
		if (serverSocket != null) {
			try {
				notifierOpen = false;
				serverSocket.close();
				serverSocket = null;

			} catch (Exception ex) {
				Log.e(TAG, "CloseNotifier failed: " + ex.getMessage());
			}
		}
	}

	public void abort() {
		try {
			this.aborted = true;
			if (conn != null) {
				conn.close(); // IS nulled in finnaly
				conn = null;
			}
			closeNotifier();
			Log.d(TAG, "Connectionlisterner aborting..");
		} catch (Exception ex) {
			Log.e(TAG, "ConnectionListerner abort failed", ex);
		}
	}
}
