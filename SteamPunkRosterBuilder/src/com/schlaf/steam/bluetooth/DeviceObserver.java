package com.schlaf.steam.bluetooth;

public interface DeviceObserver {

	/**
	 * notification of a modification/creation/deletion of device
	 * @param device
	 */
	public void updateDevice(DeviceVO device);
	
}
