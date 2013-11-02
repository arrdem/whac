/**
 * 
 */
package com.schlaf.steam.adapters;

import java.util.List;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.schlaf.steam.R;
import com.schlaf.steam.bluetooth.DeviceVO;

/**
 * classe permettant de mapper une entrée de faction dans une liste de sélection
 * @author S0085289
 *
 */
public class BluetoothDeviceRowAdapter extends ArrayAdapter<DeviceVO> {
	
	  private final Context context;
	  private final List<DeviceVO> devices;

	  public BluetoothDeviceRowAdapter(Context context,  List<DeviceVO> devices) {
	    super(context, R.layout.device_selection, devices);
	    this.context = context;
	    this.devices = devices;
	  }

	  @Override
	  public View getView(int position, View convertView, ViewGroup parent) {
	    LayoutInflater inflater = (LayoutInflater) context
	        .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
	    
	    if (convertView == null) {
		    convertView = inflater.inflate(R.layout.device_selection, parent, false);
	    }
	    TextView name = (TextView) convertView.findViewById(R.id.device_name);
	    name.setText(devices.get(position).getName());
	    TextView adress = (TextView) convertView.findViewById(R.id.device_adress);
	    adress.setText(devices.get(position).getBtAddress());

	    return convertView;
	  }
	  
	
}
