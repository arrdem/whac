package com.schlaf.steam.bluetooth;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Vector;

import com.schlaf.steam.activities.battle.BattleCommunicationObject;

import android.bluetooth.BluetoothSocket;
import android.util.Log;

/**
 * Class handles tables of all devices found and devices that are connected
 *
 * @author Gober  
 */
public class DeviceManager {

        Hashtable<String, DeviceVO> deviceTable;
        Hashtable<String, String> deviceStatus;

        private String TAG = BeddernetInfo.TAG;
        private DeviceObserver deviceManagerObserver;
        private MessageObserver messageIncomingObserver;

        public DeviceManager(DeviceObserver deviceObserver, MessageObserver incomingMessageObserver, BlueToothDatalink bluetoothDatalink) {
                deviceTable = new Hashtable<String, DeviceVO>();
                deviceStatus = new Hashtable<String, String>();
                this.deviceManagerObserver = deviceObserver;
                this.messageIncomingObserver = incomingMessageObserver;

        }

        public boolean connectionExists(String address) {
                if (deviceTable.containsKey(address))
                        return true;
                else
                        return false;
        }

        /**
         * Handles new incoming connections, sets status as "Slave" as it is assumed
         * the connection was initiated by external device and is master
         * Does not check if connection already exists
         *
         * @param conn the connection to handle
         */
        public synchronized void handleNewIncomingConnection(BluetoothSocket conn) {
                String address = conn.getRemoteDevice().getAddress();
                
                DeviceVO device = new DeviceVO(address, conn, messageIncomingObserver, this);

                deviceTable.put(address, device);
                new Thread(device).start();
                deviceStatus.put(address, "Slave");
                
                deviceManagerObserver.updateDevice(device);
                
                Log.i(TAG, "New slave added:" + address);
                neighbourTableChanged();
        }

        /**
         * Handles connections that have been initiated on device
         * Designates connections "Master" i.e. assumes local device is Master
         * @param conns Vector with new bluetooth sockets to handle
         */
        public synchronized void handleNewlyDiscoveredConnections(
                        Vector<BluetoothSocket> conns) {
                Log.d(TAG, "DeviceManager: Handle new connections called, conns size: "
                                + conns.size());
                BluetoothSocket socket;
                String bt;
                for (int i = 0; i < conns.size(); i++) {
                        socket = conns.elementAt(i);
                        bt = socket.getRemoteDevice().getAddress();
                        deviceStatus.put(bt, "Master");
                        DeviceVO device = new DeviceVO(bt, socket, messageIncomingObserver, this);
                        new Thread(device).start();
                        deviceTable.put(bt, device);
                        
                        deviceManagerObserver.updateDevice(device);
                }
                neighbourTableChanged();
        }

 
        /**
         * If the PacketSender attempts to send a packet on an open connection, and
         * the connection is broken, this method will close the connection and
         * remove the device from the list of connected neighbours, alerting all
         * observers of the change
         *
         * @param BTA
         *            the bt-address of the device with broken connection
         */
        public synchronized void handleBrokenConnection(String address) {

        		DeviceVO temp = deviceTable.get(address);
                if (temp != null) {
                        deviceTable.get(address).close();
                        deviceTable.remove(address);
                        deviceStatus.remove(address);
                        neighbourTableChanged();
                        deviceManagerObserver.updateDevice(temp);
                }
        }

        /**
         * Counts the number of connected neighbours
         *
         * @return number of neighbours
         */
        public synchronized int numberOfNeighbours() {
                return deviceTable.size();
        }

        public Hashtable<String, DeviceVO> getDeviceTable() {
                return deviceTable;
        }


        public boolean exists(String address) {
        		DeviceVO dvo = deviceTable.get(address);
                if (dvo == null)
                        return false;
                else
                        return true;
        }

        /**
         * Calls all the observers in the list and notifies them that the
         * neighbour-table is changed
         */
        private void neighbourTableChanged() {
                Log.d(TAG, "Device manager: neighbourTable changed");
                String[] addressArray = new String[deviceTable.size()];
                int i = 0;
                //Make an array of all currently connected bluetooth devices
                for (Enumeration<DeviceVO> e = deviceTable.elements(); e
                                .hasMoreElements();) {
                        addressArray[i++] = e.nextElement().getBtAddress();
                }
                //deviceManagerObserver.update(addressArray);
        }

        /**
         * Closes all connections and removes connected devices from neighbour list
         */
        public void abort() {
                for (Enumeration<DeviceVO> e = deviceTable.elements(); e
                                .hasMoreElements();) {
                        DeviceVO dvo = e.nextElement();
                        dvo.close();
                }
                deviceTable.clear();
        }

        public String getDeviceStatus(long dest) {
                String ret = (String) deviceStatus.get(dest);
                if (ret != null)
                        return ret;
                else
                        // not a neighbor .. return default value
                        return "X";
        }

        /**
         * Gets the device with the corresponding address
         * @param address the bluetooth address of the requested device
         * @return null if device is not in table, DeviceVO instance otherwise
         */
        public DeviceVO getDevice(long address) {
                return deviceTable.get(address);
        }

        /**
         * Sends message to recipient, should only be called from datalink
         * @param na Bluetooth address of recipient
         * @param pckt Beddernet message, serealized
         * @return
         */
        public boolean sendPacket(String adress, BattleCommunicationObject msg) {
                DeviceVO dvo = deviceTable.get(adress);
                if (dvo!= null){
                return dvo.write(msg);
                }
                Log.e(TAG, "Devicemanager -> sendPacket: DVO is null");
                return false;
        }
}
