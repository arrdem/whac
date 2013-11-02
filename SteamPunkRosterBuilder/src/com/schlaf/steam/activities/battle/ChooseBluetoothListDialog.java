/**
 * 
 */
package com.schlaf.steam.activities.battle;

import java.util.List;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ListView;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.adapters.BluetoothDeviceRowAdapter;
import com.schlaf.steam.bluetooth.DeviceVO;

/**
 * 
 * choose an existing bluetooth device to share army
 * 
 * @author S0085289
 *
 */
public class ChooseBluetoothListDialog extends SherlockDialogFragment implements OnItemClickListener {

	public interface ChooseBlueToothDeviceListener {
		public void onDeviceSelected(DeviceVO device);
		
		public List<DeviceVO> getCandidateDevices();
	}
	
	private ChooseBlueToothDeviceListener mListener;
	private ListView listView;
	BluetoothDeviceRowAdapter adapter;
	
    // Override the Fragment.onAttach() method to instantiate the NoticeDialogListener
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        // Verify that the host activity implements the callback interface
        try {
            // Instantiate the NoticeDialogListener so we can send events to the host
            mListener = (ChooseBlueToothDeviceListener) activity;
        } catch (ClassCastException e) {
            // The activity doesn't implement the interface, throw exception
            throw new ClassCastException(activity.toString()
                    + " must implement ChooseBlueToothDeviceListener");
        }
    }
    
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Choose bluetooth pair");
		
		builder.setNegativeButton("Cancel",
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {
						// User cancelled the dialog
					}
				});
		
		LayoutInflater inflater = getActivity().getLayoutInflater();
	    // Inflate and set the layout for the dialog
	    // Pass null as the parent view because its going in the dialog layout
	    
		// Create the AlertDialog object and return it
	    View view = inflater.inflate(R.layout.choose_bluetooth_device_list, null);
	    
	    listView = (ListView) view.findViewById(R.id.listView1);		
		adapter = new BluetoothDeviceRowAdapter(getActivity(), getData());
		listView.setAdapter(adapter);
		listView.setOnItemClickListener(this);

	    builder.setView(view);
		return builder.create();
	}
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		// l'affichage de chaque ligne est dédiée par un adapteur spécifique
	}

	@Override
	public void onItemClick(AdapterView<?> parent, View view, int position,
			long id) {
		DeviceVO descriptor = (DeviceVO) listView.getItemAtPosition(position);
		mListener.onDeviceSelected(descriptor);
		dismiss();
	}
	
	
	public List<DeviceVO> getData() {
		return mListener.getCandidateDevices();
	}
			
}
